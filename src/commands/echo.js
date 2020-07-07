module.exports = {
  name: 'echo',
  description: 'says what you say',
  usage: '!echo <text>',
  args: true,
  execute(message, args) {
    message.channel.send(args.join(' '));
  },
};
