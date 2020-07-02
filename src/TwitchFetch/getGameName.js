const unirest = require('unirest')

module.exports = function (gameID) {
  const URL = 'https://api.twitch.tv/helix/games?id='
  let req = unirest('GET', URL + gameID)
    .headers({
      'Client-ID': process.env.CLIENT_ID,
      'Authorization': `Bearer ${process.env.SECRET_TOKEN}`
    })
    .then(function (res) {
      if (res.error) {
        return res.error
      }
      let parsed = JSON.parse(res.raw_body)
      let id = parsed['data'][0]['name']
      return id
    });
  return req
}