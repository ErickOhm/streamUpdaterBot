const unirest = require('unirest')

module.exports = async function (id) {
  var req = await unirest('GET', 'https://api.twitch.tv/helix/users?id=' + id)
    .headers({
      'Client-ID': process.env.CLIENT_ID,
      'Authorization': `Bearer ${process.env.SECRET_TOKEN}`
    })
    .then(function (res) {
      if (res.error) throw new Error(res.error);
      let parsed = JSON.parse(res.raw_body)
      let data = parsed['data']['0']['profile_image_url']
      return data
    });
  return req
}
