
module.exports = {
  name: "remove",
  description: "Removes the user ID from the leaderboard",
  guildOnly: true,
  usage: undefined,
  async execute(msg, args) {
    if (validator.isCommand(msg)) {
      const modErrors = validator.checkMod(msg);
      if (modErrors) { msg.channel.send(modErrors); return; }
  
      const embed = new Discord.MessageEmbed().setColor("RED");
      const msgArr = msg.content.split(" ");
  
      if (msgArr.length - 1 === 0) {
        embed.setDescription("**Error**: Did not specify a user ID");
        msg.channel.send(embed);
        return;
      }
      if (msgArr.length - 1 > 1) {
        embed.setDescription("**Error**: Too many parameters");
        msg.channel.send(embed);
        return;
      }
  
      try {
        const result = await Player.deleteOne({ discordId: msgArr[1] });
        if (result.deletedCount === 0) {
          embed.setDescription("That User ID does not exist");
          msg.channel.send(embed);
          return;
        }
        embed.setColor("GREEN");
        embed.setDescription("**Success**: Deleted user ID " + msgArr[1]);
        msg.channel.send(embed);
      } catch {
        embed.setDescription("Database error");
        msg.channel.send(embed);
      }
    }
  }
}