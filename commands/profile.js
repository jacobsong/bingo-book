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
    const rankColors = new Discord.Collection();
    rankColors.set(1, "#36cf5f");
    rankColors.set(2, "#96cc2e");
    rankColors.set(3, "#e6a323");
    rankColors.set(4, "#d32819");
    let playerId = msg.author.id;
    let playerAvatar = msg.author.avatarURL({ dynamic: true });

    if (args[0]) {
      if (msg.channel.type === "dm") {
        playerId = args[0];
        try {
          playerAvatar = (await msg.client.users.fetch(args[0])).avatarURL({ dynamic: true });
        } catch (e) {
          return;
        }
      } else if (msg.mentions.members.size === 1) {
        playerId = msg.mentions.users.first().id;
        playerAvatar = msg.mentions.users.first().avatarURL({ dynamic: true });
      } else {
        playerId = args[0];
        try {
          playerAvatar = (await msg.client.users.fetch(args[0])).avatarURL({ dynamic: true });
        } catch (e) {
          return;
        }
      }
    }

    const embed = new Discord.MessageEmbed();

    try {
      const profile = await Player.findOne({ discordId: playerId }).lean();

      if (profile) {
        const days = Math.round((Date.now() - profile.lastMatch.getTime()) / (24 * 60 * 60 * 1000));
        const playerRank = (await Player.countDocuments({ "points": {"$gt": profile.points }})) + 1;
        let dayText = " ";
        let stats = `\`\`\`css\nRanking: #${playerRank}\`\`\``;
        stats += `\`\`\`Points: ${profile.points}\nWins:   ${profile.wins}\nLosses: ${profile.losses}\nStreak: ${profile.streak}\nRank:   ${config.ranks[profile.rank.toString()]}\`\`\``;

        if (days === 0) dayText = "Today";
        if (days === 1) dayText = "Yesterday";
        if (days > 1) dayText = `${days} days ago`;
        if (profile.bingo) {
          embed.setTitle("⭕ Bingo");
        }

        embed.setColor(rankColors.get(profile.rank));
        embed.setAuthor(profile.discordName);
        embed.setThumbnail(playerAvatar);
        embed.setDescription(stats);
        embed.setFooter(`Last match played: ${dayText}`);
        msg.channel.send(embed);
        return;
      }

      embed.setColor("BLUE");
      embed.setDescription("Profile not found");
      msg.channel.send(embed);

    } catch (e) {
      console.error(e);
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
}