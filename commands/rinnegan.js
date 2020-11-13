const Discord = require("discord.js");
const Player = require("../models/Player");
const config = require("../config/config");

module.exports = {
  name: "rinnegan",
  description: "Fix the failures of mankind",
  guildOnly: true,
  roleRequired: 3,
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    const embed = new Discord.MessageEmbed().setColor("#bd9fe7");
    const allRoles = [];
    Object.keys(config.rankNames).forEach(rankName => {
      allRoles.push(msg.guild.roles.cache.find(role => role.name === rankName));
    });

    try {
      const result = await Player.find({}).lean();
      let count = 0;

      for (let player of result) {
        try {
          const playerMember = await msg.guild.members.fetch(player.discordId);
        } catch (e) {
          continue;
        }
        const currentRoles = playerMember.roles.cache.filter(role => role.name in config.rankNames);
        if (currentRoles.size > 0) {
          if (currentRoles.size > 1) {
            await playerMember.roles.remove(allRoles);
            const newRole = msg.guild.roles.cache.find(role => role.name === config.ranks[player.rank]);
            await playerMember.roles.add(newRole);

            embed.setDescription(`${playerMember} - the correct role of ${config.ranks[player.rank]} has been given`);
            msg.channel.send(embed);
            count++;
          } else if (config.rankNames[currentRoles.first().name] != player.rank) {
            await playerMember.roles.remove(allRoles);
            const newRole = msg.guild.roles.cache.find(role => role.name === config.ranks[player.rank]);
            await playerMember.roles.add(newRole);

            embed.setDescription(`${playerMember} - the correct role of ${config.ranks[player.rank]} has been given`);
            msg.channel.send(embed);
            count++;
          }
        }
      }

      if (count === 0) {
        embed.setDescription("Everything looks fine");
        msg.channel.send(embed);
      }

    } catch (e) {
      console.error(e);
      embed.setColor("RED");
      embed.setDescription("Error fetching members");
      msg.channel.send(embed);
    }
  }
}