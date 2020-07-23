module.exports = {
  name: 'streamingRole',
  description: 'Setup an automatic role update for people streaming',
  usage: '!streaming',
  aliases: ['roles','streaming'],
  execute(message) {
    const db = require('monk')(process.env.MONGODB_URI)
    const collection = db.get('document')
    collection.find({ ServerID: message.guild.id }).then(res => {
      if (res[0].ChosenRole) {
        message.channel.send('You already have a role assinged if you would like to update it type Role if you would like to update your filter instead type Filter').then(() => {
          const filter = m => message.author.id === m.author.id;
          message.channel.awaitMessages(filter, { time: 60000, max: 1, error: ['time'] })
            .then(async messages => {
              let toUpdate = messages.first().content.toLowerCase()
              switch (toUpdate) {
                case 'role':
                  message.channel.send('**What role would you like the bot to assign to users?** Please make sure it is spelled the same way as it shows in the Roles tab').then(() => {
                    const filter = m => message.author.id === m.author.id
                    message.channel.awaitMessages(filter, { time: 60000, max: 1, error: ['time'] })
                      .then(async messages => {
                        let role = messages.first().content
                        collection.update({ ServerID: message.guild.id }, { $set: { ChosenRole: role } })
                        message.channel.send(`Updated the role to: ${role}`)
                      })
                  })
                  break
                case 'filter':
                  message.channel.send('**What filter would you like to have?** Only people playing this game will get the streaming role, make sure the game is spelled as it is on Twitch').then(() => {
                    const filter = m => message.author.id === m.author.id
                    message.channel.awaitMessages(filter, { time: 60000, max: 1, error: ['time'] })
                      .then(async messages => {
                        let game = messages.first().content
                        collection.update({ ServerID: message.guild.id }, { $set: { Filter: game } })
                        message.channel.send(`Updated the filter to: ${game}`)
                      })
                  })
                  break
                default:
                  message.channel.send('you didn\'t type a valid option if you wish to update your role or filter please try this command again')
                  return
              }
            }).then(() => db.close())
        })
      } else if (!res.ChosenRole) {
        message.channel.send('**Before starting make sure you have a role created and make sure the role of the bot is above the streamming role otherwise the bot can not assing it.** Type Yes if you\'re ready to continue, type No otherwise.').then(() => {
          const filter = m => message.author.id === m.author.id;
          message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
            .then(async messages => {
              let response = messages.first().content
              if (response === 'No') { return }
              message.channel.send('Please type the name of the role you want the bot to assign, make sure te name is spelled the same way as it show in the Roles tab (roles are case sensitive)').then(() => {
                const filter = m => message.author.id === m.author.id;
                message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
                  .then(async messages => {
                    let roleName = messages.first().content
                    collection.update({ ServerID: message.guild.id }, { $set: { ChosenRole: roleName } })
                    message.channel.send(`Added role: **${roleName}** succesfully`).then(() => {
                      message.channel.send('You can also give the role only to people playing a specific game, please type a game name the same way it\'s spelled on Twitch if you would like to filter by game, otherwise type none').then(() => {
                        const filter = m => message.author.id === m.author.id
                        message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
                          .then(async messages => {
                            let Filter = messages.first().content
                            collection.update({ ServerID: message.guild.id }, { $set: { Filter: Filter } })
                            message.channel.send(`Added **${Filter}** as a filter`)
                          })
                      })
                    })
                  })
              })
            })
        })
      }
    })
  },
};
