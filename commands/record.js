const Discord = require("discord.js");
const Player = require("../models/Player");
const Utils = require("../services/utils");

module.exports = {
  name: "record",
  description: "Records a match between 2 players",
  guildOnly: true,
  roleRequired: 2,
  argsRequired: 2,
  mentionsRequired: 2,
  usage: "<user> <games-won> <user> <games-won>",
  async execute(msg, args, client) {
    const embed = new Discord.MessageEmbed();
    const firstId = args[0].replace(/[<@!>]/g, "");
    const secondId = args[2].replace(/[<@!>]/g, "");
    const firstGames = Number(args[1]);
    const secondGames = Number(args[3]);

    try {
      let firstPlayer = await Player.findOne({ discordId: firstId });
      let secondPlayer = await Player.findOne({ discordId: secondId });
      const firstMember = await msg.guild.members.fetch(firstId);
      const secondMember = await msg.guild.members.fetch(secondId);
      const bingoRole = msg.guild.roles.cache.find(role => role.name === "Bingo");

      if (firstPlayer === null) {
        firstPlayer = new Player({ discordId: firstId, discordName: firstMember.user.username });
      }

      if (secondPlayer === null) {
        secondPlayer = new Player({ discordId: secondId, discordName: secondMember.user.username });
      }

      let winner;
      let loser;
      let winnerMember;
      let loserMember;
      let winnerGames;
      let loserGames;

      if (firstGames > secondGames) {
        winner = firstPlayer;
        winnerMember = firstMember;
        winnerGames = firstGames;
        loser = secondPlayer;
        loserMember = secondMember;
        loserGames = secondGames;
      } else {
        winner = secondPlayer;
        winnerMember = secondMember;
        winnerGames = secondGames;
        loser = firstPlayer;
        loserMember = firstMember;
        loserGames = firstGames;
      }

      const newELOs = Utils.calculateELO(winner.points, loser.points, winnerGames, loserGames);
      const winnerOldELO = winner.points;
      const loserOldELO = loser.points;

      winner.wins += 1;
      winner.points = newELOs.winnerRating;
      winner.streak += 1;
      winner.lastMatch = Date.now();
      loser.losses += 1;
      loser.points = newELOs.loserRating;
      loser.streak = 0;
      loser.lastMatch = Date.now();

      let eloFieldMsg = "";
      let footer = "";

      if (winner.streak === 3) {
        winner.bingo = true;
        footer += `💰 ${winner.discordName} has been added to the Bingo Book\n`;
        await winnerMember.roles.add(bingoRole);
      }

      if (loser.bingo) {
        const prize = 12
        winner.points += prize;
        loser.bingo = false;
        await loserMember.roles.remove(bingoRole);
        footer += `💰 ${winner.discordName} has crossed ${loser.discordName} off the Bingo Book\n`;
        eloFieldMsg = `\`\`\`Points:  ${winnerOldELO} => ${newELOs.winnerRating} + ${prize}\`\`\``;
      } else {
        eloFieldMsg = `\`\`\`Points:  ${winnerOldELO} => ${newELOs.winnerRating}\`\`\``;
      }

      await winner.save();
      await loser.save();

      embed.setColor("AQUA");
      embed.setDescription(`${winner.discordName} wins ${winnerGames}-${loserGames}`);
      embed.setThumbnail("https://cdn.discordapp.com/emojis/774169144240373803.png");
      embed.addField(`${winner.discordName}`, eloFieldMsg);
      embed.addField(`${loser.discordName}`, `\`\`\`Points:  ${loserOldELO} => ${newELOs.loserRating}\`\`\``);
      embed.setFooter(footer);
      msg.channel.send(embed);
    } catch (e) {
      console.log(e);
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
}