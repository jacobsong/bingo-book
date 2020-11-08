const calculateELO = (winnerELO, loserELO, winnerGames, loserGames) => {
  const k = 20 * (winnerGames - loserGames);
  const winnerProb = (1.0 / (1.0 + Math.pow(10, ((loserELO - winnerELO) / 400))));
  const loserProb = (1.0 / (1.0 + Math.pow(10, ((winnerELO - loserELO) / 400))));
  let winnerK = k;
  let loserK = k;

  if (winnerProb >= 0.4 && winnerProb <= 0.6) {
    winnerK = k * 1.5;
    loserK = k / 1.5;
  }

  const winnerRating = Math.round(winnerELO + winnerK * (1 - winnerProb));
  const loserRating = Math.round(loserELO + loserK * (0 - loserProb));

  return ({ winnerRating, loserRating });
};

module.exports = {
  calculateELO
}