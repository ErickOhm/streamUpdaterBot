// TODO COMMAND TO UPDATE THE CHANNEL WHERE THE STREAM UPDATES ARE BEING SENT TO
const db = require('monk')(process.env.DB_URI)
const collection = db.get('document')

const Discord = require('discord.js');

module.exports = {
  name: 'channelUpdate',
  description: 'Change the channel where you want the bot to send updates (call this command in the new channel)',
  aliases: ['channel'],
  usage: '!channel',
  args: false,
  cooldown: 5,
  execute(message) {
    let channelID = message.channel.id
    let serverID = message.guild.id
    collection.update({ ServerID: serverID }, { $set: { ChannelID: channelID } }).then(() => {
      const successMessage = new Discord.MessageEmbed()
        .setColor('#2ecc71')
        .setTitle(`Successfully changed your channel to ${message.channel.name}`)
      try {
        message.channel.send(successMessage)
      } catch (error) {
        console.error(error, message.channel)
      }
      db.close()
    })
  },
};
