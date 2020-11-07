const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    discordId: { type: String, unique: true, index: true },
    lastMessage: String,
    lastMessageDate: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 0 }
  }
);

module.exports = Message = mongoose.model("messages", messageSchema);
