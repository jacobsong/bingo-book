module.exports = {
  mongoURI: process.env.MONGO_URI,
  token: process.env.TOKEN,
  validRoles: {
    0: "752745454889861211", // Staff
    1: "752745454915289200", // Kage (Mod)
    2: "752745454915289201" // Akatsuki (Admin)
  }
};
