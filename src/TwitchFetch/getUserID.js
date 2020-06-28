const unirest = require('unirest');

module.exports = function (user) {
  let req = unirest('GET', 'https://api.twitch.tv/helix/users?login=' + user)
    .headers({
      'Client-ID': process.env.CLIENT_ID,
      'Authorization': `Bearer ${process.env.SECRET_TOKEN}`
    })
    .then(function (res) {
      if (res.error) throw new Error(res.error);
      let parsed = JSON.parse(res.raw_body)
      return parsed['data'][0]['id']
    });
  return req
}