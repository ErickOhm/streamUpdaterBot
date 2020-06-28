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
      const db = require('monk')(process.env.URI)
      db.then(() => console.log('connected'))
      const collection = db.get('document')
      collection.find({ ServerID: String(message.guild.id) }).then(async (res) => {
        for (let i = 0; i < res[0].Favorites.length; i++) {
          if (username in res[0].Favorites[i]) {
            return message.channel.send('This user already exists')
          }
        }
        let userID = await getUserID(username)
        collection.update({ ServerID: message.guild.id }, { $push: { 'Favorites': { [username]: userID } } })
        let user = await getUsers(userID)
        // CONFIRMATION MESSAGE
        const confirmation = new Discord.MessageEmbed()
          .setColor('#ffeaa7')
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
      const db = require('monk')(process.env.URI)
      db.then(() => console.log('connected'))
      const collection = db.get('document')
      collection.find({ ServerID: String(message.guild.id) }).then(async (res) => {
        for (let i = 0; i < res[0].Favorites.length; i++) {
          let userID = res[0].Favorites[i][username]
          if (userID) {
            console.log(userID)
            collection.update({ ServerID: message.guild.id }, { $pull: { 'Favorites': { [username]: userID } } })
            message.channel.send(`Removed **${username}** from your Favorites`)
          }
        }
      }).then(() => { db.close() })
    }
  },
};
