const Discord = require("discord.js");
const mongoose = require("mongoose");
const Player = require("./models/Player");
const Message = require("./models/Message");
const config = require("./config/config");
const commands = require("./services/commands");
const client = new Discord.Client({ disabledEvents: ["TYPING_START"] });
const prefix = "=";

// Verify connected and set presence
client.once("ready", () => {
  console.log("Connected as " + client.user.tag);
  client.user.setPresence({ game: { name: "type =help" } });
});

// Connect to MongoDB Atlas
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(
  () => {
    console.log("MongoDB connected...\n");
  },
  err => {
    console.log("MongoDB could not connect...\n" + err);
  }
);

// Update DB when users change usernames
client.on("userUpdate", async (oldUser, newUser) => {
  try {
    await Player.updateOne({ discordId: oldUser.id },
      { $set: { discordName: newUser.username, discordAvatar: newUser.avatarURL({ dynamic: true }) } }
    );
  } catch {
    console.log("Error updating user's discordName/avatar");
  }
});

// Update DB when members leave
client.on('guildMemberRemove', async member => {
  try {
    await Player.deleteOne({ discordId: member.id })
  } catch {
    console.log("Error deleting guild member");
  }
});

// Respond to commands
client.on("message", async message => {
  try {
    let msg = message.content || message.attachments.first().url;
    await Message.updateOne(
      { discordId: message.author.id },
      {
        $set: { discordId: message.author.id, lastMessage: msg, lastMessageDate: new Date() },
        $inc: { messageCount: 1 }
      },
      { upsert: true })
  } catch {
    return;
  }

  if (message.content === `${prefix}help`) {
    commands.help(message);
    message.delete({ timeout: 1500 });
  }

  if (message.content.startsWith(`${prefix}register`)) {
    await commands.register(message);
    message.delete({ timeout: 1500 });
  }

  if (message.content.startsWith(`${prefix}unregister`)) {
    await commands.unregister(message);
    message.delete({ timeout: 1500 });
  }

  if (message.content.startsWith(`${prefix}profile`)) {
    await commands.profile(message);
    message.delete({ timeout: 1500 });
  }

  if (message.content.startsWith(`${prefix}status`)) {
    await commands.status(message);
    message.delete({ timeout: 1500 });
  }

  if (message.content === (`${prefix}ducknofades`)) {
    await commands.ducknofades(message);
    message.delete({ timeout: 1500 });
  }

  if (message.content === (`${prefix}bounties`)) {
    await commands.bounties(message);
    message.delete({ timeout: 1500 });
  }

  //if (message.channel.name === "leaderboard") {
    if (message.content === `${prefix}leaderboard`) {
      await commands.leaderboard(message);
      message.delete({ timeout: 1500 });
    }

    if (message.content.startsWith(`${prefix}reset`)) {
      await commands.reset(message);
      message.delete({ timeout: 1500 });
    }

    if (message.content === `${prefix}resetboard`) {
      await commands.resetboard(message);
      message.delete({ timeout: 1500 });
    }

    if (message.content === `${prefix}deleteboard`) {
      await commands.deleteboard(message);
      message.delete({ timeout: 1500 });
    }

    if (message.content === `${prefix}decay`) {
      await commands.decay(message);
      message.delete({ timeout: 1500 });
    }

    if (message.content.startsWith(`${prefix}record`)) {
      await commands.record(message);
      message.delete({ timeout: 1500 });
    }
  //}
});

// Login with bot token
try {
  client.login(config.token);
} catch {
  console.log("Failed to login to Discord");
}
