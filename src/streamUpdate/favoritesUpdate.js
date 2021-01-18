const Discord = require('discord.js');
const getStreamers = require('../TwitchFetch/getStreamers');
const getStreamerThumbnal = require('../TwitchFetch/getStreamerThumbnail');
const getGameName = require('../TwitchFetch/getGameName');

module.exports = function (client, collection) {
  collection.find({}).then(async (res) => {
    for (let i = 0; i < res.length; i++) {
      const favorites = res[i].Favorites;
      const channelID = res[i].ChannelID;
      const favoritesID = [];
      if (!favorites.length) { continue; }
      favorites.forEach((favorite) => {
        favoritesID.push(favorite.ID);
      });
      const streamers = await getStreamers(favoritesID);
      if (!streamers) continue;
      if (streamers.data.length > 0) {
        favorites.forEach((favorite) => {
          const tempData = streamers.data.filter((streamer) => streamer.user_id === favorite.ID);
          if (tempData.length) {
            if (favorite.wasOnline == false) {
              sendStreamer(tempData[0], client, channelID, collection, res[i].ServerID, favorite.ID);
            }
          } else if (!tempData.length) {
            collection.update({ ServerID: res[i].ServerID, 'Favorites.ID': favorite.ID }, { $set: { 'Favorites.$.wasOnline': false } });
          }
        });
      }
    }
  });
};

async function sendStreamer(data, client, channelID, collection, ServerID, favoriteID) {
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
      .addFields({ name: 'Playing', value: gameName, inline: true }, { name: 'Language', value: data.language, inline: true }, { name: 'Viewers', value: data.viewer_count })
      .setImage(thumbnail)
      .setTimestamp();
    try {
      client.channels.fetch(channelID).then((channel) => {
        channel.send(`${data.user_name} is live!`, streamerEmbed);
      });
    } catch (error) {
      console.error(channelID, error);
    }
  });
  collection.update({ ServerID, 'Favorites.ID': favoriteID }, { $set: { 'Favorites.$.wasOnline': true } });
}
