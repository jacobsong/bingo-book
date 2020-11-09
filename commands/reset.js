const Discord = require("discord.js");
const Player = require("../models/Player");

module.exports = {
  name: "reset",
  description: "Resets stats for the mentioned user. Use [=help reset] for an example",
  guildOnly: true,
  roleRequired: 3,
  argsRequired: 0,
  mentionsRequired: 1,
  usage: "<user>",
  async execute(msg, args) {
    const playerId = msg.mentions.users.first().id;
    const playerName = msg.mentions.users.first().username;
    const embed = new Discord.MessageEmbed();

    try {
      const result = await Player.updateOne({ discordId: playerId }, { $set: { points: 0, wins: 0, losses: 0, streak: 0, bingo: false, rank: 1 } });
      if (result.n == 1) {
        embed.setColor("GREEN");
        embed.setDescription(`**Success**, stats have been reset for ${playerName}`);
        msg.channel.send(embed);
        return;
      }
      embed.setColor("BLUE");
      embed.setDescription("Player not found");
      msg.channel.send(embed);
      return;
    } catch (e) {
      console.error(e);
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
}