const getUserID = require('../TwitchFetch/getUserID')
const Discord = require('discord.js')
module.exports = {
  name: 'ban',
  description: 'Ban people from showing up in the bot updates',
  usage: '<add/del> <username>',
  args: true,
  async execute(message, args) {
    let username = args[1].toLowerCase()
    if (args.length < 2) {
      return message.channel.send('Missing one or more arguments!')
    }
    if (args[0].toLowerCase() === 'add') {
      // ADD USER TO DATABASE
      const db = require('monk')(process.env.MONGODB_URI)
      const collection = db.get('document')
      collection.find({ ServerID: String(message.guild.id) }).then(async (res) => {
        for (let i = 0; i < res[0].Banned.length; i++) {
          if (username in res[0].Banned[i]) {
            return message.channel.send('This user already exists')
          }
        }
        let userID = await getUserID(username)
        collection.update({ ServerID: message.guild.id }, { $push: { 'Banned': { [username]: userID } } }).then(() => {
          const confirmation = new Discord.MessageEmbed()
            .setColor('#d63031')
            .setTitle(`You won't see updates from ${username} anymore`)
            .setDescription(`https://twitch.tv/${username}`)
          message.channel.send(confirmation)
        })
      }).then(() => db.close())
    } else if (args[0].toLowerCase() === 'del' || args[0] === 'delete') {
      // REMOVE USER FROM DATABASE
      const db = require('monk')(process.env.MONGODB_URI)
      const collection = db.get('document')
      collection.find({ ServerID: String(message.guild.id) }).then(async (res) => {
        for (let i = 0; i < res[0].Banned.length; i++) {
          let userID = res[0].Banned[i][username]
          if (userID) {
            collection.update({ ServerID: message.guild.id }, { $pull: { 'Banned': { [username]: userID } } }).then(() => {
              message.channel.send(`Removed ${username} from your Ban list`)
            })
          }
        }
      }).then(() => { db.close() })
    }
  },
};
