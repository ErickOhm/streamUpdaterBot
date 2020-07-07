// TODO: UPDATE WHAT CATEGORY USERS RECEIVE STREAM UPDATES FROM
const db = require('monk')(process.env.MONGODB_URI)
const collection = db.get('document')
const Discord = require('discord.js');
const getGameID = require('../TwitchFetch/getGameID')

module.exports = {
  name: 'category',
  description: 'Change the category for your updates',
  usage: '<new category>',
  args: true,
  async execute(message, args) {
    let serverID = message.guild.id
    let game = args[0]
    let gameID = await getGameID(String(game))
    if (gameID.length) {
      collection.update({ ServerID: serverID }, { $set: { Category: gameID } }).then(() => {
        const successMessage = new Discord.MessageEmbed()
          .setColor('#2ecc71')
          .setTitle(`Successfully changed your category to ${game}`)
          .setURL(`https://www.twitch.tv/directory/game/${game}`)
        message.channel.send(successMessage)
        db.close()
      })
    } else {
      const errorMessage = new Discord.MessageEmbed()
        .setColor('#e74c3c')
        .setTitle('this category doesn\'t exist')
      return message.channel.send(errorMessage)
    }
  },
};
