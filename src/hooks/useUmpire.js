import { useState } from 'react';

export const useUmpire = () => {
  const [momentum, setMomentum] = useState(0);
  const [status, setStatus] = useState("PROFESSIONAL");
  const clampMomentum = (value) => Math.min(Math.max(value, -100), 100);

  const addMomentum = (change) => {
    setMomentum(prev => clampMomentum(prev + change));
  };

  const setMomentumValue = (value) => {
    setMomentum(clampMomentum(Number(value) || 0));
  };

  const judgeGoal = (gameContext, shotQuality, cellyTier) => {
    let change = 0;
    let newStatus = "CERTIFIED BEAUTY";

    // The "Act Like You've Been There" Check
    if (gameContext <= -2 && cellyTier >= 2) {
      change = -50;
      newStatus = "CLOWN STATUS";
    }
    // The "Greasy Goal" Check
    else if (shotQuality <= 2 && cellyTier === 3) {
      change = -25;
      newStatus = "FLOP";
    }
    // The "Bardownski" Buff
    else if (shotQuality >= 4 && cellyTier >= 2) {
      change = 75;
      newStatus = "ELITE SNIPER";
    } else {
      change = 10 * shotQuality;
      newStatus = "WORKMANLIKE";
    }

    setMomentum(prev => clampMomentum(prev + change));
    setStatus(newStatus);
    
    return { change, newStatus };
  };

  return { momentum, status, judgeGoal, addMomentum, setMomentumValue };
};
