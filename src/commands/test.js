const Discord = require('discord.js')

module.exports = {
  name: 'test',
  description: 'test',
  usage: '!test',
  execute(message, args, client) {
    let channelID = '578314098610012160'
    client.channels.fetch(channelID).then((channel) => {
      channel.messages.fetch({ limit: 2 }).then(messages => {
        let arr = messages.array()
        console.log(arr[0].author.bot)
        console.log(arr[1].content)
        // let lastMessage = messages.first();
        // if (!lastMessage.author.bot) {
        //   // The author of the last message wasn't a bot
        // }
      })
    })
  },
};
