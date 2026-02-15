export const simulateShift = (lineup, momentum, chemistry, options = {}) => {
  const events = [];
  let shiftScore = 0;
  let swaggerGain = 0;
  const powerPlayBuff = Boolean(options.powerPlayBuff);

  // 1. The "Start of Shift" Check
  // High Heat from Sully means he's looking to settle scores, not just play hockey.
  const isSullyTilted = lineup.sully.heat > 60;
  const isRookieRattled = chemistry < 0;

  if (powerPlayBuff) {
    events.push({
      text: "Power Play unit hops over the boards. The bench is buzzing after Sully's scrap win.",
      type: "POWER_PLAY",
    });
    swaggerGain += 10;
  }

  // Scrap Trigger: chirps/heat directly raise scrap odds.
  const normalizedHeat = Math.min(Math.max(lineup.sully.heat ?? 0, 0), 100);
  const scrapChance = 0.05 + normalizedHeat / 200; // 5% base, up to 55% at max heat
  if (Math.random() < scrapChance) {
    events.push({
      text: "Sully's had enough. He's dropping the gloves with the opponent's enforcer.",
      type: "SCRAP_TRIGGER"
    });
  }

  // 2. Play-by-Play Logic
  if (isSullyTilted && isRookieRattled) {
    events.push({
      text: "Sully ignores an open lane to the Rookie, taking a reckless clapper from the point.",
      type: "TILT"
    });

    // RNG for the "Bardownski" moment
    const heroBallThreshold = powerPlayBuff ? 0.55 : 0.7;
    if (Math.random() > heroBallThreshold) {
      events.push({ text: "PING. BARDOWNSKI. Sully scores despite the hero-ball.", type: "GOAL" });
      shiftScore = 1;
      swaggerGain += 25; // High momentum for a pure snipe
    } else {
      events.push({ text: "The shot is blocked. Sully is slow on the backcheck, chirping the bench.", type: "MISS" });
      swaggerGain += -10;
    }
  } else if (chemistry > 20) {
    // Synergy Play
    events.push({
      text: "Sully and the Rookie connect on a beautiful give-and-go. The 'wheels' are real.",
      type: "SYNERGY"
    });
    shiftScore = 1;
    swaggerGain += 15;
  } else {
    events.push({ text: "A standard grinding shift. The boys are putting in the work.", type: "NEUTRAL" });
  }

  return { events, shiftScore, swaggerGain, usedPowerPlayBuff: powerPlayBuff };
};
