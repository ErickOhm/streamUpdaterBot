

function roleUpdate(prevState, newState, client, collection) {
  const ACTIVITY = 'STREAMING'
  let CHOSEN_ROLE = false
  let FILTER = false

  collection.find({ ServerID: newState.guild.id }).then(res => {
    if (res.length) {
      if (res[0].ChosenRole) {
        CHOSEN_ROLE = res[0].ChosenRole
        FILTER = res[0].Filter === 'none' ? false : res[0].Filter
      }
    }
    if (!CHOSEN_ROLE) return
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
    if (FILTER && (newActivityGame !== FILTER) && (prevActivity === ACTIVITY)) {
      // REMOVE ROLE
      let dServer = client.guilds.cache.find(guild => guild.id === newState.guild.id)
      let role = dServer.roles.cache.find(r => r.name === CHOSEN_ROLE)
      let member = dServer.members.cache.find(m => { return m.user.id === newState.userID })
      if(member.roles.cache.some(role => role.name === CHOSEN_ROLE)){
        member.roles.remove(role)
        console.log('role removed')
      }
    } else if (newActivity !== ACTIVITY) {
      let dServer = client.guilds.cache.find(guild => guild.id === newState.guild.id)
      let role = dServer.roles.cache.find(r => r.name === CHOSEN_ROLE)
      let member = dServer.members.cache.find(m => { return m.user.id === newState.userID })
      if(member.roles.cache.some(role => role.name === CHOSEN_ROLE)){
        member.roles.remove(role)
        console.log('role removed 2')
      }
    }
  })
}

module.exports = roleUpdate