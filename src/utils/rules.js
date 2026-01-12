// src/utils/rules.js

export const RACES = [
  "Human",
  "Elf",
  "Dwarf",
  "Halfling",
  "Dragonborn",
  "Gnome",
  "Half-Elf",
  "Half-Orc",
  "Tiefling",
];

export const CLASSES = [
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
];

export const ATTRIBUTES = [
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
];

export const SKILLS = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival",
];

export const STARTING_EQUIPMENT = [
  "Backpack",
  "Bedroll",
  "Rations (5 days)",
  "Waterskin",
  "Torches (10)",
];

// Point Buy Costs
export const POINT_BUY_COSTS = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

// Racial Bonuses
export const RACIAL_BONUSES = {
  Human: {
    Strength: 1,
    Dexterity: 1,
    Constitution: 1,
    Intelligence: 1,
    Wisdom: 1,
    Charisma: 1,
  },
  Elf: { Dexterity: 2 },
  Dwarf: { Constitution: 2 },
  Halfling: { Dexterity: 2 },
  Dragonborn: { Strength: 2, Charisma: 1 },
  Gnome: { Intelligence: 2 },
  "Half-Elf": { Charisma: 2, Dexterity: 1, Constitution: 1 },
  "Half-Orc": { Strength: 2, Constitution: 1 },
  Tiefling: { Charisma: 2, Intelligence: 1 },
};

// Hit Dice per Class
export const HIT_DICE = {
  Barbarian: 12,
  Fighter: 10,
  Paladin: 10,
  Ranger: 10,
  Bard: 8,
  Cleric: 8,
  Druid: 8,
  Monk: 8,
  Rogue: 8,
  Warlock: 8,
  Sorcerer: 6,
  Wizard: 6,
};

// Skill Allowances (How many skills can you pick?)
// Note: Bards get 3, Rogues get 4, Rangers get 3, everyone else usually 2.
// (Simplified for this app: ignoring Backgrounds for now which would add +2)
export const SKILL_LIMITS = {
  Barbarian: 2,
  Bard: 3,
  Cleric: 2,
  Druid: 2,
  Fighter: 2,
  Monk: 2,
  Paladin: 2,
  Ranger: 3,
  Rogue: 4,
  Sorcerer: 2,
  Warlock: 2,
  Wizard: 2,
};

export const SKILL_MAP = {
  Acrobatics: "Dexterity",
  "Animal Handling": "Wisdom",
  Arcana: "Intelligence",
  Athletics: "Strength",
  Deception: "Charisma",
  History: "Intelligence",
  Insight: "Wisdom",
  Intimidation: "Charisma",
  Investigation: "Intelligence",
  Medicine: "Wisdom",
  Nature: "Intelligence",
  Perception: "Wisdom",
  Performance: "Charisma",
  Persuasion: "Charisma",
  Religion: "Intelligence",
  "Sleight of Hand": "Dexterity",
  Stealth: "Dexterity",
  Survival: "Wisdom",
};

// Math Helpers
export const getModifier = (score) => Math.floor((score - 10) / 2);

export const calculateMaxHP = (charClass, conScore) => {
  const hitDie = HIT_DICE[charClass] || 8;
  const conMod = getModifier(conScore);
  return Math.max(1, hitDie + conMod);
};
