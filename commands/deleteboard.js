
module.exports = {
  name: "deleteboard",
  description: "Deletes the leaderboard",
  guildOnly: true,
  usage: undefined,
  async execute(msg, args) {
    const modErrors = validator.checkMod(msg);
  if (modErrors) { msg.channel.send(modErrors); return; }
  const embed = new Discord.MessageEmbed();

  try {
    await Player.deleteMany({});
    embed.setColor("GREEN");
    embed.setDescription("**Success**, leaderboard has been deleted");
    msg.channel.send(embed);
  } catch {
    embed.setColor("RED");
    embed.setDescription("Database error");
    msg.channel.send(embed);
  }
  }
}