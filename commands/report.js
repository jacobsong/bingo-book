const Discord = require("discord.js");
const Player = require("../models/Player");

module.exports = {
  name: "report",
  description: "Report a ranked set. Use [=help report] for an example",
  guildOnly: true,
  roleRequired: 0,
  argsRequired: 2,
  mentionsRequired: 2,
  usage: "<user> <games-won> <user> <games-won>",
  async execute(msg, args) {
    const playerId = msg.mentions.users.first().id;
    const playerName = msg.mentions.users.first().username;
    const embed = new Discord.MessageEmbed();
  }
}