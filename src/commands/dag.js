module.exports = {
  name: "dag",
  description: "says hi to dagero",
  cooldown: 20,
  execute(message) {
    try {
      message.channel.send("hi dag");
    } catch (error) {
      console.error(error, message.channel);
    }
  },
};
