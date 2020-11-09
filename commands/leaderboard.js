const Discord = require("discord.js");
const Player = require("../models/Player");

module.exports = {
  name: "leaderboard",
  description: "Shows the leaderboard",
  guildOnly: false,
  roleRequired: 0,
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    const embed = new Discord.MessageEmbed();

    try {
      const players = await Player.find({}).select("discordName wins losses points").sort({ points: -1 }).lean();

      if (players.length > 0) {
        for (let index = 0; index < players.length; index++) {
          const wins = players[index].wins;
          const losses = players[index].losses;
          let ratio;
          if (wins === 0 && losses === 0) {
            ratio = "0.00";
          } else {
            ratio = isFinite(wins/losses) ? (wins/losses).toFixed(2) : "♾️";
          }
          
          embed.addField(`#${index + 1} - ${players[index].discordName}`, `\`\`\`[Points: ${players[index].points}  W/L Ratio: ${ratio}]\`\`\``)
        }
      } else {
        embed.setDescription("Empty");
      }

      embed.setColor("GOLD");
      await msg.channel.send(embed);
    } catch (e) {
      console.error(e);
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
}