const unirest = require('unirest');
module.exports = function (id) {
    var req = unirest('GET', 'https://api.twitch.tv/helix/users?id=' + id)
        .headers({
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': `Bearer ${process.env.SECRET_TOKEN}`
        })
        .then(function (res) {
            if (res.error) throw new Error(res.error);
            let parsed = JSON.parse(res.raw_body)
            let login = parsed['data']['0']['login']
            return login
        });
    return req
}