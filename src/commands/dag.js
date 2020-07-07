module.exports = {
  name: 'dag',
  description: 'says hi to dagero',
  execute(message) {
    message.channel.send('hi dag');
  },
};
