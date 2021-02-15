var unirest = require("unirest");
const Discord = require("discord.js");

module.exports = {
  name: "stream",
  description: "get most viewed stream from <category>",
  args: true,
  cooldown: 10,
  usage: "!stream <category>",
  async execute(message, args) {
    if (!args.length) {
      return message.channel.send("Missing arguments: Game");
    }
    const name = args[0];
    const StreamsURL = "https://api.twitch.tv/helix/streams?game_id=";
    const GameIDURL = "https://api.twitch.tv/helix/games?name=" + name;
    unirest("GET", GameIDURL)
      .headers({
        "Client-ID": process.env.CLIENT_ID,
        Authorization: `Bearer ${process.env.SECRET_TOKEN}`,
      })
      .end(function (res) {
        if (res.error) throw new Error(res.error);
        let parsed = JSON.parse(res.raw_body);
        let id = parsed["data"][0]["id"];
        unirest("GET", StreamsURL + id)
          .headers({
            "Client-ID": process.env.CLIENT_ID,
            Authorization: `Bearer ${process.env.SECRET_TOKEN}`,
          })
          .then(function (res) {
            if (res.error) throw new Error(res.error);
            let parsed = JSON.parse(res.raw_body);
            if (!parsed.data.length) return;
            let data = parsed.data[0];
            let thumbnailwidth = data.thumbnail_url.replace("{width}", "320");
            let thumbnail = thumbnailwidth.replace("{height}", "180");
            let imagePromise = getImg(data.user_id);
            imagePromise.then(function (img) {
              const testEmbed = new Discord.MessageEmbed()
                .setColor("#00b894")
                .setTitle(`${data.title}`)
                .setURL(`https://twitch.tv/${data.user_name}`)
                .setAuthor(
                  data.user_name,
                  img,
                  `https://twitch.tv/${data.user_name}`
                )
                .setThumbnail(img)
                .addFields(
                  { name: "Playing", value: `${name}`, inline: true },
                  { name: "Lang", value: data.language, inline: true },
                  { name: "Viewers", value: data.viewer_count }
                )
                .setImage(thumbnail);
              message.channel.send(`${data.user_name} is live!`, testEmbed);
            });
          });
      });
    async function getImg(id) {
      var req = await unirest(
        "GET",
        "https://api.twitch.tv/helix/users?id=" + id
      )
        .headers({
          "Client-ID": process.env.CLIENT_ID,
          Authorization: `Bearer ${process.env.SECRET_TOKEN}`,
        })
        .then(function (res) {
          if (res.error) throw new Error(res.error);
          let parsed = JSON.parse(res.raw_body);
          let data = parsed["data"]["0"]["profile_image_url"];
          return data;
        });
      return req;
    }
  },
};
