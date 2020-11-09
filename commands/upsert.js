const Discord = require("discord.js");
const Player = require("../models/Player");
const config = require("../config/config");

module.exports = {
  name: "upsert",
  description: "Add or update a player. Use [=help upsert] for an example",
  guildOnly: true,
  roleRequired: 2,
  argsRequired: 6,
  mentionsRequired: 1,
  usage: "<user> <points> <wins> <losses> <streak> <bingo> <rank>",
  async execute(msg, args) {
    const playerId = msg.mentions.users.first().id;
    const playerName = msg.mentions.users.first().username;
    const playerMember = msg.mentions.members.first();
    const embed = new Discord.MessageEmbed();

    try {
      const result = await Player.updateOne(
        { discordId: playerId },
        { $set: { 
            discordId: playerId, 
            discordName: playerName, 
            lastMatch: Date.now(),
            points: args[1], 
            wins: args[2], 
            losses: args[3], 
            streak: args[4], 
            bingo: args[5], 
            rank: config.rankNames[args[6]] } },
        { upsert: true }
      );

      // Remove existing rank roles
      const oldRoles = [];
      Object.keys(config.rankNames).forEach(rankName => {
        oldRoles.push(msg.guild.roles.cache.find(role => role.name === rankName));
      });
      await playerMember.roles.remove(oldRoles);

      // Add new rank role
      const newRole = msg.guild.roles.cache.find(role => role.name === args[6]);
      await playerMember.roles.add(newRole);

      if (result.nModified === 1) {
        embed.setColor("GREEN");
        embed.setDescription(`**Success**, ${playerName} has been updated`);
        msg.channel.send(embed);
        return;
      } else if (result.n === 1) {
        embed.setColor("GREEN");
        embed.setDescription(`**Success**, ${playerName} has been added`);
        msg.channel.send(embed);
        return;
      }
    } catch (e) {
      console.error(e);
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
}