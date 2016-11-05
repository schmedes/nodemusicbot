const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const musicQueue = [];
const accessToken = require('./accesstoken.js');
const streamOpt = {volume: 0.1};
let running = false;
let textChannel;
let dispatcher = null;
let pause = false;

const help = `-- !help - Show Commands
-- !music add <youtubelink> - Add link to queue
-- !music start - Starts the bot
-- !music stop - Stops the bot
-- !music pause - Pauses/Resumes the bot`;

client.on('ready', () => {
  textChannel = client.channels.find('name', 'general');
  client.channels.find('name', 'General').join();
  textChannel.sendMessage('Bot Running');
  textChannel.sendMessage(help);
});
 
client.on('message', message => {
  if(message.author === client.user) return;
  const shards = message.content.split(' ');
  if(shards[0] === '!help') textChannel.sendMessage(help);
  if(shards[0] === '!music') musicHandler(shards);
  });

function musicHandler(musicMessage) {
  switch(musicMessage[1]) {
    case 'start':
      running = true;
      textChannel.sendMessage('Music Starting');
      play();
      break;
    case 'stop':
      stop();
      break;
    case 'pause':
      pauseStream();
      break;
    case 'next':
      nextSong();
      break;
    case 'add':
      if((/https:\/\/www\.youtube\.com\/watch\?v=\w+/.test(musicMessage[2]))) {
        addToQueue(musicMessage[2]);
        textChannel.sendMessage('Music added');
        return;
      }
      textChannel.sendMessage('Wrong Input');
      break;
    default:
      textChannel.sendMessage('Wrong Input');
      break;
  }
}

function play() {

   const connection = client.voiceConnections.first();
   if(musicQueue.length === 0) {
     return;
   }
   const stream = musicQueue.shift();
   dispatcher = connection.playStream(stream, streamOpt);
   dispatcher.on('end', ()=>{
     if(running) play();
   });
}

function stop() {
  running = false;
  const connection = client.voiceConnections.first();
  dispatcher.end();
  textChannel.sendMessage('Music Stopped');
}

function pauseStream() {
  if(!pause) {
    dispatcher.pause();
    pause = true;
    return;
  }
  pause = false;
  dispatcher.resume();
}

function nextSong() {
  const connection = client.voiceConnections.first();
  dispatcher.end();
}

function addToQueue(link) {
     try{
      const stream = ytdl(link, {filter : 'audioonly'});
      musicQueue.push(stream);
     } catch(e) {
       textChannel.sendMessage('Link not working');
     }
}
 
client.login(accessToken);