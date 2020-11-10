const Discord = require("discord.js");
const Utils = require("../services/utils");

module.exports = {
  name: "report",
  description: "Report a ranked set. Use [=help report] for an example",
  guildOnly: true,
  roleRequired: 0,
  argsRequired: 2,
  mentionsRequired: 2,
  usage: "<user> <games-won> <user> <games-won>",
  async execute(msg, args) {
    const firstId = args[0].replace(/[<@!>]/g, "");
    const secondId = args[2].replace(/[<@!>]/g, "");
    const firstGames = Number(args[1]);
    const secondGames = Number(args[3]);
    const embed = new Discord.MessageEmbed();

    try {
      msg.delete({ timeout: 1500 });
      const firstUser = await msg.guild.members.fetch(firstId);
      const secondUser = await msg.guild.members.fetch(secondId);
      let winnerUser;
      let loserUser;
      let winnerGames;
      let loserGames;

      if (firstGames > secondGames) {
        winnerUser = firstUser.user;
        winnerGames = firstGames;
        loserUser = secondUser.user;
        loserGames = secondGames;
      } else {
        winnerUser = secondUser.user;
        winnerGames = secondGames;
        loserUser = firstUser.user;
        loserGames = firstGames;
      }

      embed.setAuthor(winnerUser.tag, winnerUser.avatarURL({ dynamic: true }));
      embed.setTitle(`${winnerUser.username} won ${winnerGames} - ${loserGames}`);
      embed.setDescription(`**Winner:** ${winnerUser}\n**Loser:** ${loserUser}`);
      embed.setThumbnail("https://cdn.discordapp.com/icons/752745454839791666/9ddd3f60283dd48345e2494e644562e8.png?size=1024");
      embed.setColor("GREEN");
      embed.setFooter("The loser must react with ✅ in order for the set to be recorded", loserUser.avatarURL({ dynamic: true }));

      try {
        const msg2 = await msg.channel.send(`${winnerUser} ${loserUser}`, embed);
        await msg2.react("✅");

        const filter = (reaction, user) => {
          return reaction.emoji.name === "✅" && user.id === loserUser.id;
        }

        const collected = await msg2.awaitReactions(filter, { max: 1, time: 300000, errors: ["time"] });
        if (collected.size) {
          Utils.record(msg, args);
        }
      } catch (e) {
        msg.author.send("Your opponent did not verify the results within 5 minutes");
        return;
      }
      
    } catch (e) {
      console.error(e);
      embed.setColor("RED");
      embed.setDescription("User not found");
      msg.channel.send(embed);
    }
  }
}