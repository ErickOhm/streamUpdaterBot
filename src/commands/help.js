const Discord = require('discord.js')
require('dotenv').config();

const prefix = process.env.PREFIX;


module.exports = {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  aliases: ['commands'],
  usage: '!help <command name>',
  cooldown: 5,
  execute(message, args) {
    const { commands } = message.client;

    const helpEmbed = new Discord.MessageEmbed()
      .setColor('#3498db')
      .setTitle('Help')
      .setDescription('Here\'s a list of all my commands:')
      .addFields({ name: 'Command name', value: `${commands.map((command) => command.name).join(', ')}` }, { name: 'More info:', value: `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!` })


    if (!args.length) {
      return message.channel.send(helpEmbed)
    }
    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find((c) => c.aliases && c.aliases.includes(name));

    if (!command) {
      return message.reply('that\'s not a valid command!');
    }

    const moreInfoEmbed = new Discord.MessageEmbed()
      .setColor('#0984e3')
      .setTitle(command.name.toUpperCase())
      .setDescription(command.description)
      .addFields({ name: 'Aliases', value: `${command.aliases ? command.aliases.join(', ') : 'No aliases'}` }, { name: 'Usage', value: command.usage }, { name: 'Cooldown', value: `${command.cooldown || 3} second(s)` })
    message.channel.send(moreInfoEmbed);
  },
};
