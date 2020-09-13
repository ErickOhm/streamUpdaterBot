const getStreams = require('../TwitchFetch/getStreams')
const getImg = require('../TwitchFetch/getStreamerThumbnail')
const getGameName = require('../TwitchFetch/getGameName')
const getLogin = require('../TwitchFetch/getStreamerInfo')
const Discord = require('discord.js')

module.exports = function (client,collection) {
  collection.find({}).then(async (res) => {
    for (let i = 0; i < res.length; i++) {
      let category = res[i].Category
      if (category == 'none') {
        continue
      }
      let LastUpdateSec = ((res[i].LastUpdate.getTime()) / 1000);
      let cooldownSec = ((+res[i].Cooldown) * 60);
      let cooldownTime = Math.round(LastUpdateSec + cooldownSec);
      let currentTime = ((new Date()).getTime() / 1000);
      if (currentTime >= cooldownTime) {
        let streams = await getStreams(category);
        if (!streams.data.length) continue
        let data = streams.data[0]
        let channelID = res[i].ChannelID
        try {
          client.channels.fetch(channelID).then((channel) => {
            channel.messages.fetch({ limit: 6 }).then(messages => {
              let messageArray = messages.array()
              let usernameArray = []
              messageArray.forEach((msg) => {
                if (msg.author.bot) {
                  let name = msg.content.split(' ')[0]
                  usernameArray.push(name)
                }
              })
              let index = usernameArray.indexOf(data.user_name)
              if (index == -1) {
                sendStreamer(data, client, channelID, collection, res[i].ServerID)
              } else if (index >= 0) {
                let messageCooldown = (LastUpdateSec - (cooldownSec * index))
                let timeDiff = (currentTime - messageCooldown)
                let threeHours = (3 * 60 * 60)
                if (timeDiff > threeHours) {
                  sendStreamer(data, client, channelID, collection, res[i].ServerID)
                }
              }
            })
          })
        } catch (error) {
          console.error(error)
        }
      }

    }
  })
};


async function sendStreamer(data, client, channelID, collection, ID) {
  let thumbnailwidth = data.thumbnail_url.replace('{width}', '320')
  let thumbnail = thumbnailwidth.replace('{height}', '180')
  let imagePromise = getImg(data.user_id)
  let userLogin = await getLogin(data.user_id)
  let gameID = data.game_id
  let gameName = await getGameName(gameID)
  imagePromise.then(function (img) {
    const streamerEmbed = new Discord.MessageEmbed()
      .setColor('#8e44ad')
      .setTitle(`${data.title}`)
      .setURL(`https://twitch.tv/${userLogin}`)
      .setAuthor(data.user_name, img, `https://twitch.tv/${data.user_name}`)
      .setThumbnail(img)
      .addFields({ name: 'Playing', value: gameName, inline: true }, { name: 'Language', value: data.language, inline: true }, { name: 'Viewers', value: data.viewer_count })
      .setImage(thumbnail)
      .setTimestamp()
    try {
      client.channels.fetch(channelID).then(channel => {
        try {
          channel.send(`${data.user_name} is live!`, streamerEmbed)
        } catch (error) {
          console.error(error, channelID)
        }
      })
    } catch (error) {
      console.error(channelID, error)
    }
  })
  collection.update({ ServerID: ID }, { $set: { LastUpdate: new Date() } })
}