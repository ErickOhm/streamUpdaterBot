const unirest = require('unirest')

module.exports = function (game) {
  const URL = 'https://api.twitch.tv/helix/games?name='
  let req = unirest('GET', URL + game)
    .headers({
      'Client-ID': process.env.CLIENT_ID,
      'Authorization': `Bearer ${process.env.SECRET_TOKEN}`
    })
    .then(function (res) {
      if (res.error) {
        return res.error
      }
      let parsed = JSON.parse(res.raw_body)
      let id = parsed['data'][0]['id']
      return id
    });
  return req
}