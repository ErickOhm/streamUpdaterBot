const getStreamers = require('../TwitchFetch/getStreamers')
const getStreamerThumbnal = require('../TwitchFetch/getStreamerThumbnail')
const getGameName = require('../TwitchFetch/getGameName')

const Discord = require('discord.js');

module.exports = function (client) {
  const db = require('monk')(process.env.MONGODB_URI)
  const collection = db.get('document')
  collection.find({}).then(async (res) => {
    for (let i = 0; i < res.length; i++) {
      let favorites = res[i].Favorites
      let channelID = res[i].ChannelID
      let favoritesID = []
      favorites.forEach(favorite => {
        favoritesID.push(favorite['ID'])
      })
      let streamers = await getStreamers(favoritesID)
      if (streamers.data.length > 0) {
        favorites.forEach((favorite) => {
          let tempData = streamers.data.filter(streamer => {
            return streamer.user_id === favorite['ID']
          })
          if (tempData.length) {
            if (favorite['wasOnline'] == false) {
              sendStreamer(tempData[0], client, channelID, collection, res[i].ServerID, favorite['ID'])
            }
          } else if (!tempData.length) {
            collection.update({ 'ServerID': res[i].ServerID, "Favorites.ID": favorite['ID'] }, { $set: { "Favorites.$.wasOnline": false } })
          }
        })
      }
    }
  })
}

async function sendStreamer(data, client, channelID, collection, ServerID, favoriteID) {
  let thumbnailwidth = data.thumbnail_url.replace('{width}', '320')
  let thumbnail = thumbnailwidth.replace('{height}', '180')
  let imagePromise = getStreamerThumbnal(data.user_id)
  let gameID = data.game_id
  let gameName = await getGameName(gameID)
  imagePromise.then(function (img) {
    const streamerEmbed = new Discord.MessageEmbed()
      .setColor('#8e44ad')
      .setTitle(`${data.title}`)
      .setURL(`https://twitch.tv/${data.user_name}`)
      .setAuthor(data.user_name, img, `https://twitch.tv/${data.user_name}`)
      .setThumbnail(img)
      .addFields({ name: 'Playing', value: gameName, inline: true }, { name: 'Lang', value: data.language, inline: true }, { name: 'Viewers', value: data.viewer_count })
      .setImage(thumbnail)
    try {
      client.channels.fetch(channelID).then(channel => {
        channel.send(`${data.user_name} is live!`, streamerEmbed)
      })
    } catch (error) {
      console.error(error)
    }
  })
  collection.update({ 'ServerID': ServerID, "Favorites.ID": favoriteID }, { $set: { "Favorites.$.wasOnline": true } })
}