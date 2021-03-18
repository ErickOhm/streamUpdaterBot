const Discord = require('discord.js');
const getStreamers = require('../TwitchFetch/getStreamers');
const getStreamerThumbnal = require('../TwitchFetch/getStreamerThumbnail');
const getGameName = require('../TwitchFetch/getGameName');

module.exports = function (client, collection) {
  collection.find({}).then(async (res) => {
    for (let i = 0; i < res.length; i++) {
      const Notifications = res[i].Notifications;
      if(!Notifications){continue}
      const channelID = Notifications.channel;
      const customMsg = Notifications.message;
      const NotificationsID = [Notifications.ID];
      const streamers = await getStreamers(NotificationsID);
      if (!streamers) continue;
      if (streamers.data.length > 0) {
          const tempData = streamers.data.filter((streamer) => streamer.user_id === Notifications.ID);
          if (tempData.length) {
            if (Notifications.wasOnline == false) {
              sendStreamer(tempData[0], client, channelID, collection, res[i].ServerID, Notifications.ID,customMsg);
            } 
          } else if (!tempData.length) {
						collection.update({ ServerID: res[i].ServerID}, { $set: { 'Notifications.wasOnline': false } });
          }
      }
    }
  });
};

async function sendStreamer(data, client, channelID, collection, ServerID, streamerID,customMsg) {
  const thumbnailwidth = data.thumbnail_url.replace('{width}', '320');
  const thumbnail = thumbnailwidth.replace('{height}', '180');
  const imagePromise = getStreamerThumbnal(data.user_id);
  const gameID = data.game_id;
  const gameName = await getGameName(gameID);
  imagePromise.then((img) => {
    const streamerEmbed = new Discord.MessageEmbed()
      .setColor('#8e44ad')
      .setTitle(`${data.title}`)
      .setURL(`https://twitch.tv/${data.user_name}`)
      .setAuthor(data.user_name, img, `https://twitch.tv/${data.user_name}`)
      .setThumbnail(img)
      .addFields({ name: 'Playing', value: gameName, inline: true }, { name: 'Viewers', value: data.viewer_count })
      .setImage(thumbnail)
    try {
      client.channels.fetch(channelID).then((channel) => {
        channel.send(`${customMsg}`, streamerEmbed);
      });
    } catch (error) {
      console.error(channelID, error);
    }
  });
  collection.update({ ServerID}, { $set: { 'Notifications.wasOnline': true } });
}
