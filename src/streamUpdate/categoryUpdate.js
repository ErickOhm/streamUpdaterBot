const getStreams = require('../TwitchFetch/getStreams')
const getImg = require('../TwitchFetch/getStreamerThumbnail')
const getGameName = require('../TwitchFetch/getGameName')
const Discord = require('discord.js')

module.exports = function (client) {
  const db = require('monk')(process.env.MONGODB_URI)
  const collection = db.get('document')
  collection.find({}).then(async (res) => {
    for (let i = 0; i < res.length; i++) {
      let category = res[i].Category
      let LastUpdateSec = ((res[i].LastUpdate.getTime()) / 1000);
      let cooldownSec = ((+res[i].Cooldown) * 60);
      let cooldownTime = Math.round(LastUpdateSec + cooldownSec);
      let currentTime = ((new Date()).getTime() / 1000);
      if (currentTime >= cooldownTime) {
        let streams = await getStreams(category);
        if (!streams.data.length) continue
        let data = streams.data[0]
        let channelID = res[i].ChannelID
        client.channels.fetch(channelID).then((channel) => {
          channel.messages.fetch({ limit: 6 }).then(messages => {
            let messageArray = messages.array()
            let usernameArray = []
            for (let j = 0; j < messageArray.length; j++) {
              if (messageArray[j].author.bot) {
                let name = messageArray[j].content.split(' ')[0]
                usernameArray.push(name)
              }
            }
            let index = usernameArray.indexOf(data.user_name)
            if (index == -1) {
              sendStreamer(data, client, channelID, collection, res[i].ServerID)
            } else if (index >= 0) {
              let messageCooldown = (LastUpdateSec - (cooldownSec * index))
              let timeDiff = (currentTime - messageCooldown)
              let twoHours = (2 * 60 * 60)
              if (timeDiff > twoHours) {
                sendStreamer(data, client, channelID, collection, res[i].ServerID)
              }
            }
          })
        })
      }

    }
  }).then(() => db.close())
};


async function sendStreamer(data, client, channelID, collection, ID) {
  let thumbnailwidth = data.thumbnail_url.replace('{width}', '320')
  let thumbnail = thumbnailwidth.replace('{height}', '180')
  let imagePromise = getImg(data.user_id)
  let gameID = data.game_id
  let gameName = await getGameName(gameID)
  imagePromise.then(function (img) {
    const streamerEmbed = new Discord.MessageEmbed()
      .setColor('#00b894')
      .setTitle(`${data.title}`)
      .setURL(`https://twitch.tv/${data.user_name}`)
      .setAuthor(data.user_name, img, `https://twitch.tv/${data.user_name}`)
      .setThumbnail(img)
      // TODO GET THE NAME OF THE GAME BEING PLAYED
      .addFields({ name: 'Playing', value: gameName, inline: true }, { name: 'Lang', value: data.language, inline: true }, { name: 'Viewers', value: data.viewer_count })
      .setImage(thumbnail)
    client.channels.fetch(channelID).then(channel => {
      channel.send(`${data.user_name} is live!`, streamerEmbed)
    })
  })
  collection.update({ ServerID: ID }, { $set: { LastUpdate: new Date() } })
}