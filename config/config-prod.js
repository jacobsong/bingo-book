module.exports = {
  mongoURI: process.env.MONGO_URI,
  token: process.env.TOKEN,
  validRoles: {
    1: "752745454889861211", // Staff
    2: "752745454915289200", // Kage (Mod)
    3: "752745454915289201" // Akatsuki (Admin)
  },
  ranks: {
    1: "Genin",
    2: "Chunin",
    3: "Jonin",
    4: "Anbu"
  },
  rankNames: {
    "Genin": 1,
    "Chunin": 2,
    "Jonin": 3,
    "Anbu": 4
  }
};
