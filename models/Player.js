const mongoose = require("mongoose");
const { Schema } = mongoose;

const playerSchema = new Schema(
  {
    discordId: { type: String, unique: true, index: true },
    discordName: String,
    lastMatch: { type: Date, default: Date.now },
    registerDate: { type: Date, default: Date.now },
    elo: { type: Number, default: 1000 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    bounty: { type: Boolean, default: false },
    prize: { type: Number, default: 0 }
  }
);

module.exports = User = mongoose.model("players", playerSchema);
