// check if while the bot was offline someone stopped streaming and if so, remove the role.
function checkRole(client,collection) {
  collection.find({}).then(async (res) => {
    res.forEach(server => {
      let serverID = server.ServerID
      let roleName = server.ChosenRole ? server.ChosenRole : 'no_role'
      if (roleName !== 'no_role') {
        let Filter = server.Filter === 'none' ? false : server.Filter
				const Filters = Filter.split(",");
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
          if(!isStreaming){
            member.roles.remove(guildRole)
          }
          if(Filter && (!Filters.includes(game))){
            // remove role
            member.roles.remove(guildRole)
          } else if (!Filter && (!isStreaming)){
            //remove role
            member.roles.remove(guildRole)
          }
        })
      }
    })
  })
}

module.exports = checkRole