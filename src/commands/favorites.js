const getUserID = require('../TwitchFetch/getUserID')
const getUsers = require('../TwitchFetch/getUsers')
const Discord = require('discord.js')

const db = require('monk')(process.env.MONGODB_URI)
const collection = db.get('document')

module.exports = {
  name: 'favorites',
  aliases: ['fav'],
  description: '<Add> your favorite streamers to know whenever they go online, <Remove> users from your favorites, <List> all the people you have added',
  usage: '!favorites <add/remove> <username> | !favorites list',
  args: true,
  async execute(message, args) {
    let option = args[0]
    if (option.toLowerCase() == 'list') {
      collection.find({ ServerID: String(message.guild.id) }).then((res) => {
        let favoriteNames = []
        let existingFavorites = res[0].Favorites
        existingFavorites.forEach((favorite) => {
          favoriteNames.push(favorite['username'])
        })
        if (!favoriteNames.length) {
          const infoMessage = new Discord.MessageEmbed()
            .setColor('#3498db')
            .setTitle('You don\'t have any favorites added yet.')
          return message.channel.send(infoMessage)
        }
        const infoMessage = new Discord.MessageEmbed()
          .setColor('#3498db')
          .setTitle('Here\'s all the users you have favorited:')
          .setDescription(favoriteNames.join('\n'))
        return message.channel.send(infoMessage)
      })
    }
    if (option.toLowerCase() === 'add') {
      if (args.length < 2) {
        return message.channel.send('Missing one or more arguments!')
      }
      let username = args[1].toLowerCase()
      let twitch = 'https://twitch.tv/'
      // ADD USER TO DATABASE
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
          db.close()
          return message.channel.send(usernameWarning)
        }
        let userID = await getUserID(username)
        if (!userID.length) {
          const errorMessage = new Discord.MessageEmbed()
            .setColor('#e74c3c')
            .setTitle('This user does not exist!')
          db.close()
          return message.channel.send(errorMessage)
        }
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
    } else if (option.toLowerCase() === 'del' || option === 'remove') {
      if (args.length < 2) {
        return message.channel.send('Missing one or more arguments!')
      }
      let username = args[1].toLowerCase()
      // REMOVE USER FROM DATABASE
      collection.update({ ServerID: message.guild.id }, { $pull: { 'Favorites': { username: username } } }).then(() => {
        const delConfirmation = new Discord.MessageEmbed()
          .setColor('#e74c3c')
          .setTitle(`Removed ${username} from your favorites`)
        message.channel.send(delConfirmation)
        db.close()
      })
    }
  },
};
