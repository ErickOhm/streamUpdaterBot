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
            let error = JSON.stringify(res.error)
            if(error.length > 200) {
                message.channel.send(error.split('',200).join('')) 
            } else {
                message.channel.send(error)
            }
          return res.error;
        }
        let parsed = JSON.parse(res.raw_body);
        let txt = JSON.stringify(parsed)
        if(txt.length > 500){
            txt = txt.split('',500).join('')
        }
        message.channel.send('making the API call...')
        const result = new Discord.MessageEmbed()
          .setColor('#f1c40f')
          .setTitle(`Called made successfully`)
          .setDescription(txt)
        try {
          message.channel.send(result)
        } catch (error) {
          console.error(error, message.channel)
        }
      });
    return req;
  },
};
