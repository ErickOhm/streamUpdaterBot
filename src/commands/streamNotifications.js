const Discord = require("discord.js");
const getUserID = require("../TwitchFetch/getUserID");
const getUsers = require("../TwitchFetch/getUsers");
const channel = require("./channel");

module.exports = {
  name: "streamNotif",
  description: "set up stream notifications for yourself with a custom message",
  aliases: ["notifications", "streamNotif", "notif"],
  usage: "!notif <twitch name> <message>",
  args: true,
  cooldown: 5,
  async execute(message, args, client, collection) {
    let channelID = message.channel.id;
    let serverID = message.guild.id;
    let twitchName = args[0];
    if (twitchName.toLowerCase() === "edit" || twitchName.toLowerCase() === 'update') {
      message.channel
        .send(
          "What would you like to edit? type **user** to edit Twitch Username, **message** to update your custom message or **channel** to update the channel for updates"
        )
        .then(() => {
          const filter = (m) => message.author.id === m.author.id;
          message.channel
            .awaitMessages(filter, { time: 60000, max: 1, error: ["time"] })
            .then(async (messages) => {
              let toUpdate = messages.first().content.toLowerCase();
              switch (toUpdate) {
                case "user":
                  message.channel
                    .send("which new twitch user do you want updates from?")
                    .then(() => {
                      const filter = (m) => message.author.id === m.author.id;
                      message.channel
                        .awaitMessages(filter, {
                          time: 60000,
                          max: 1,
                          error: ["time"],
                        })
                        .then(async (messages) => {
                          let user = messages.first().content;
                          let userID = await getUserID(user);
                          collection.update(
                            { ServerID: message.guild.id },
                            {
                              $set: {
                                "Notifications.username": user,
                                "Notifications.ID": userID,
                              },
                            }
                          );
                          message.channel.send(`Updated the user to: ${user}`);
                        });
                    });
                  break;
                  case "message":
                  message.channel
                    .send("What would be the new message?")
                    .then(() => {
                      const filter = (m) => message.author.id === m.author.id;
                      message.channel
                        .awaitMessages(filter, {
                          time: 60000,
                          max: 1,
                          error: ["time"],
                        })
                        .then(async (messages) => {
                          let userMsg = messages.first().content;
                          collection.update(
                            { ServerID: message.guild.id },
                            {
                              $set: {
                                "Notifications.message": userMsg
                              },
                            }
                          );
                          message.channel.send(`Updated the message successfully`);
                        });
                    });
                  break;
                  case "channel":
                  message.channel
                    .send("Enter the channel ID where you want the bot to post updates")
                    .then(() => {
                      const filter = (m) => message.author.id === m.author.id;
                      message.channel
                        .awaitMessages(filter, {
                          time: 60000,
                          max: 1,
                          error: ["time"],
                        })
                        .then(async (messages) => {
                          let channelID = messages.first().content;
                          collection.update(
                            { ServerID: message.guild.id },
                            {
                              $set: {
                                "Notifications.channel": channelID
                              },
                            }
                          );
                          message.channel.send(`Updated the channel to <#${channelID}>`);
                        });
                    });
                  break;
              }
            });
        });
    } else {
      let customMsg = args.slice(1).join(" ");
      collection
        .find({ ServerID: String(message.guild.id) })
        .then(async (res) => {
          let userID = await getUserID(twitchName);
          if (!userID.length) {
            const errorMessage = new Discord.MessageEmbed()
              .setColor("#e74c3c")
              .setTitle("This user does not exist!");
            try {
              return message.channel.send(errorMessage);
            } catch (error) {
              console.error(error, message.channel);
            }
          }
          collection
            .update(
              { ServerID: serverID },
              {
                $set: {
                  Notifications: {
                    username: twitchName,
                    ID: userID,
                    wasOnline: false,
                    channel: channelID,
                    message: customMsg,
                  },
                },
              }
            )
            .then(async () => {
              let user = await getUsers(userID);
              let twitch = "https://twitch.tv/";
              // CONFIRMATION MESSAGE
              const confirmation = new Discord.MessageEmbed()
                .setColor("#f1c40f")
                .setTitle(`Added ${user.data[0].login}`)
                .setURL(twitch + user.data[0].display_name)
                .setAuthor(
                  user.data[0].display_name,
                  user.data[0]["profile_image_url"]
                )
                .setDescription(
                  "Notifications will be sent when user goes online"
                )
                .setThumbnail(user.data[0]["profile_image_url"]);
              try {
                message.channel.send(confirmation);
              } catch (error) {
                console.error(error, message.channel);
              }
            });
        });
    }
  },
};
