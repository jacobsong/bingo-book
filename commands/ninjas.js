const Discord = require("discord.js");
const Player = require("../models/Player");

module.exports = {
  name: "ninjas",
  description: "Returns the number of ninjas in each rank",
  guildOnly: false,
  roleRequired: 0,
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    const embed = new Discord.MessageEmbed().setColor("#37faff").setThumbnail("https://cdn.discordapp.com/attachments/777028934520406017/777029252355719218/madara.png");
  
    try {
      const genin = await Player.countDocuments({ rank: 1 });
      const chunin = await Player.countDocuments({ rank: 2 });
      const jonin = await Player.countDocuments({ rank: 3 });
      const anbu = await Player.countDocuments({ rank: 4 });

      embed.setDescription(`\`\`\`css\nGenin: ${genin}\nChunin: ${chunin}\nJonin: ${jonin}\nAnbu: ${anbu}\`\`\``);

      msg.channel.send(embed);
    } catch (e) {
      console.error(e);
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
}