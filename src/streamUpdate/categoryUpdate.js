const Discord = require('discord.js');
const getStreams = require('../TwitchFetch/getStreams');
const getImg = require('../TwitchFetch/getStreamerThumbnail');
const getGameName = require('../TwitchFetch/getGameName');
const getLogin = require('../TwitchFetch/getStreamerInfo');

module.exports = function (client, collection) {
  collection.find({}).then(async (res) => {
    for (let i = 0; i < res.length; i++) {
      const category = res[i].Category;
      if (category == 'none') {
        continue;
      }
      const LastUpdateSec = res[i].LastUpdate.getTime() / 1000;
      const cooldownSec = +res[i].Cooldown * 60;
      const cooldownTime = Math.round(LastUpdateSec + cooldownSec);
      const currentTime = new Date().getTime() / 1000;
      if (currentTime >= cooldownTime) {
        const streams = await getStreams(category);
        if (!streams.data.length) continue;
        const { data } = streams;
        const channelID = res[i].ChannelID;
        try {
          client.channels.fetch(channelID).then((channel) => {
            channel.messages.fetch({ limit: 15 }).then((messages) => {
              const messageArray = messages.array();
              const usernameArray = [];
              messageArray.forEach((msg) => {
                if (msg.author.bot) {
                  const name = msg.content.split(' ')[0];
                  usernameArray.push(name);
                }
              });
              const mostViewed = data[0];
              const index = usernameArray.indexOf(mostViewed.user_name);
              if (index == -1) {
                sendStreamer(
                  mostViewed,
                  client,
                  channelID,
                  collection,
                  res[i].ServerID,
                );
              } else if (index >= 0) {
                if (data.length > 1) {
                  const rand = Math.floor(Math.random() * data.length + 1);
                  const randStreamer = data[rand];
                  if(!randStreamer) return
                  const index = usernameArray.indexOf(randStreamer.user_name);
                  if (index < 0) {
                    sendStreamer(
                      randStreamer,
                      client,
                      channelID,
                      collection,
                      res[i].ServerID,
                    );
                  } else {
                    messageArray.forEach((msg) => {
                      if (msg.content.split('')[0] === randStreamer.user_name) {
                        const currentDate = new Date();
                        const oneHour = 3600000;
                        if (msg.createdTimestamp + oneHour < currentDate) {
                          sendStreamer(
                            randStreamer,
                            client,
                            channelID,
                            collection,
                            res[i].ServerID,
                          );
                        }
                      }
                    });
                  }
                }
                const messageCooldown = LastUpdateSec - cooldownSec * index;
                const timeDiff = currentTime - messageCooldown;
                const threeHours = 3 * 60 * 60;
                if (timeDiff > threeHours) {
                  sendStreamer(
                    data,
                    client,
                    channelID,
                    collection,
                    res[i].ServerID,
                  );
                }
              }
            });
          });
        } catch (error) {
          console.error(error);
        }
      }
    }
  });
};

async function sendStreamer(data, client, channelID, collection, ID) {
  const thumbnailwidth = data.thumbnail_url.replace('{width}', '320');
  const thumbnail = thumbnailwidth.replace('{height}', '180');
  const imagePromise = getImg(data.user_id);
  const userLogin = await getLogin(data.user_id);
  const gameID = data.game_id;
  const gameName = await getGameName(gameID);
  imagePromise.then((img) => {
    const streamerEmbed = new Discord.MessageEmbed()
      .setColor('#8e44ad')
      .setTitle(`${data.title}`)
      .setURL(`https://twitch.tv/${userLogin}`)
      .setAuthor(data.user_name, img, `https://twitch.tv/${data.user_name}`)
      .setThumbnail(img)
      .addFields(
        { name: 'Playing', value: gameName, inline: true },
        { name: 'Language', value: data.language, inline: true },
        { name: 'Viewers', value: data.viewer_count },
      )
      .setImage(thumbnail)
      .setTimestamp();
    try {
      client.channels.fetch(channelID).then((channel) => {
        try {
          channel.send(`${data.user_name} is live!`, streamerEmbed);
        } catch (error) {
          console.error(error, channelID);
        }
      });
    } catch (error) {
      console.error(channelID, error);
    }
  });
  collection.update({ ServerID: ID }, { $set: { LastUpdate: new Date() } });
}
