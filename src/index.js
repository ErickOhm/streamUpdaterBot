const fs = require('fs');
const Discord = require('discord.js');
const winston = require('winston')

const categoryUpdate = require('./streamUpdate/categoryUpdate')

require('dotenv').config();

const prefix = process.env.PREFIX;

const client = new Discord.Client();
client.commands = new Discord.Collection();
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'log' }),
  ],
  format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
});

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  //logger.log('info', 'The bot is online')
});

client.on('ready', () => {
  setInterval(function () {
    console.log('supposed to be sent')
    categoryUpdate(client);
  }, 10000)
})

client.on('message', (message) => {

  if (!message.content.startsWith(prefix) || message.author.bot) return;

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
});

client.login(process.env.BOT_TOKEN);
