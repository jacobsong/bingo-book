const Discord = require("discord.js");
const Player = require("../models/Player");
const config = require("../config/config");

module.exports = {
  name: "bingo",
  description: "List players in the Bingo Book",
  guildOnly: false,
  roleRequired: 0,
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    const embed = new Discord.MessageEmbed();
  
    try {
      const players = await Player.find({ bingo: true }).sort({ streak: -1 }).lean();
      if (players.length) {
        embed.setTitle("Bingo Book")
        embed.setColor("DARK_GOLD");
        players.forEach(player => {
          embed.addField(`⭕   ${player.discordName}`, `\`\`\`Rank:   ${config.ranks[player.rank.toString()]}\nStreak: ${player.streak}\`\`\``);
        })
      } else {
        embed.setColor("DARK_GOLD");
        embed.setDescription("No Bingos");
      }
      msg.channel.send(embed);
    } catch (e) {
      console.error(e);
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
}