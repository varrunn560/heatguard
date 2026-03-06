function wetBulb(T, RH) {
  return T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659))
    + Math.atan(T + RH)
    - Math.atan(RH - 1.676331)
    + 0.00391838 * RH ** 1.5 * Math.atan(0.023101 * RH)
    - 4.686035;
}

export function computeWBGT(T, RH, wind, rad) {
  const Tw = wetBulb(T, RH);
  const Tg = T + 0.25 * (rad / 1000) - 0.4 * (wind ** 0.5);
  return 0.7 * Tw + 0.2 * Tg + 0.1 * T;
}

export const ILO_LEVELS = [
  { max: 26, label: "Safe", color: "#00e400", schedule: "Full work, normal breaks", water: "250ml every 20 min" },
  { max: 28, label: "Caution", color: "#ffff00", schedule: "45min work / 15min break", water: "250ml every 15 min" },
  { max: 30, label: "Warning", color: "#ff7e00", schedule: "30min work / 30min break", water: "250ml every 10 min" },
  { max: 32, label: "Danger", color: "#ff0000", schedule: "15min work / 45min break", water: "250ml every 5 min" },
  { max: 999, label: "STOP WORK", color: "#7e0023", schedule: "Halt all outdoor activity", water: "Move indoors immediately" },
];

export function getILOLevel(wbgt) {
  return ILO_LEVELS.find(l => wbgt <= l.max);
}