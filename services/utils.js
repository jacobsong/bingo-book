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
    Object.keys(config.ranks).forEach(rankNum => {
      const rankRole = msg.guild.roles.cache.find(role => role.name === config.ranks[rankNum]);
      roles.set(rankNum, rankRole);
    });
    
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
    const {winnerRankUp, loserRankDown} = calculateELO(winner, loser, winnerOldELO, loserOldELO);

    if (winnerRankUp && winner.rank < 4) {
      await winnerMember.roles.remove(roles.get(winner.rank.toString()));
      winner.rank += 1;
      await winnerMember.roles.add(roles.get(winner.rank.toString()));
    }

    if (loserRankDown && loser.rank > 1) {
      await loserMember.roles.remove(roles.get(loser.rank.toString()));
      loser.rank -= 1;
      await loserMember.roles.add(roles.get(loser.rank.toString()));
    }

    let footer = "";

    if (winner.streak === 10) {
      winner.bingo = true;
      footer += `💰 ${winner.discordName} has been added to the Bingo Book\n`;
      await winnerMember.roles.add(bingoRole);
    }

    if (loser.bingo && winner.rank <= loser.rank) {
      const prize = Math.round(0.1 * loserOldELO);
      winner.points += prize;
      loser.bingo = false;
      loser.points -= prize;
      await loserMember.roles.remove(bingoRole);
      footer += `💰 ${winner.discordName} has crossed ${loser.discordName} off the Bingo Book\n`;
    }    

    await winner.save();
    await loser.save();

    embed.setColor("AQUA");
    embed.setDescription(`${winner.discordName} wins ${winnerGames}-${loserGames}`);
    embed.setThumbnail("https://cdn.discordapp.com/emojis/774169144240373803.png");
    embed.addField(`${winner.discordName}`, `\`\`\`Points:  ${winnerOldELO} => ${winner.points}\`\`\``);
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

const calculateELO = (winner, loser, winnerOldPoints, loserOldPoints) => {
  const rtnVal = {
    winnerRankUp: false,
    loserRankDown: false,
  };

  let pointsGained;
  if ((winner.rank - loser.rank) === 0) {
    pointsGained = 7;
  } else if ((winner.rank - loser.rank) === 1) {
    pointsGained = 4;
  } else if ((winner.rank - loser.rank) === -1) {
    pointsGained = 10;
  }

  winner.wins += 1;
  winner.points += pointsGained;
  winner.streak += 1;
  winner.lastMatch = Date.now();
  loser.losses += 1;
  loser.points -= pointsGained;
  loser.streak = 0;
  loser.lastMatch = Date.now();

  if (winnerOldPoints < 65 && winner.points >= 65 && winner.points < 130 && winner.rank === 1) rtnVal.winnerRankUp = true;
  if (winnerOldPoints < 130 && winner.points >= 130 && winner.points < 220 && winner.rank === 2) rtnVal.winnerRankUp = true;
  if (winnerOldPoints < 220 && winner.points >= 220 && winner.rank === 3) rtnVal.winnerRankUp = true;

  if (loserOldPoints >= 33 && loser.points < 33 && loser.rank === 2) rtnVal.loserRankDown = true;
  if (loserOldPoints >= 98 && loser.points < 98 && loser.rank === 3) rtnVal.loserRankDown = true;
  if (loserOldPoints >= 175 && loser.points < 175 && loser.rank === 4) rtnVal.loserRankDown = true;

  return rtnVal;
};

module.exports = {
  record
}