const Discord = require("discord.js");
module.exports = {
    name: "stats",
    description: "show bot stats (bot admin only)",
    usage: "!stats",
    async execute(message, args, client, collection) {
        if (message.author.id === process.env.CREATOR_ID) {
            const used = process.memoryUsage();
            const heapTotal =
                Math.round((used.heapTotal / 1024 / 1024) * 100) / 100;
            const heapUsed =
                Math.round((used.heapUsed / 1024 / 1024) * 100) / 100;
            const embed = new Discord.MessageEmbed()
                .setColor("#1abc9c")
                .setTitle("Memory Usage")
                .setTimestamp(new Date())
                .addFields(
                    {
                        name: "Heap Total",
                        value: `${heapTotal}MB`,
                        inline: true,
                    },
                    { name: "Heap Used", value: `${heapUsed}MB`, inline: true }
                );
            message.channel.send(embed);
        }
    },
};
