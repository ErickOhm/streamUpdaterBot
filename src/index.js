const fs = require('fs');
const Discord = require('discord.js');
// Functions to call
const categoryUpdate = require('./streamUpdate/categoryUpdate')
const favoritesUpdate = require('./streamUpdate/favoritesUpdate')
const checkRemoveRole = require('./streamUpdate/checkRemoveRole')
const checkAddRole = require('./streamUpdate/checkAddRole')
const roleUpdate = require('./streamUpdate/roleUpdate')

const cooldowns = new Discord.Collection();

require('dotenv').config();

// connect to database
const db = require('monk')(process.env.DB_URI)
const collection = db.get('document')


const prefix = process.env.PREFIX;

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log('info', 'The bot is online')
});

client.on('ready', () => {
  client.user.setActivity('!help');
  checkRemoveRole(client,collection);
  checkAddRole(client,collection);
  setInterval(function () {
    categoryUpdate(client, collection);
  }, 2.5 * 60 * 1000)
  setInterval(function () {
    favoritesUpdate(client,collection);
  }, 1 * 60 * 1000)
})

client.on('message', (message) => {

  if (!message.content.startsWith(prefix) || message.author.bot) return;
  if (message.guild.member(message.author).hasPermission('ADMINISTRATOR') || message.author.id === process.env.CREATOR_ID) {
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));


    if (!command) return
    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments, ${message.author}!`;
      if (command.usage) {
        reply += `\nThe proper usage would be: \`${command.usage}\``;
      }

      try {
        return message.channel.send(reply)
      } catch (error) {
        console.error(error, message.channel)
      }
    }

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        try {
          return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        } catch (error) {
          console.error(error, message.channel)
        }
      }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);


    try {
      command.execute(message, args, client,collection);
    } catch (error) {
      console.error(error);
      message.reply('there was an error trying to execute that command!');
    }
  }
});

client.on('presenceUpdate', (prevState, newState) => {
  roleUpdate(prevState, newState, client,collection)
})


client.login(process.env.BOT_TOKEN);
