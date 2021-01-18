const Discord = require('discord.js');

module.exports = {
  name: 'cooldownUpdate',
  description: 'Set the time between stream category updates',
  usage: '!cooldown <time in minutes>',
  aliases: ['cooldown'],
  args: true,
  cooldown: 5,
  execute(message, args,client,collection) {
    let time = parseInt(args[0])
    if (time > 5) {
      let serverID = message.guild.id
      let cooldown = Math.round(args[0])
      collection.update({ ServerID: serverID }, { $set: { Cooldown: cooldown } }).then(() => {
        const successMessage = new Discord.MessageEmbed()
          .setColor('#2ecc71')
          .setTitle(`Successfully changed your cooldown to ${time} minutes`)
        try { message.channel.send(successMessage) } catch (error) { console.error(error, message.channel) }
         
      })
    } else {
      const errorMessage = new Discord.MessageEmbed()
        .setColor('#e74c3c')
        .setTitle('Time needs to be a number and minimum 5')
      try { return message.channel.send(errorMessage) } catch (error) { console.error(error, message.channel) }
    }
  },
};
