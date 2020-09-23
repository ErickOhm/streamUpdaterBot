// TODO

const { Activity } = require("discord.js")

// Check if while the bot was offline someone started streaming
function checkAddRole(client, collection) {

  collection.find({}).then(async (res) => {
    res.forEach(server => {
      let serverID = server.ServerID
      let roleName = server.ChosenRole ? server.ChosenRole : false
      if (roleName) {
        let Filter = server.Filter === 'none' ? false : server.Filter
        let guild = client.guilds.cache.find(guild => guild.id === serverID)
        let guildRole = guild.roles.cache.find(role => role.name === roleName)
        if(!guildRole) return
        guild.presences.cache.forEach(user => {
          if(user.activities.length){
            user.activities.forEach(activity => {
              if(activity.type === 'STREAMING'){
                let member = guild.members.cache.find(m => { return m.user.id === user.userID })
               if(Filter &&(Filter === activity.state)){
                 console.log('Why you no work?', member)
                 member.roles.add(guildRole)
               } else if(!Filter){
                 member.roles.add(guildRole)
               }
              }
            })  
          }
        })
      }
    })
  })
}

module.exports = checkAddRole