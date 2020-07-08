const unirest = require('unirest');

module.exports = function (ID) {
  let URL = 'https://api.twitch.tv/helix/streams?user_id='
  for (let i = 0; i < ID.length; i++) {
    if (i === 0) {
      URL += ID[0]
    } else {
      URL += `&user_id=${ID[i]}`
    }
  }
  let req = unirest('GET', URL)
    .headers({
      'Client-ID': process.env.CLIENT_ID,
      'Authorization': `Bearer ${process.env.SECRET_TOKEN}`
    })
    .then(function (res) {
      if (res.error) console.error(res.err, URL + ID)
      let parsed = JSON.parse(res.raw_body)
      return parsed
    });
  return req
}