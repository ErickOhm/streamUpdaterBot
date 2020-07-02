const getGameID = require('../TwitchFetch/getGameID')

module.exports = {
  name: 'init',
  description: 'Initialize the bot with your preferences (do this command in the channel you want the bot to send updates)',
  args: true,
  execute(message, args) {
    const db = require('monk')(process.env.MONGODB_URI)
    db.then(() => {
      console.log('connected')
    })
    const collection = db.get('document')
    collection.find({ ServerID: String(message.guild.id) }).then(async (res) => {
      let Game = args[0]
      if (!res.length) {
        let gameID = await getGameID(String(Game))
        collection.insert({ ServerID: String(message.guild.id), Category: gameID, Cooldown: '5', LastUpdate: new Date(), ChannelID: String(message.channel.id), Show: 'top', Favorites: [], Banned: [] })
          .then((docs) => {
            message.channel.send('You initialized the bot successfully and set the game to ' + Game)
          }).catch((err) => {
            console.log(err)
          }).then(() => db.close())
      } else {
        message.channel.send('You already initialized this server!');
      }
    })
  },
};