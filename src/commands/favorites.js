const getUserID = require('../TwitchFetch/getUserID')
const getUsers = require('../TwitchFetch/getUsers')
const Discord = require('discord.js')
module.exports = {
  name: 'fav',
  aliases: ['favorites', 'fav'],
  description: 'Add your favorite streamers to know whenever they go online',
  usage: '<add/del> <username>',
  args: true,
  async execute(message, args) {
    let username = args[1].toLowerCase()
    let twitch = 'https://twitch.tv/'
    if (args.length !== 2) {
      return message.channel.send('Missing one or more arguments!')
    }
    if (args[0].toLowerCase() === 'add') {
      // ADD USER TO DATABASE
      const db = require('monk')(process.env.MONGODB_URI)
      const collection = db.get('document')
      collection.find({ ServerID: String(message.guild.id) }).then(async (res) => {
        let existingNames = []
        let existingFavorites = res[0].Favorites
        existingFavorites.forEach((favorite) => {
          existingNames.push(favorite['username'])
        })
        if (existingNames.indexOf(username) > -1) {
          const usernameWarning = new Discord.MessageEmbed()
            .setColor('#e67e22')
            .setTitle('This user already exists!')
          return message.channel.send(usernameWarning)
        }
        let userID = await getUserID(username)
        collection.update({ ServerID: message.guild.id }, { $push: { 'Favorites': { username: username, ID: userID, wasOnline: false } } })
        let user = await getUsers(userID)
        // CONFIRMATION MESSAGE
        const confirmation = new Discord.MessageEmbed()
          .setColor('#f1c40f')
          .setTitle(`Added ${user.data[0].login}`)
          .setURL(twitch + user.data[0].display_name)
          .setAuthor(user.data[0].display_name, user.data[0]['profile_image_url'])
          .setDescription('You will receive updates whenever this user goes online')
          .setThumbnail(user.data[0]['profile_image_url'])
        message.channel.send(confirmation)
        // -- END OF CONFIRMATION MESSAGE
      }).then(() => db.close())
    } else if (args[0].toLowerCase() === 'del' || args[0] === 'delete') {
      // REMOVE USER FROM DATABASE
      const db = require('monk')(process.env.MONGODB_URI)
      const collection = db.get('document')
      collection.update({ ServerID: message.guild.id }, { $pull: { 'Favorites': { username: username } } }).then(() => {
        const delConfirmation = new Discord.MessageEmbed()
          .setColor('#e74c3c')
          .setTitle(`Removed ${username} from your favorites`)
        message.channel.send(delConfirmation)
      })
    }
  },
};
