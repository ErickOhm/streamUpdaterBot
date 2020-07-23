const getGameID = require('../TwitchFetch/getGameID')
const Discord = require('discord.js');

module.exports = {
  name: 'config',
  description: 'Initialize the bot with your preferences (do this command in the channel you want the bot to send updates)',
  args: false,
  aliases: ['start', 'init'],
  usage: '!init',
  cooldown: 5,
  execute(message, args) {
    const db = require('monk')(process.env.DB_URI)
    const collection = db.get('document')
    collection.find({ ServerID: String(message.guild.id) }).then(async (res) => {
      if (!res.length) {
        message.channel.send('What category would you like updates from? Type `none` if you only want to use the favorite streamers functionality.').then(() => {
          const filter = m => message.author.id === m.author.id;
          message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(async messages => {
              let Game = messages.first().content
              if (Game == 'none') {
                collection.insert({ ServerID: String(message.guild.id), Category: 'none', Cooldown: '5', LastUpdate: new Date(), ChannelID: String(message.channel.id), Show: 'top', Favorites: [], Banned: [] })
                  .then(res => {
                    const noGameSuccess = successMessage('Successfully initialized the bot, use `!fav add` to add your favorite streamers')
                    db.close()
                    return message.channel.send(noGameSuccess)
                  })
              }
              let gameID = await getGameID(String(Game))
              if (!gameID.length && Game !== 'none') {
                const gameError = errorMessage('This category does\'nt exist please try again')
                db.close()
                return message.channel.send(gameError)
              }
              if (gameID.length && Game !== 'none') {
                collection.insert({ ServerID: String(message.guild.id), Category: gameID, Cooldown: '5', LastUpdate: new Date(), ChannelID: String(message.channel.id), Show: 'top', Favorites: [], Banned: [] })
                .then((docs) => {
                  const gameSuccess = successMessage(`Successfully initialized the bot and set the game to ${Game}`)
                  message.channel.send(gameSuccess)
                }).catch((err) => {
                  message.channel.send(err)
                }).then(() => db.close())
              }
            })
            .catch(() => {
              const inputError = errorMessage('You didn\'t enter any input!')
              message.channel.send(inputError);
            });
        });
      } else {
        const initializeError = errorMessage('Server has already been initialized!');
        db.close()
        return message.channel.send(initializeError);
      }
    })
  },
};

function errorMessage(title) {
  const message = new Discord.MessageEmbed()
    .setColor('#e74c3c')
    .setTitle(title)
  return message
}

function successMessage(title) {
  const message = new Discord.MessageEmbed()
    .setColor('#2ecc71')
    .setTitle(title)
  return message
}