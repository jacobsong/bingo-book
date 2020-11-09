const Discord = require("discord.js");
const Player = require("../models/Player");

module.exports = {
  name: "deleteboard",
  description: "Deletes the leaderboard",
  guildOnly: true,
  roleRequired: 3,
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    const embed = new Discord.MessageEmbed();

    try {
      await Player.deleteMany({});
      embed.setColor("GREEN");
      embed.setDescription("**Success**, leaderboard has been deleted");
      msg.channel.send(embed);
    } catch (e) {
      console.error(e);
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
}