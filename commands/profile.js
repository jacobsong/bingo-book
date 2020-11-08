const Discord = require("discord.js");
const Player = require("../models/Player");

module.exports = {
  name: "profile",
  description: "Displays your own profile or the mentioned user's profile",
  guildOnly: true,
  usage: "<user> (optional)",
  async execute(msg, args) {
    if (validator.isCommand(msg)) {
      let playerId = msg.author.id;
      let playerAvatar = msg.author.avatarURL({ dynamic: true });
  
      const result = validator.checkArgs(msg);
      if (result.errors) { msg.channel.send(result.errors); return; }
      if (result.numArgs > 0) {
        errors = validator.checkMember(msg.mentions.members.first());
        if (errors) { msg.channel.send(errors); return; }
        playerId = msg.mentions.users.first().id;
        playerAvatar = msg.mentions.users.first().avatarURL({ dynamic: true });
      }
  
      const embed = new Discord.MessageEmbed();
  
      try {
        const profile = await Player.findOne({ discordId: playerId }).lean();
  
        if (profile) {
          const days = Math.round((Date.now() - profile.lastMatch.getTime()) / (24 * 60 * 60 * 1000));
          let dayText = " ";
          let stats = `\`\`\`ELO:    ${profile.elo}\nWins:   ${profile.wins}\nLosses: ${profile.losses}\nStreak: ${profile.streak || 0}\`\`\``;
  
          if (days === 0) dayText = "Today";
          if (days === 1) dayText = "Yesterday";
          if (days > 1) dayText = `${days} days ago`;
          if (profile.bounty) {
            embed.setAuthor(`⭐ Bounty ${profile.prize} ELO`);
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
}