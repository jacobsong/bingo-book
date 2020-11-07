const Discord = require("discord.js");
const validMember = "Villains";
const validMod = "Super Villains";
const validStaff = "Staff";
const prefix = "=";

const isCommand = (msg) => {
  const msgArr = msg.content.split(" ");
  const cmds = [
    `${prefix}register`,
    `${prefix}unregister`,
    `${prefix}profile`,
    `${prefix}status`,
    `${prefix}reset`,
    `${prefix}record`
  ];
  return cmds.includes(msgArr[0]);
};

const checkArgs = (msg) => {
  const msgArr = msg.content.split(" ");
  const result = { errors: null, numArgs: 0 };

  if (msgArr.length - 1 === 0) return result;
  if (msgArr.length - 1 > 1) {
    result.errors = new Discord.MessageEmbed();
    result.errors.setColor("RED");
    result.errors.setDescription("**Error**: Too many parameters");
    return result;
  }
  if (msg.mentions.members.size != 1) {
    result.errors = new Discord.MessageEmbed();
    result.errors.setColor("RED");
    result.errors.setDescription("**Error**: You must mention a user with @");
    return result;
  }
  result.numArgs = 1;
  return result;
};

const checkRecordArgs = (msg) => {
  const msgArr = msg.content.split(" ");
  const errors = new Discord.MessageEmbed();
  const gamesWon1 = Number(msgArr[2]);
  const gamesWon2 = Number(msgArr[4]);

  if (msgArr.length - 1 != 4) {
    errors.setColor("RED");
    errors.setDescription(`**Error**: expected **4** parameters, received **${msgArr.length - 1}**`);
    return errors;
  }

  if (msg.mentions.members.size != 2) {
    errors.setColor("RED");
    errors.setDescription(`**Error**: expected **2** mentions, received **${msg.mentions.members.size}**`);
    return errors;
  }

  if (isNaN(gamesWon1) || isNaN(gamesWon2)) {
    errors.setColor("RED")
    errors.setDescription(`**Error**: <games-won> should be a number`);
    return errors;
  }

  if (gamesWon1 > 3 || gamesWon1 < 0 || gamesWon2 > 3 || gamesWon2 < 0) {
    errors.setColor("RED");
    errors.setDescription("**Error**: <games-won> should be between 0 and 3");
    return errors;
  }

  if ((gamesWon1 + gamesWon2) > 5) {
    errors.setColor("RED");
    errors.setDescription("**Error**: total games should be less than 5");
    return errors;
  }

  if (gamesWon1 < 3 && gamesWon2 < 3) {
    errors.setColor("RED");
    errors.setDescription("**Error**: at least one player needs to win 3 games");
    return errors;
  }
};

const checkMember = (member) => {
  const errors = new Discord.MessageEmbed();

  if (member.roles.cache.some((role) => role.name === validMember)) {
    return null;
  } else {
    errors.setColor("RED");
    errors.setDescription("**Failed**, not a crew member");
    return errors;
  }
};

const checkMod = (msg) => {
  const errors = new Discord.MessageEmbed();

  if (msg.member.roles.cache.some((role) => (role.name === validMod) || (role.name === validStaff))) {
    return null;
  } else {
    errors.setColor("RED");
    errors.setDescription("**Failed**, you are not a mod");
    return errors;
  }
};

module.exports = {
  isCommand,
  checkArgs,
  checkRecordArgs,
  checkMember,
  checkMod
};