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
      const players = await Player.find({}).select("discordName points").sort({ points: -1 }).lean();
      let board = "Empty";
      if (players.length > 0) {
        board = "```";
        for (let index = 0; index < players.length; index++) {
          board += `#${index + 1} - Points: ${players[index].points} ${players[index].discordName}\n`;
        }
        board += "```";
      }

      embed.setTitle("Leaderboard");
      embed.setColor("GOLD");
      embed.setDescription(board);
      await msg.channel.send(embed);
    } catch {
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
}