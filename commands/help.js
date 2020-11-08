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
    const embed = new Discord.MessageEmbed().setTitle("Command List").setColor("BLUE");

    let commandsList = "";
    commands.map(command => {
      const argsList = (command.usage != undefined) ? `*${command.usage}*` : "";
      commandsList += `**🔸 ${command.name}** ${argsList}\`\`\`css\n${command.description}\`\`\``;
    });

    embed.setDescription(commandsList);

    try {
      msg.author.send(embed);
      if (msg.channel.type === 'dm') return;
      else msg.reply("I sent you a DM with all my commands");
    } catch (e) {
      msg.reply("failed to send you a DM.  Do you have DMs disabled?");
    }

    return;
  }
}