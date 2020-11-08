const mongoose = require("mongoose");
const { Schema } = mongoose;

const playerSchema = new Schema(
  {
    discordId: { type: String, unique: true, index: true },
    discordName: String,
    lastMatch: { type: Date, default: Date.now },
    registerDate: { type: Date, default: Date.now },
    points: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    bingo: { type: Boolean, default: false },
    rank: { type: Number, default: 1 }
  }
);

module.exports = User = mongoose.model("players", playerSchema);
