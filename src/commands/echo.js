module.exports = {
  name: 'echo',
  description: 'says what you say',
  usage: '!echo <text>',
  args: true,
  execute(message, args) {
    try {
      message.channel.send(args.join(' '));
    } catch (error) {
      console.error(error, message.channel)
    }
  },
};
