const Discord = require("discord.js");
const Player = require("../models/Player");
const config = require("../config/config");

const record = async (msg, args) => {
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
    const roles = new Discord.Collection();
    Object.keys(config.rankNames).forEach(rankName => {
      const rankRole = msg.guild.roles.cache.find(role => role.name === rankName);
      roles.set(rankName, rankRole);
    })
    

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

    const winnerOldELO = winner.points;
    const loserOldELO = loser.points;
    calculateELO(winner, loser);

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
      eloFieldMsg = `\`\`\`Points:  ${winnerOldELO} => ${winner.points} + ${prize}\`\`\``;
    } else {
      eloFieldMsg = `\`\`\`Points:  ${winnerOldELO} => ${winner.points}\`\`\``;
    }

    await winner.save();
    await loser.save();

    embed.setColor("AQUA");
    embed.setDescription(`${winner.discordName} wins ${winnerGames}-${loserGames}`);
    embed.setThumbnail("https://cdn.discordapp.com/emojis/774169144240373803.png");
    embed.addField(`${winner.discordName}`, eloFieldMsg);
    embed.addField(`${loser.discordName}`, `\`\`\`Points:  ${loserOldELO} => ${loser.points}\`\`\``);
    embed.setFooter(footer);
    msg.channel.send(embed);
  } catch (e) {
    console.error(e);
    embed.setColor("RED");
    embed.setDescription("Database error");
    msg.channel.send(embed);
  }
}

const calculateELO = (winner, loser) => {
  const rtnVal = {
    winnerRankUp: false,
    loserRankDown: false,
    bingoPrize: 0
  };
  winner.wins += 1;
  winner.points += 7
  winner.streak += 1;
  winner.lastMatch = Date.now();
  loser.losses += 1;
  loser.points -= 7
  loser.streak = 0;
  loser.lastMatch = Date.now();

  return rtnVal;
};

module.exports = {
  record
}