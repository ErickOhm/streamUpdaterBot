

function roleUpdate(prevState, newState, client) {
  const ACTIVITY = 'STREAMING'
  let CHOSEN_ROLE = false
  let FILTER = false
  
  const db = require('monk')(process.env.MONGODB_URI)
  const collection = db.get('document')
  collection.find({ServerID: newState.guild.id}).then(res => {
    if(res.ChosenRole){
      CHOSEN_ROLE = res.ChosenRole
      FILTER = res.Filter === 'none' ? false : res.Filter
    }
  })

  if(!CHOSEN_ROLE) return
  // filter by game 
  // activity.state === game
  let prevActivity = false
  let prevActivityGame = 'none'
  let newActivity = false
  let newActivityGame = 'none'

  newState.activities.forEach(activity => {
    if (activity.type === ACTIVITY) {
      newActivity = activity.type
      newActivityGame = activity.state
    }
  })
  if (prevState) {
    prevState.activities.forEach(activity => {
      if (activity.type === ACTIVITY) {
        prevActivity = activity.type
        prevActivityGame = activity.state
      }
    })
  }

  if (newActivity === ACTIVITY) {
    // check for game filter
    if (FILTER && (newActivityGame === FILTER) && (prevActivityGame !== newActivityGame)) {
      let dServer = client.guilds.cache.find(guild => guild.id === newState.guild.id)
      if (!dServer.roles.cache.find(r => r.name === CHOSEN_ROLE)) { console.log('no such role'); return }
      let role = dServer.roles.cache.find(r => r.name === CHOSEN_ROLE)
      let member = dServer.members.cache.find(m => { return m.user.id === newState.userID })
      try {
        member.roles.add(role)
        console.log('added role')
      } catch (err) {
        console.log(err)
      }

    } else if (!FILTER && (!prevActivity || prevActivity !== newActivity)) {
      // UPDATE ROLE
      let dServer = client.guilds.cache.find(guild => guild.id === newState.guild.id)
      if (!dServer.roles.cache.find(r => r.name === CHOSEN_ROLE)) { console.log('no such role'); return }
      let role = dServer.roles.cache.find(r => r.name === CHOSEN_ROLE)
      let member = dServer.members.cache.find(m => { return m.user.id === newState.userID })
      try {
        member.roles.add(role)
        console.log('added role')
      } catch (err) {
        console.log(err)
      }
    }

  }
  if(FILTER && (newActivityGame !== FILTER)){
    // REMOVE ROLE
    let dServer = client.guilds.cache.find(guild => guild.id === newState.guild.id)
    let role = dServer.roles.cache.find(r => r.name === CHOSEN_ROLE)
    let member = dServer.members.cache.find(m => { return m.user.id === newState.userID })
    try {
      member.roles.remove(role)
      console.log('removed role')
    } catch (err) {
      console.err(err)
    }
  }
  else if (!FILTER && (prevActivity && prevActivity === ACTIVITY) && (!newActivity || newActivity !== ACTIVITY)) {
    // REMOVE ROLE
    let dServer = client.guilds.cache.find(guild => guild.id === newState.guild.id)
    let role = dServer.roles.cache.find(r => r.name === CHOSEN_ROLE)
    let member = dServer.members.cache.find(m => { return m.user.id === newState.userID })
    try {
      member.roles.remove(role)
      console.log('removed role')
    } catch (err) {
      console.err(err)
    }
  }
}

module.exports = roleUpdate