const Discord = require("discord.js");
const Player = require("../models/Player");
const config = require("../config/config");

module.exports = {
  name: "profile",
  description: "Displays your own profile or the mentioned user's profile",
  guildOnly: false,
  roleRequired: 0,
  argsRequired: 0,
  mentionsRequired: 0,
  usage: "<user> (optional)",
  async execute(msg, args) {
    let playerId = msg.author.id;
    let playerAvatar = msg.author.avatarURL({ dynamic: true });

    if (msg.mentions.members.size === 1) {
      playerId = msg.mentions.users.first().id;
      playerAvatar = msg.mentions.users.first().avatarURL({ dynamic: true });
    }

    const embed = new Discord.MessageEmbed();

    try {
      const profile = await Player.findOne({ discordId: playerId }).lean();

      if (profile) {
        const days = Math.round((Date.now() - profile.lastMatch.getTime()) / (24 * 60 * 60 * 1000));
        let dayText = " ";
        let stats = `\`\`\`Points: ${profile.points}\nWins:   ${profile.wins}\nLosses: ${profile.losses}\nStreak: ${profile.streak}\nRank:   ${config.ranks[profile.rank.toString()]}\`\`\``;

        if (days === 0) dayText = "Today";
        if (days === 1) dayText = "Yesterday";
        if (days > 1) dayText = `${days} days ago`;
        if (profile.bingo) {
          embed.setAuthor("⭐ Bingo");
        }

        embed.setColor("LUMINOUS_VIVID_PINK");
        embed.setTitle(profile.discordName);
        embed.setThumbnail(playerAvatar);
        embed.setDescription(stats);
        embed.setFooter(`Last match played: ${dayText}`);
        msg.channel.send(embed);
        return;
      }

      embed.setColor("BLUE");
      embed.setDescription("Profile not found");
      msg.channel.send(embed);

    } catch {
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
}