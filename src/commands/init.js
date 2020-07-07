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
    const db = require('monk')(process.env.MONGODB_URI)
    const collection = db.get('document')
    collection.find({ ServerID: String(message.guild.id) }).then(async (res) => {
      if (!res.length) {
        message.channel.send('What category would you like updates from?').then(() => {
          const filter = m => message.author.id === m.author.id;
          message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(async messages => {
              let Game = messages.first().content
              let gameID = await getGameID(String(Game))
              if (!gameID.length) {
                const errorMessage = new Discord.MessageEmbed()
                  .setColor('#e74c3c')
                  .setTitle('This category doesn\'t exist')
                db.close()
                return message.channel.send(errorMessage)
              }
              collection.insert({ ServerID: String(message.guild.id), Category: gameID, Cooldown: '5', LastUpdate: new Date(), ChannelID: String(message.channel.id), Show: 'top', Favorites: [], Banned: [] })
                .then((docs) => {
                  const successMessage = new Discord.MessageEmbed()
                    .setColor('#2ecc71')
                    .setTitle('Successfully initialized the bot and set the game to ' + Game)
                  message.channel.send(successMessage)
                }).catch((err) => {
                  message.channel.send(err)
                }).then(() => db.close())
            })
            .catch(() => {
              message.channel.send('You did not enter any input!');
            });
        });
      } else {
        const errorMessage = new Discord.MessageEmbed()
          .setColor('#e74c3c')
          .setTitle('Server has already been initialized!')
        db.close()
        return message.channel.send(errorMessage);
      }
    })
  },
};