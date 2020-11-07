const Discord = require("discord.js");
const Message = require("../models/Message");
const Player = require("../models/Player");
const System = require('../models/System');
const validator = require("./validator");

const help = (msg) => {
  const embed = new Discord.MessageEmbed()
    .setTitle("Command List")
    .setColor("BLUE")
    .addField("**status**", "- Check a user's activity status")
    .addField("**register**", "- Registers yourself")
    .addField("**register** *<user>*", "- Registers the mentioned user")
    .addField("**unregister** *<userID>*", "- Unregisters the user ID")
    .addField("**profile**", "- Returns stats for yourself")
    .addField("**profile** *<user>*", "- Returns stats for the mentioned user")
    .addField("**bounties**", "- Fetches a list of people with bounties")
    .addField("**ducknofades**", "- Shows what ELO scores you should challenge")
    .addField("**leaderboard**", "- Shows the leaderboard")
    .addField("**reset** *<user>*", "- Resets stats for the mentioned user")
    .addField("**resetboard**", "- Resets the leaderboard")
    .addField("**deleteboard**", "- Deletes the leaderboard")
    .addField("**decay**", "- Decays ELO for players that have not played a match in 7 days")
    .addField("**record** *<user>* *<games-won>* *<user>* *<games-won>*",
      ["- Records a match between 2 players", "- Example: \`=record @vizi 3 @sack 1\`"]);

  msg.channel.send(embed);
};

