// src/utils/rules.js

export const RACES = [
  "Human", "Elf", "Dwarf", "Halfling", "Dragonborn", 
  "Gnome", "Half-Elf", "Half-Orc", "Tiefling"
];

export const CLASSES = [
  "Barbarian", "Bard", "Cleric", "Druid", "Fighter", 
  "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", 
  "Warlock", "Wizard"
];

export const ATTRIBUTES = [
  "Strength", "Dexterity", "Constitution", 
  "Intelligence", "Wisdom", "Charisma"
];

export const SKILLS = [
  "Acrobatics", "Animal Handling", "Arcana", "Athletics", 
  "Deception", "History", "Insight", "Intimidation", 
  "Investigation", "Medicine", "Nature", "Perception", 
  "Performance", "Persuasion", "Religion", "Sleight of Hand", 
  "Stealth", "Survival"
];

// D&D 5E Point Buy Costs
// Key = Score, Value = Total Cost to get there from 8
export const POINT_BUY_COSTS = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9
};

// Calculates the + or - modifier (e.g., 16 = +3)
export const getModifier = (score) => {
  return Math.floor((score - 10) / 2);
};