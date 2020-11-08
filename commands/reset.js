
module.exports = {
  name: "reset",
  description: "Resets stats for the mentioned user",
  guildOnly: true,
  usage: undefined,
  async execute(msg, args) {
    if (validator.isCommand(msg)) {
      const playerId = msg.mentions.users.first().id;
      const playerName = msg.mentions.users.first().username;
      const playerMember = msg.mentions.members.first();
      const result = validator.checkArgs(msg);
      if (result.errors) { msg.channel.send(result.errors); return; }
      if (result.numArgs === 0) {
        const missing = new Discord.MessageEmbed()
          .setColor("RED")
          .setDescription("**Error**: You must mention a user with @");
        msg.channel.send(missing);
        return;
      }
      if (result.numArgs > 0) {
        const modErrors = validator.checkMod(msg);
        if (modErrors) { msg.channel.send(modErrors); return; }
  
        const memberErrors = validator.checkMember(playerMember);
        if (memberErrors) { msg.channel.send(memberErrors); return; }
  
        const embed = new Discord.MessageEmbed();
  
        try {
          const result = await Player.updateOne({ discordId: playerId }, { $set: { elo: 1000, wins: 0, losses: 0 } });
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
        } catch {
          embed.setColor("RED");
          embed.setDescription("Database error");
          msg.channel.send(embed);
        }
      }
    }
  }
}