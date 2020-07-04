module.exports = {
  name: 'stop',
  description: 'stops bot',
  execute(message) {
    if (message.author.id === process.env.CREATOR_ID) {
      process.exit()
    }
  },
};
