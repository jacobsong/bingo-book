const Utils = require("../services/utils");

module.exports = {
  name: "record",
  description: "Records a match between 2 players. Use [=help record] for an example",
  guildOnly: true,
  roleRequired: 1,
  argsRequired: 2,
  mentionsRequired: 2,
  usage: "<user> <games-won> <user> <games-won>",
  async execute(msg, args) {
    Utils.record(msg, args);
  }
}