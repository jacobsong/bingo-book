const Discord = require("discord.js");
const Player = require("../models/Player");
const config = require("../config/config");

const record = async (msg, args) => {
  const embed = new Discord.MessageEmbed();
  const firstId = args[0].replace(/[<@!>]/g, "");
  const secondId = args[2].replace(/[<@!>]/g, "");
  const firstGames = Number(args[1]);
  const secondGames = Number(args[3]);
  const thumbnails = {
    1: "https://cdn.discordapp.com/attachments/777028934520406017/777029231817261066/akatsuki.png",
    2: "https://cdn.discordapp.com/attachments/777028934520406017/777029241753567239/hinata.png",
    3: "https://cdn.discordapp.com/attachments/777028934520406017/777029243011072020/itachi.png",
    4: "https://cdn.discordapp.com/attachments/777028934520406017/777029246483824700/jiraiya.png",
    5: "https://cdn.discordapp.com/attachments/777028934520406017/777029249223491644/kakashi.png",
    6: "https://cdn.discordapp.com/attachments/777028934520406017/777029254926958602/naruto.png",
    7: "https://cdn.discordapp.com/attachments/777028934520406017/777029258065215488/obito.png",
    8: "https://cdn.discordapp.com/attachments/777028934520406017/777029260568428555/pain.png",
    9: "https://cdn.discordapp.com/attachments/777028934520406017/777029262904786952/tobi.png"
  }

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
    let footer = "";

    if (loser.bingo && winner.rank <= loser.rank) {
      const prize = Math.round(0.1 * loserOldELO);
      winner.points += prize;
      loser.bingo = false;
      loser.points -= prize;
      await loserMember.roles.remove(bingoRole);
      footer += `💰 ${winner.discordName} has crossed ${loser.discordName} off the Bingo Book\n`;
    }

    const {winnerRankUp, loserRankDown, winnerBonus} = calculateELO(winner, loser, winnerOldELO, loserOldELO);

    if (winnerBonus) {
      footer += `💰 ${winner.discordName} received a bonus of ${winnerBonus} points for having Bingo\n`;
    }

    if (loser.points < 0) {
      loser.points = 0;
    }

    if (winner.streak === 10) {
      winner.bingo = true;
      await winnerMember.roles.add(bingoRole);
      footer += `💰 ${winner.discordName} has been added to the Bingo Book\n`;
    }

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

    await winner.save();
    await loser.save();

    embed.setColor("AQUA");
    embed.setDescription(`${winner.discordName} wins ${winnerGames}-${loserGames}`);
    embed.setThumbnail(thumbnails[Math.floor(Math.random() * (9 - 1 + 1) + 1)]);
    embed.addField(`${winner.discordName}`, `\`\`\`Points:  ${winnerOldELO} => ${winner.points}\`\`\``);
    embed.addField(`${loser.discordName}`, `\`\`\`Points:  ${loserOldELO} => ${loser.points}\`\`\``);
    embed.setFooter(footer);
    msg.channel.send(embed);
  } catch (e) {
    console.error(e);
    embed.setColor("RED");
    embed.setDescription("Please make sure your rank matches what's on your =profile");
    msg.channel.send(embed);
  }
}

const calculateELO = (winner, loser, winnerOldPoints, loserOldPoints) => {
  const rtnVal = {
    winnerRankUp: false,
    loserRankDown: false,
    winnerBonus: 0
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

  if (winner.bingo) {
    const bonus = Math.round(0.25 * pointsGained);
    winner.points += bonus;
    rtnVal.winnerBonus = bonus;
  }

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