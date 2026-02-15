const pick = (items) => items[Math.floor(Math.random() * items.length)];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const simulateShift = (lineup, momentum, chemistry, options = {}) => {
  const events = [];
  let shiftScore = 0;
  let swaggerGain = 0;
  let opponentScoreGain = 0;
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
  let opponentCounterBase = 0.12;
  if (isSullyTilted && isRookieRattled) {
    opponentCounterBase = 0.3;
    events.push({
      text: pick([
        "Sully ignores an open lane to the Rookie, taking a reckless clapper from the point.",
        "Sully waves off the rookie and hammers a low-percentage bomb through traffic.",
        "Anchor ego takes over. Sully calls his own number and forces a bad look.",
      ]),
      type: "TILT"
    });

    // RNG for the "Bardownski" moment
    const heroBallThreshold = powerPlayBuff ? 0.55 : 0.7;
    if (Math.random() > heroBallThreshold) {
      events.push({
        text: pick([
          "PING. BARDOWNSKI. Sully scores despite the hero-ball.",
          "Bar down and in. Sully snipes one clean while chirping the bench.",
          "Absolute laser from the point. Sully goes full ego and cashes it.",
        ]),
        type: "GOAL"
      });
      shiftScore = 1;
      swaggerGain += 25; // High momentum for a pure snipe
    } else {
      events.push({
        text: pick([
          "The shot is blocked. Sully is slow on the backcheck, chirping the bench.",
          "Clapper gets eaten at the blue line. Sully glides back late and barking.",
          "Hero-ball backfires. Turnover high, and Sully is caught watching the play.",
        ]),
        type: "MISS"
      });
      swaggerGain += -10;
    }
  } else if (chemistry > 20) {
    // Synergy Play
    opponentCounterBase = 0.08;
    events.push({
      text: pick([
        "Sully and the Rookie connect on a beautiful give-and-go. The 'wheels' are real.",
        "Clean breakout, quick touch pass, and the rookie burns wide with speed.",
        "Tape-to-tape through neutral ice. Sully and Wheels finally look synced.",
      ]),
      type: "SYNERGY"
    });
    shiftScore = 1;
    swaggerGain += 15;
  } else {
    opponentCounterBase = 0.16;
    events.push({
      text: pick([
        "A standard grinding shift. The boys are putting in the work.",
        "Low-event hockey. Hard rims, heavy forecheck, no clean lane yet.",
        "Board battle shift. Nobody gives an inch, but the clock gets chewed.",
        "Safe change and tight gaps. Not pretty, but structured hockey.",
      ]),
      type: "NEUTRAL"
    });
    if (momentum > 40 && Math.random() > 0.65) {
      events.push({
        text: "Momentum surge: crowd starts buzzing as the line pins them deep.",
        type: "MOMENTUM"
      });
      swaggerGain += 5;
    }
  }

  const momentumPressure = momentum < -20 ? 0.08 : momentum > 35 ? -0.05 : 0;
  const powerPlayProtection = powerPlayBuff ? -0.06 : 0;
  const opponentCounterChance = clamp(opponentCounterBase + momentumPressure + powerPlayProtection, 0.03, 0.55);

  if (Math.random() < opponentCounterChance) {
    opponentScoreGain = 1;
    swaggerGain -= 12;
    events.push({
      text: pick([
        "Turnover at the red line. Opponent snaps one home on the rush.",
        "Defensive gap breaks down and the rivals bury a quick counter goal.",
        "Bad line change gets punished. Opponent cashes from the slot.",
      ]),
      type: "OPP_GOAL",
    });
  }

  return { events, shiftScore, swaggerGain, opponentScoreGain, usedPowerPlayBuff: powerPlayBuff };
};
