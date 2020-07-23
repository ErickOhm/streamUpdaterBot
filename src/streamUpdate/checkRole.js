// TODO
// check if while the bot was offline someone stopped streaming and if so, remove the role.
function checkRole(client) {
  const db = require('monk')(process.env.DB_URI)
  const collection = db.get('document')
  collection.find({}).then(async (res) => {
    res.forEach(server => {
      let serverID = server.ServerID
      let roleName = server.ChosenRole ? server.ChosenRole : 'no_role'
      let Filter = server.Filter === 'none' ? false : server.Filter
      if (roleName !== 'no_role') {
        let guild = client.guilds.cache.find(guild => guild.id === serverID)
        let guildRole = guild.roles.cache.find(role => role.name === roleName)
        if(!guildRole) return
        guildRole.members.forEach(member => {
          let isStreaming = false
          let game = 'none'
          member.presence.activities.forEach(activity => {
            if(activity.type === 'STREAMING'){
              isStreaming = true
              game = activity.state
            }
          })
          if(Filter && (game !== Filter)){
            // remove role
            member.roles.remove(guildRole)
          } else if (!Filter && (isStreaming === false)){
            //remove role
            member.roles.remove(guildRole)
          }
        })
      }
    })
  })
}

module.exports = checkRole