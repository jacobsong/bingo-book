
module.exports = {
  name: "bingo",
  description: "List players in the Bingo Book",
  guildOnly: false,
  usage: undefined,
  async execute(msg, args) {
      const embed = new Discord.MessageEmbed();
    
      try {
        const players = await Player.find({ bounty: true }).select("discordName streak bounty prize").sort({ prize: -1 }).lean();
        if (players.length) {
          embed.setTitle(":moneybag: :moneybag: :moneybag:")
          embed.setColor("DARK_GOLD");
          players.forEach(player => {
            embed.addField(`${player.discordName}`, `\`\`\`Prize:  ${player.prize} ELO\nStreak: ${player.streak} Kills\`\`\``);
          })
        } else {
          embed.setColor("DARK_GOLD");
          embed.setDescription("No bounties");
        }
        msg.channel.send(embed);
      } catch {
        embed.setColor("RED");
        embed.setDescription("Database error");
        msg.channel.send(embed);
      }
    
  }
}