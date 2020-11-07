const mongoose = require("mongoose");
const { Schema } = mongoose;

const systemSchema = new Schema(
  {
    paramName: { type: String, unique: true },
    paramValue: String
  }
);

module.exports = System = mongoose.model("system", systemSchema);
