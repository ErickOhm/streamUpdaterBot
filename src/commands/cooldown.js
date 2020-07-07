const db = require('monk')(process.env.MONGODB_URI)
const collection = db.get('document')
const Discord = require('discord.js');

module.exports = {
  name: 'cooldownUpdate',
  description: 'Set the time between stream category updates',
  usage: '!cooldown <time in minutes>',
  aliases: ['cooldown'],
  args: true,
  cooldown: 5,
  execute(message, args) {
    let time = parseInt(args[0])
    if (time > 5) {
      let serverID = message.guild.id
      let cooldown = Math.round(args[0])
      collection.update({ ServerID: serverID }, { $set: { Cooldown: cooldown } }).then(() => {
        const successMessage = new Discord.MessageEmbed()
          .setColor('#2ecc71')
          .setTitle(`Successfully changed your cooldown to ${time} minutes`)
        message.channel.send(successMessage)
        db.close()
      })
    } else {
      const errorMessage = new Discord.MessageEmbed()
        .setColor('#e74c3c')
        .setTitle('Time needs to be a number and minimum 5')
      return message.channel.send(errorMessage)
    }
  },
};
