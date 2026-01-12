import React, { useState, useEffect } from 'react';
import { 
  RACES, CLASSES, ATTRIBUTES, SKILLS, 
  POINT_BUY_COSTS, RACIAL_BONUSES, HIT_DICE, SKILL_LIMITS, STARTING_EQUIPMENT,
  getModifier, calculateMaxHP 
} from '../utils/rules';

export default function CharacterCreator({ onCharacterComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    race: RACES[0],
    class: CLASSES[0],
    backstory: '',
    attributes: {
      Strength: 8, Dexterity: 8, Constitution: 8,
      Intelligence: 8, Wisdom: 8, Charisma: 8
    },
    skills: []
  });

  const MAX_POINTS = 27;

  // Clear skills if class changes (because the limit might change)
  useEffect(() => {
    setFormData(prev => ({ ...prev, skills: [] }));
  }, [formData.class]);

  // --- MATH HELPERS ---
  const calculateUsedPoints = () => {
    let total = 0;
    Object.values(formData.attributes).forEach(score => {
      total += POINT_BUY_COSTS[score] || 0;
    });
    return total;
  };

  const getFinalAttribute = (attr) => {
    const base = formData.attributes[attr];
    const bonus = RACIAL_BONUSES[formData.race]?.[attr] || 0;
    return base + bonus;
  };

  const usedPoints = calculateUsedPoints();
  const remainingPoints = MAX_POINTS - usedPoints;
  const maxSkills = SKILL_LIMITS[formData.class] || 2; // Logic check

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttributeChange = (attr, direction) => {
    const currentBase = formData.attributes[attr];
    const nextBase = currentBase + direction;

    if (nextBase < 8 || nextBase > 15) return;

    const currentCost = POINT_BUY_COSTS[currentBase];
    const nextCost = POINT_BUY_COSTS[nextBase];
    
    if (remainingPoints - (nextCost - currentCost) < 0) return;

    setFormData(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [attr]: nextBase }
    }));
  };

  const toggleSkill = (skill) => {
    setFormData(prev => {
      const isSelected = prev.skills.includes(skill);
      
      // If adding a skill, check limit
      if (!isSelected && prev.skills.length >= maxSkills) {
        return prev; // Do nothing if limit reached
      }

      const skills = isSelected
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const handleEmbark = () => {
    const finalAttributes = {};
    ATTRIBUTES.forEach(attr => {
      finalAttributes[attr] = getFinalAttribute(attr);
    });

    const conScore = finalAttributes["Constitution"];
    const maxHP = calculateMaxHP(formData.class, conScore);

    const characterSheet = {
      name: formData.name || "Nameless Hero",
      race: formData.race,
      class: formData.class,
      gender: formData.gender,
      level: 1,
      xp: 0,
      xpToNextLevel: 300,
      hp: maxHP,
      maxHP: maxHP,
      attributes: finalAttributes,
      skills: formData.skills,
      backstory: formData.backstory,
      inventory: [STARTING_EQUIPMENT, "Dagger"],
      gold: 10
    };

    // Download Backup
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(characterSheet, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${characterSheet.name.replace(" ", "_")}_sheet.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    onCharacterComplete(characterSheet);
  };

  return (
    <div className="creation-container">
      <h2>Create Your Legend</h2>
      
      <div className="row">
        <div className="form-group" style={{flex: 2}}>
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter name..." />
        </div>
        <div className="form-group" style={{flex: 1}}>
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-Binary">Non-Binary</option>
          </select>
        </div>
      </div>

      <div className="row">
        <div className="form-group" style={{flex: 1}}>
          <label>Race</label>
          <select name="race" value={formData.race} onChange={handleChange}>
            {RACES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group" style={{flex: 1}}>
          <label>Class</label>
          <select name="class" value={formData.class} onChange={handleChange}>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="attributes-section">
        <div className="points-display">
          POINTS REMAINING: <span style={{ color: remainingPoints === 0 ? '#d4af37' : '#fff' }}>{remainingPoints}/{MAX_POINTS}</span>
        </div>
        <div className="attributes-grid">
          {ATTRIBUTES.map(attr => {
            const base = formData.attributes[attr];
            const final = getFinalAttribute(attr);
            const mod = getModifier(final);
            return (
              <div key={attr} className="stat-box">
                <label>{attr.toUpperCase()}</label>
                <div className="stat-controls">
                  <button onClick={() => handleAttributeChange(attr, -1)} disabled={base <= 8}>-</button>
                  <span className="stat-value">{final}</span>
                  <button onClick={() => handleAttributeChange(attr, 1)} disabled={base >= 15}>+</button>
                </div>
                <div className="stat-mod">{mod >= 0 ? `+${mod}` : mod}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="skills-section">
        <h3>Skills (Selected {formData.skills.length}/{maxSkills})</h3>
        <div className="skills-grid">
          {SKILLS.map(skill => (
            <div 
              key={skill} 
              className={`skill-item ${formData.skills.includes(skill) ? 'selected' : ''}`}
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </div>
          ))}
        </div>
      </div>

      <div className="form-group" style={{marginTop: '20px'}}>
        <label>Backstory</label>
        <textarea name="backstory" rows="5" value={formData.backstory} onChange={handleChange} placeholder="Who are you?" />
      </div>

      <button className="submit-btn" onClick={handleEmbark}>
        EMBARK
      </button>
    </div>
  );
}