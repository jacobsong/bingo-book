const config = require("../config/config");

const checkCommand = (msg, command, args) => {
  const re = /<@/;
  //Check if command is guild only
  if (command.guildOnly && msg.channel.type !== 'text') {
    msg.reply("I can't execute that command inside DMs");
    return false;
  }

  //Check if command requires role
  if (command.roleRequired) {
    if (msg.author.id != config.developerId) { 
      if (!msg.member.roles.cache.some((role) => (role.id == config.validRoles[command.roleRequired]))) {
        msg.reply("you do not have permission to use this command");
        return false;
      }
    }
  }

  //Check if command requires args
  if (command.argsRequired) {
    const argsOnly = args.filter(arg => !re.test(arg));
    if (command.argsRequired != argsOnly.length) {
      if (command.usage) {
        msg.reply(`the proper usage would be: \`${command.name} ${command.usage}\``);
        return false;
      }
    }
  }

  //Check if command requires mentions
  if (command.mentionsRequired) {
    if (msg.mentions.members.size != command.mentionsRequired) {
      msg.reply(`expected ${command.mentionsRequired} mention(s), received ${msg.mentions.members.size}`);
      return false;
    }
  }

  //Check if record/report command
  if (command.name === "record" || command.name === "report") {
    const rolesExist = checkRankRolesExist(msg, args);
    if (rolesExist === false) return false;
    const isRecordValid = checkRecordArgs(msg, args);
    if (isRecordValid === false) return false;
  }

  //Check if upsert command
  if (command.name === "upsert") {
    const rolesExist = checkRankRolesExist(msg, args);
    if (rolesExist === false) return false;
    const isUpsertValid = checkUpsertArgs(msg, args);
    if (isUpsertValid === false) return false;
  }

  //Return true if no validation errors
  return true;
};

const checkRecordArgs = (msg, args) => {
  const gamesWon1 = Number(args[1]);
  const gamesWon2 = Number(args[3]);
  const mentioned = msg.mentions.members.array();
  const player1Rank = mentioned[0].roles.cache.find(role => role.name in config.rankNames);
  const player2Rank = mentioned[1].roles.cache.find(role => role.name in config.rankNames);

  if (player1Rank === undefined) {
    msg.reply(`${mentioned[0]} does not have a ninja role`);
    return false;
  }

  if (player2Rank === undefined) {
    msg.reply(`${mentioned[1]} does not have a ninja role`);
    return false;
  }

  const player1NumericRank = config.rankNames[player1Rank.name];
  const player2NumericRank = config.rankNames[player2Rank.name];

  if (Math.abs(player1NumericRank - player2NumericRank) > 1) {
    msg.reply("**Error**: Your opponent's rank is too high/too low");
    return false;
  }

  if (isNaN(gamesWon1) || isNaN(gamesWon2)) {
    msg.reply(`**Error**: <games-won> should be a number`);
    return false;
  }

  if (gamesWon1 > 3 || gamesWon1 < 0 || gamesWon2 > 3 || gamesWon2 < 0) {
    msg.reply("**Error**: <games-won> should be between 0 and 3");
    return false;
  }

  if ((gamesWon1 + gamesWon2) > 5) {
    msg.reply("**Error**: total games should be less than 5");
    return false;
  }

  if (gamesWon1 < 3 && gamesWon2 < 3) {
    msg.reply("**Error**: at least one player needs to win 3 games");
    return false;
  }

  //Return true if no validation errors
  return true;
};

const checkUpsertArgs = (msg, args) => {
  const points = Number(args[1]);
  const wins = Number(args[2]);
  const losses = Number(args[3]);
  const streak = Number(args[4]);
  const bingo = args[5];
  const rank = args[6];
  let errors = "";

  if (isNaN(points)) errors += "\n**Error**: <points> must be a number";
  if (isNaN(wins) || wins < 0) errors += "\n**Error**: <wins> must be a positive number";
  if (isNaN(losses) || losses < 0) errors += "\n**Error**: <losses> must be a positive number";
  if (isNaN(streak) || streak < 0) errors += "\n**Error**: <streak> must be a positive number";
  if (bingo != 'true' && bingo != 'false') {
    errors += "\n**Error**: <bingo> must be true or false";
  }
  if (!(rank in config.rankNames)) errors += `\n**Error**: <rank> must be one of the following: ${Object.keys(config.rankNames)}`;

  if (errors !== "") {
    msg.reply(errors);
    return false;
  }
  
  //Return true if no validation errors
  return true;

}

const checkRankRolesExist = (msg, args) => {
  let errors = "";
  Object.keys(config.rankNames).forEach(rankName => {
    const rankRole = msg.guild.roles.cache.find(role => role.name === rankName);
    if (rankRole === undefined) {
      errors += `\n**Error**: the role ${rankName} does not exist. Please create this role.`;
    }
  });

  if (errors !== "") {
    msg.reply(errors);
    return false;
  }

  //Return true if no validation errors
  return true;
}

module.exports = {
  checkCommand
};