const register = async (msg) => {
  if (validator.isCommand(msg)) {
    let playerId = msg.author.id;
    let playerName = msg.author.username;
    let playerMember = msg.member;

    const result = validator.checkArgs(msg);
    if (result.errors) { msg.channel.send(result.errors); return; }
    if (result.numArgs > 0) {
      let errors = validator.checkMod(msg);
      if (errors) { msg.channel.send(errors); return; }
      playerId = msg.mentions.users.first().id;
      playerName = msg.mentions.users.first().username;
      playerMember = msg.mentions.members.first();
    }

    const memberErrors = validator.checkMember(playerMember);
    if (memberErrors) { msg.channel.send(memberErrors); return; }

    const embed = new Discord.MessageEmbed();

    try {
      const existingPlayer = await Player.find({ discordId: playerId }).limit(1);

      if (existingPlayer.length) {
        embed.setColor("GREEN");
        embed.setDescription("Already registered");
        msg.channel.send(embed);
        return;
      }

      await new Player({
        discordId: playerId,
        discordName: playerName
      }).save();

      embed.setColor("GREEN");
      embed.setDescription(`**Success**, registered ${playerName}`);
      msg.channel.send(embed);

    } catch {
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
};

const unregister = async (msg) => {
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
};

const profile = async msg => {
  if (validator.isCommand(msg)) {
    let playerId = msg.author.id;
    let playerAvatar = msg.author.avatarURL({ dynamic: true });

    const result = validator.checkArgs(msg);
    if (result.errors) { msg.channel.send(result.errors); return; }
    if (result.numArgs > 0) {
      errors = validator.checkMember(msg.mentions.members.first());
      if (errors) { msg.channel.send(errors); return; }
      playerId = msg.mentions.users.first().id;
      playerAvatar = msg.mentions.users.first().avatarURL({ dynamic: true });
    }

    const embed = new Discord.MessageEmbed();

    try {
      const profile = await Player.findOne({ discordId: playerId }).lean();

      if (profile) {
        const days = Math.round((Date.now() - profile.lastMatch.getTime()) / (24 * 60 * 60 * 1000));
        let dayText = " ";
        let stats = `\`\`\`ELO:    ${profile.elo}\nWins:   ${profile.wins}\nLosses: ${profile.losses}\nStreak: ${profile.streak || 0}\`\`\``;

        if (days === 0) dayText = "Today";
        if (days === 1) dayText = "Yesterday";
        if (days > 1) dayText = `${days} days ago`;
        if (profile.bounty) {
          embed.setAuthor(`⭐ Bounty ${profile.prize} ELO`);
        }

        embed.setColor("LUMINOUS_VIVID_PINK");
        embed.setTitle(profile.discordName);
        embed.setThumbnail(playerAvatar);
        embed.setDescription(stats);
        embed.setFooter(`Last match played: ${dayText}`);
        msg.channel.send(embed);
        return;
      }

      embed.setColor("BLUE");
      embed.setDescription("Profile not found");
      msg.channel.send(embed);

    } catch {
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
};

const status = async (msg, client) => {
  if (validator.isCommand(msg)) {
    const embed = new Discord.MessageEmbed();
    const result = validator.checkArgs(msg);
    if (result.errors) { msg.channel.send(result.errors); return; }
    if (result.numArgs > 0) {
      let user = msg.mentions.users.first();
      embed.setColor("PURPLE")
        .setTitle(`:notepad_spiral: ${user.username}'s Activity Report`)
        .setDescription(`Due to Discord's limitations of not allowing bots to use the search bar, I have decided to awaken my Sharingan and log everyone's chat history starting \`1-14-2020\``)
        .setThumbnail(user.avatarURL({ dynamic: true }))
      const result = await Message.findOne({ discordId: user.id }).lean();
      if (result) {
          embed.addField("Last Message", result.lastMessage, true)
            .addField("Last Message Date", result.lastMessageDate.toDateString(), true)
            .addField("Message Count", result.messageCount, true)
      } else {
          embed.addField("Last Message", "None", true)
            .addField("Last Message Date", "N/A", true)
            .addField("Message Count", 0, true)
      }
      msg.channel.send(embed);
    } else {
      embed.setColor("RED");
      embed.setDescription("**Error**: You must mention a user with @");
      msg.channel.send(embed);
    }
  }
};

const leaderboard = async (msg) => {
  const errors = validator.checkMod(msg);
  if (errors) { msg.channel.send(errors); return; }

  const embed = new Discord.MessageEmbed();

  try {
    const players = await Player.find({}).select("elo discordName").sort({ elo: -1 }).lean();
    const oldLeaderBoardId = await System.findOne({ paramName: "oldLeaderBoardId" });

    let board = "```";
    for (let index = 0; index < players.length; index++) {
      board += `#${index + 1} - ELO: ${players[index].elo} ${players[index].discordName.substring(0, 14)}\n`;
    }
    board += "```";

    embed.setTitle("Leaderboard");
    embed.setColor("GOLD");
    embed.setDescription(board);
    const sentLeaderBoard = await msg.channel.send(embed);
    if (oldLeaderBoardId === null) {
      new System({ paramName: "oldLeaderBoardId", paramValue: sentLeaderBoard.id }).save();
    } else if (oldLeaderBoardId.paramValue != null) {
      try {
        const oldMsg = await msg.channel.messages.fetch(oldLeaderBoardId.paramValue);
        oldMsg.delete();
        oldLeaderBoardId.paramValue = sentLeaderBoard.id
        oldLeaderBoardId.save();
      } catch {
        oldLeaderBoardId.paramValue = sentLeaderBoard.id
        oldLeaderBoardId.save();
      }
    }
  } catch {
    embed.setColor("RED");
    embed.setDescription("Database error");
    msg.channel.send(embed);
  }
};

const reset = async (msg) => {
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
};

const resetboard = async (msg) => {
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
};

const deleteboard = async (msg) => {
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
};

const decay = async (msg) => {
  const modErrors = validator.checkMod(msg);
  if (modErrors) { msg.channel.send(modErrors); return; }
  const embed = new Discord.MessageEmbed();

  try {
    const sevenDays = 7 * (24 * 60 * 60 * 1000);
    const lastWeek = new Date(Date.now() - sevenDays);
    const players = await Player.find({ lastMatch: { $lte: lastWeek }, elo: { $gte: 700 } }).select("discordName elo").sort({ elo: -1 });

    if (players.length > 0) {
      let decayList = "```";
      await players.forEach((player) => {
        let oldELO = player.elo;
        let newELO = Math.round(player.elo * .95);
        player.elo = newELO;
        player.save();
        decayList += `${oldELO} => ${newELO} - ${player.discordName}\n`;
      });
      decayList += "```";
      embed.setTitle("These players had their ELO decay");
      embed.setColor("GREEN");
      embed.setDescription(decayList);
      msg.channel.send(embed);
      return;
    }
    embed.setColor("BLUE");
    embed.setDescription("No players found to decay");
    msg.channel.send(embed);
  } catch {
    embed.setColor("RED");
    embed.setDescription("Database error");
    msg.channel.send(embed);
  }
};

const record = async (msg) => {
  if (validator.isCommand(msg)) {
    const modErrors = validator.checkMod(msg);
    if (modErrors) { msg.channel.send(modErrors); return; }

    const argErrors = validator.checkRecordArgs(msg);
    if (argErrors) { msg.channel.send(argErrors); return; }

    const embed = new Discord.MessageEmbed();
    const msgArr = msg.content.split(" ");
    const firstId = msgArr[1].replace(/[<@!>]/g, "");
    const secondId = msgArr[3].replace(/[<@!>]/g, "");

    try {
      const firstExists = await Player.find({ discordId: firstId }).limit(1);
      const secondExists = await Player.find({ discordId: secondId }).limit(1);

      if (firstExists.length === 0) {
        embed.setColor("RED");
        embed.setDescription(`${msgArr[1]} is not registered`);
        msg.channel.send(embed);
        return;
      }

      if (secondExists.length === 0) {
        embed.setColor("RED");
        embed.setDescription(`${msgArr[3]} is not registered`);
        msg.channel.send(embed);
        return;
      }

      const firstGames = Number(msgArr[2]);
      const secondGames = Number(msgArr[4]);
      let winnerId;
      let loserId;
      let winnerGames;
      let loserGames;

      if (firstGames > secondGames) {
        winnerId = firstId;
        winnerGames = firstGames;
        loserId = secondId;
        loserGames = secondGames;
      } else {
        winnerId = secondId;
        winnerGames = secondGames;
        loserId = firstId;
        loserGames = firstGames;
      }

      const winner = await Player.findOne({ discordId: winnerId }).select("discordId discordName wins elo lastMatch streak bounty prize");
      const loser = await Player.findOne({ discordId: loserId }).select("discordId discordName losses elo lastMatch streak bounty prize");
      const newELOs = calculateELO(winner.elo, loser.elo, winnerGames, loserGames);

      const winnerOldELO = winner.elo;
      const loserOldELO = loser.elo;

      winner.wins += 1;
      winner.elo = newELOs.winnerRating;
      winner.lastMatch = Date.now();
      loser.losses += 1;
      loser.elo = newELOs.loserRating;
      loser.lastMatch = Date.now();

      const winnerMember = await msg.guild.members.fetch(winnerId);
      const loserMember = await msg.guild.members.fetch(loserId);
      const bountyRole = msg.guild.roles.cache.find(role => role.name === "Bounty");
      let eloFieldMsg = "";

      winner.streak += 1;
      loser.streak = 0;

      let footer = "";

      if (winner.bounty) {
        if (winner.prize < 50 && (winner.streak % 2 === 1)) {
          winner.prize += 5;
          footer += `💰 ${winner.discordName}'s bounty grows (${winner.prize} ELO)\n`;
        }
      }
      else if (winner.streak === 3) {
        winner.bounty = true;
        winner.prize = 15;
        footer += `💰 ${winner.discordName} now has a bounty (15 ELO)\n`;
        await winnerMember.roles.add(bountyRole);
      }

      if (loser.bounty) {
        winner.elo += loser.prize;
        loser.bounty = false;
        await loserMember.roles.remove(bountyRole);
        footer += `💰 ${winner.discordName} has taken the bounty (${loser.prize} ELO)\n`;
        eloFieldMsg = `\`\`\`ELO:  ${winnerOldELO} => ${newELOs.winnerRating} + ${loser.prize}\`\`\``;
        loser.prize = 0;
      } else {
        eloFieldMsg = `\`\`\`ELO:  ${winnerOldELO} => ${newELOs.winnerRating}\`\`\``;
      }

      await winner.save();
      await loser.save();

      embed.setColor("AQUA");
      embed.setDescription(`${winner.discordName} wins ${winnerGames}-${loserGames}`);
      embed.setThumbnail("https://cdn.discordapp.com/emojis/590002598338363423.png?v=1");
      embed.addField(`${winner.discordName}`, eloFieldMsg);
      embed.addField(`${loser.discordName}`, `\`\`\`ELO:  ${loserOldELO} => ${newELOs.loserRating}\`\`\``);
      embed.setFooter(footer);
      msg.channel.send(embed);
    } catch (e) {
      console.log(e);
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
};

const calculateELO = (winnerELO, loserELO, winnerGames, loserGames) => {
  const k = 20 * (winnerGames - loserGames);
  const winnerProb = (1.0 / (1.0 + Math.pow(10, ((loserELO - winnerELO) / 400))));
  const loserProb = (1.0 / (1.0 + Math.pow(10, ((winnerELO - loserELO) / 400))));
  let winnerK = k;
  let loserK = k;

  if (winnerProb >= 0.4 && winnerProb <= 0.6) {
    winnerK = k * 1.5;
    loserK = k / 1.5;
  }

  const winnerRating = Math.round(winnerELO + winnerK * (1 - winnerProb));
  const loserRating = Math.round(loserELO + loserK * (0 - loserProb));

  return ({ winnerRating, loserRating });
};

const ducknofades = async (msg) => {
  const memberErrors = validator.checkMember(msg.member);
  if (memberErrors) { msg.channel.send(memberErrors); return; }

  const embed = new Discord.MessageEmbed();

  try {
    const player = await Player.findOne({ discordId: msg.author.id }).select("elo").lean();

    if (!player) {
      embed.setColor("RED");
      embed.setDescription("You are not registered, stop ducking fades and register now");
      msg.channel.send(embed);
      return;
    }

    const upperBound = Math.round((Math.log10(((1 / 0.4) - 1)) * 400) + player.elo);
    const lowerBound = Math.round((Math.log10(((1 / 0.6) - 1)) * 400) + player.elo);

    embed.setColor([253, 117, 139]);
    embed.setTitle("Duck No Fades Bonus");
    embed.setDescription("When you fight other players around the same ELO as you, you will get a boost.\nIf you win, you will earn more points than normal.\nIf you lose, you will lose less points than normal");
    embed.addField("For you, you should fight players with:", `\`\`\`ELO: ${lowerBound} - ${upperBound}\`\`\``);
    msg.channel.send(embed);
  } catch {
    embed.setColor("RED");
    embed.setDescription("Database error");
    msg.channel.send(embed);
  }
};

const bounties = async (msg) => {
  const embed = new Discord.MessageEmbed();

  try {
    const players = await Player.find({ bounty: true }).select("discordName streak bounty prize").sort({ prize: -1 }).lean();
    if (players.length) {
      embed.setTitle(":moneybag: :moneybag: :moneybag:")
      embed.setColor("DARK_GOLD");
      players.forEach(player => {
        embed.addField(`${player.discordName}`, `\`\`\`Prize:  ${player.prize} ELO\nStreak: ${player.streak} Kills\`\`\``);
      })
    } else {
      embed.setColor("DARK_GOLD");
      embed.setDescription("No bounties");
    }
    msg.channel.send(embed);
  } catch {
    embed.setColor("RED");
    embed.setDescription("Database error");
    msg.channel.send(embed);
  }
};

module.exports = {
  help,
  register,
  unregister,
  profile,
  status,
  leaderboard,
  reset,
  resetboard,
  deleteboard,
  decay,
  record,
  ducknofades,
  bounties
};
