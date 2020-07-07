const fs = require('fs');
const Discord = require('discord.js');
const categoryUpdate = require('./streamUpdate/categoryUpdate')
const favoritesUpdate = require('./streamUpdate/favoritesUpdate')

require('dotenv').config();

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
  setInterval(function () {
    categoryUpdate(client);
  }, 2.5 * 60 * 1000)
  setInterval(function () {
    favoritesUpdate(client);
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
        reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
      }

      return message.channel.send(reply);
    }


    try {
      command.execute(message, args, client);
    } catch (error) {
      console.error(error);
      message.reply('there was an error trying to execute that command!');
    }
  }
});

client.login(process.env.BOT_TOKEN);
