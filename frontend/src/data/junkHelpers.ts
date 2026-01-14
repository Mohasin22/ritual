// src/data/junkHelpers.ts

export const HARM_LEVEL_UI = {
  0: {
    color: "bg-green-100 text-green-700",
    badge: "Safe",
  },
  1: {
    color: "bg-yellow-100 text-yellow-700",
    badge: "Mild",
  },
  2: {
    color: "bg-orange-100 text-orange-700",
    badge: "Moderate",
  },
  3: {
    color: "bg-red-100 text-red-700",
    badge: "High Risk",
  },
};

export const HARM_LEVEL_RULES = {
  0: { free: Infinity, penalty: 0 },
  1: { free: 2, penalty: 10 },
  2: { free: 1, penalty: 20 },
  3: { free: 1, penalty: 30 },
};
