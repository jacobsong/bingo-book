
module.exports = {
  name: "leaderboard",
  description: "Shows the leaderboard",
  guildOnly: false,
  usage: undefined,
  async execute(msg, args) {
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
  }
}