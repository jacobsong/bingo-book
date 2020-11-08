
module.exports = {
  name: "resetboard",
  description: "Resets the leaderboard",
  guildOnly: true,
  usage: undefined,
  async execute(msg, args) {
    const modErrors = validator.checkMod(msg);
  if (modErrors) { msg.channel.send(modErrors); return; }
  const embed = new Discord.MessageEmbed();

  try {
    await Player.updateMany({}, { $set: { elo: 1000, wins: 0, losses: 0 } });
    embed.setColor("GREEN");
    embed.setDescription("**Success**, leaderboard has been reset");
    msg.channel.send(embed);
  } catch {
    embed.setColor("RED");
    embed.setDescription("Database error");
    msg.channel.send(embed);
  }
  }
}