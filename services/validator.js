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
    if (!msg.member.roles.cache.some((role) => (role.id == config.validRoles[command.roleRequired]))) {
      msg.reply("you do not have permission to use this command");
      return false;
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

  //Check if record command
  if (command.name === "record") {
    const isRecordValid = checkRecordArgs(msg, args);
    if (isRecordValid === false) return false;
  }

  //Return true if no validation errors
  return true;
};

const checkRecordArgs = (msg, args) => {
  const gamesWon1 = Number(args[1]);
  const gamesWon2 = Number(args[3]);

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

module.exports = {
  checkCommand
};
