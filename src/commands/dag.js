module.exports = {
  name: 'dag',
  description: 'says hi to dagero',
  cooldown: 20,
  execute(message) {
    message.channel.send('hi dag');
  },
};
