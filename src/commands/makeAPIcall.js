const unirest = require("unirest");
const Discord = require('discord.js')

module.exports = {
  name: "call",
  description: "call an api endpoint",
  usage: "!call <endpoint>",
  execute(message, args, client) {
    if (message.author.id !== process.env.CREATOR_ID) return;
    const URL = args[0] ? args[0] : 'https://jstris.jezevec10.com/api/u/Erickmack/records/1?mode=1&best';
    console.log(args,'arguments')
    let req = unirest("GET", URL)
      .then(function (res) {
        if (res.error) {
            console.error(res.error)
          return res.error;
        }
        let parsed = JSON.parse(res.raw_body);
        console.log(parsed)
        message.channel.send('making the API call...')
        const result = new Discord.MessageEmbed()
          .setColor('#f1c40f')
          .setTitle(`Called made successfully`)
          .setDescription(JSON.stringify(parsed))
        try {
          message.channel.send(result)
        } catch (error) {
          console.error(error, message.channel)
        }
      });
    return req;
  },
};
