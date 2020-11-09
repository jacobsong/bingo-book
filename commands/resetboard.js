const Discord = require("discord.js");
const Player = require("../models/Player");

module.exports = {
  name: "resetboard",
  description: "Resets the leaderboard",
  guildOnly: true,
  roleRequired: 3,
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    const embed = new Discord.MessageEmbed();
    try {
      await Player.updateMany({}, { $set: { points: 0, wins: 0, losses: 0, streak: 0, bingo: false, rank: 1 } });
      embed.setColor("GREEN");
      embed.setDescription("**Success**, leaderboard has been reset");
      msg.channel.send(embed);
    } catch (e) {
      console.error(e);
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
}