const Discord = require("discord.js");

module.exports = {
  name: "help",
  description: "List all of my commands",
  guildOnly: false,
  roleRequired: 0,
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    const { commands } = msg.client;
    const embed = new Discord.MessageEmbed();
    const examples = {
      "record": "\`\`\`=record @winner 3 @loser 1\`\`\`",
      "report": "\`\`\`=report @winner 3 @loser 1\`\`\`",
      "remove": "\`\`\`=remove 123456789\`\`\`",
      "reset": "\`\`\`=reset @user\`\`\`",
      "upsert": "\`\`\`=upsert @user 50 10 2 6 true Genin\`\`\`\`\`\`=upsert @user 50 10 2 6 false Jonin\`\`\`"
    }
    
    if (args[0] in examples) {
      embed.setTitle(`${args[0]} Command Example:`);
      embed.setDescription(`Usage:\`\`\`=${args[0]} ${commands.get(args[0]).usage}\`\`\`Example:${examples[args[0]]}`);
      embed.setColor("RED");
    } else {
      let commandsList = "";
      commands.map(command => {
        const argsList = (command.usage != undefined) ? `*${command.usage}*` : "";
        commandsList += `**🔸 ${command.name}** ${argsList}\`\`\`css\n${command.description}\`\`\``;
      });
      embed.setTitle("Command List");
      embed.setDescription(commandsList);
      embed.setColor("BLUE");
    }

    try {
      msg.author.send(embed);
      if (msg.channel.type === 'dm') return;
      else msg.reply("check your DMs");
    } catch (e) {
      msg.reply("failed to send you a DM.  Do you have DMs disabled?");
    }

    return;
  }
}