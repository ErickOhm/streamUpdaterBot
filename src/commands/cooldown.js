const db = require('monk')(process.env.URI)
const collection = db.get('document')

module.exports = {
  name: 'cooldown',
  description: 'Set the time between stream category updates',
  usage: '<time in minutes>',
  args: true,
  execute(message, args) {
    let time = parseInt(args[0])
    if (time > 5) {
      let serverID = message.guild.id
      let cooldown = Math.round(args[0])
      collection.update({ ServerID: serverID }, { $set: { Cooldown: cooldown } }).then(() => {
        message.channel.send(`Successfully changed your cooldown to ${args[0]} minutes`)
        db.close()
      })
    } else {
      message.channel.send('Time needs to be a number and minimum 5')
      return
    }
  },
};
