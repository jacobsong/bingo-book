const fs = require("fs");
const Discord = require("discord.js");
const mongoose = require("mongoose");
const Player = require("./models/Player");
const config = require("./config/config");
const Validator = require("./services/validator");
const client = new Discord.Client({ presence: { activity: { name: "=help", type: "PLAYING" } } } );
const prefix = "=";

// Verify connected and set presence
client.once("ready", () => console.log("Connected as " + client.user.tag));

// Connect to MongoDB Atlas
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(
  () => { console.log("MongoDB connected..."); },
  err => { console.log("MongoDB could not connect..." + err); }
);

// Update DB when users change usernames
client.on("userUpdate", async (oldUser, newUser) => {
  try {
    await Player.updateOne({ discordId: oldUser.id },
      { $set: { discordName: newUser.username } }
    );
  } catch (e) {
    console.log("Error updating user's discordName");
  }
});

// Update DB when members leave
client.on('guildMemberRemove', async member => {
  try {
    await Player.deleteOne({ discordId: member.id })
  } catch (e) {
    console.log("Error deleting guild member");
  }
});

// Add command files into a Collection
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}


// Respond to commands
client.on("message", async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();
  
  if (!client.commands.has(commandName)) return;

	try {
    const command = client.commands.get(commandName)
    const isValid = Validator.checkCommand(message, command, args);
    if (isValid === false) return;
    command.execute(message, args);
	} catch (e) {
		console.error(e);
		message.reply('Error executing that command');
	}
});

// Login with bot token
try {
  client.login(config.token);
} catch (e) {
  console.error("Failed to login to Discord");
}
