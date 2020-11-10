const Discord = require("discord.js");
const Player = require("../models/Player");

module.exports = {
  name: "remove",
  description: "Removes the user ID from the leaderboard. Use [=help remove] for an example",
  guildOnly: true,
  roleRequired: 1,
  argsRequired: 1,
  mentionsRequired: 0,
  usage: "<userID>",
  async execute(msg, args) {
    const embed = new Discord.MessageEmbed().setColor("RED");  
    try {
      const result = await Player.deleteOne({ discordId: args[0] });
      if (result.deletedCount === 0) {
        embed.setDescription("That User ID does not exist");
        msg.channel.send(embed);
        return;
      }
      embed.setColor("GREEN");
      embed.setDescription("**Success**: Deleted user ID " + args[0]);
      msg.channel.send(embed);
    } catch (e) {
      console.error(e);
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
}