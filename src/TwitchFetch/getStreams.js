const unirest = require('unirest');

module.exports = function (ID) {
  let req = unirest('GET', 'https://api.twitch.tv/helix/streams?game_id=' + ID)
    .headers({
      'Client-ID': process.env.CLIENT_ID,
      'Authorization': `Bearer ${process.env.SECRET_TOKEN}`
    })
    .then(function (res) {
      if (res.error) throw new Error(res.error);
      let parsed = JSON.parse(res.raw_body)
      return parsed
    });
  return req
}