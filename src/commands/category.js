// TODO: UPDATE WHAT CATEGORY USERS RECEIVE STREAM UPDATES FROM
const Discord = require('discord.js');
const getGameID = require('../TwitchFetch/getGameID')

module.exports = {
  name: 'categoryUpdate',
  description: 'Change the category for your updates',
  usage: '!category <new category>',
  aliases: ['category'],
  args: true,
  cooldown: 5,
  async execute(message, args,client,collection) {
    let serverID = message.guild.id
    let gameName = args.join(' ')
    let gameLink = args.join('%20')
    if (gameName.toLowerCase() == 'none') {
      collection.update({ ServerID: serverID }, { $set: { Category: 'none' } }).then(res => {
        const successMessage = new Discord.MessageEmbed()
          .setColor('#2ecc71')
          .setTitle('You will not receive category updates, make sure to add favorite streamers')
         
        try { return message.channel.send(successMessage) } catch (error) { console.error(error, message.channel) }
      })
    }
    let gameID = await getGameID(gameLink)
    if (gameID.length && gameName !== 'none') {
      collection.update({ ServerID: serverID }, { $set: { Category: gameID } }).then(() => {
        const successMessage = new Discord.MessageEmbed()
          .setColor('#2ecc71')
          .setTitle(`Successfully changed your category to ${gameName}`)
          .setURL(`https://www.twitch.tv/directory/game/${gameLink}`)
        try { message.channel.send(successMessage) } catch (error) { console.error(error, message.channel) }
         
      })
    } else if (!gameID.length && gameName !== 'none') {
      const errorMessage = new Discord.MessageEmbed()
        .setColor('#e74c3c')
        .setTitle('This category doesn\'t exist')
      try { return message.channel.send(errorMessage) } catch (error) { console.error(error, message.channel) }
    }
  },
};
