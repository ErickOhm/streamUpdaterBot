module.exports = {
  name: 'ping',
  description: 'Ping!',
  usage: '!ping',
  execute(message) {
    message.channel.send('Pong.');
  },
};
