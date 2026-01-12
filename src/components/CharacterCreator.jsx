import React, { useState } from 'react';
import { RACES, CLASSES, ATTRIBUTES, SKILLS, POINT_BUY_COSTS, getModifier } from '../utils/rules';

export default function CharacterCreator() {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male', // Default selection
    race: RACES[0],
    class: CLASSES[0],
    backstory: '',
    attributes: {
      Strength: 8, Dexterity: 8, Constitution: 8,
      Intelligence: 8, Wisdom: 8, Charisma: 8
    },
    skills: [] // Stores list of selected skills
  });

  const MAX_POINTS = 27;

  // Calculate used points dynamically
  const calculateUsedPoints = () => {
    let total = 0;
    Object.values(formData.attributes).forEach(score => {
      total += POINT_BUY_COSTS[score] || 0;
    });
    return total;
  };

  const usedPoints = calculateUsedPoints();
  const remainingPoints = MAX_POINTS - usedPoints;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Attribute Buttons (+/-)
  const handleAttributeChange = (attr, direction) => {
    const currentScore = formData.attributes[attr];
    const nextScore = currentScore + direction;

    // 1. Validation: Must be between 8 and 15
    if (nextScore < 8 || nextScore > 15) return;

    // 2. Validation: Can we afford it?
    const currentCost = POINT_BUY_COSTS[currentScore];
    const nextCost = POINT_BUY_COSTS[nextScore];
    const costDifference = nextCost - currentCost;

    if (remainingPoints - costDifference < 0) return;

    setFormData(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [attr]: nextScore }
    }));
  };

  const toggleSkill = (skill) => {
    setFormData(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill) // Remove if exists
        : [...prev.skills, skill]; // Add if doesn't exist
      return { ...prev, skills };
    });
  };

  return (
    <div className="creation-container">
      <h2>Character Creation</h2>
      
      {/* Name & Gender Row */}
      <div className="row">
        <div className="form-group" style={{flex: 2}}>
          <label>Name:</label>
          <input 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Enter name..." 
          />
        </div>

        <div className="form-group" style={{flex: 1}}>
          <label>Gender:</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-Binary">Non-Binary</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Race & Class Row */}
      <div className="row">
        <div className="form-group">
          <label>Race:</label>
          <select name="race" value={formData.race} onChange={handleChange}>
            {RACES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Class:</label>
          <select name="class" value={formData.class} onChange={handleChange}>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Attributes Section */}
      <div className="attributes-section">
        <div className="points-display">
          <span>Points Remaining: </span>
          <span style={{ color: remainingPoints === 0 ? '#44ff44' : '#fff' }}>
            {remainingPoints}/{MAX_POINTS}
          </span>
        </div>

        <div className="attributes-grid">
          {ATTRIBUTES.map(attr => {
            const score = formData.attributes[attr];
            const mod = getModifier(score);
            const modString = mod >= 0 ? `+${mod}` : mod;

            return (
              <div key={attr} className="stat-box">
                <label>{attr}</label>
                <div className="stat-controls">
                  <button onClick={() => handleAttributeChange(attr, -1)} disabled={score <= 8}>-</button>
                  <span className="stat-value">{score}</span>
                  <button onClick={() => handleAttributeChange(attr, 1)} disabled={score >= 15}>+</button>
                </div>
                <div className="stat-mod">({modString})</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills Section */}
      <div className="skills-section">
        <h3>Skills</h3>
        <div className="skills-grid">
          {SKILLS.map(skill => (
            <label key={skill} className={`skill-item ${formData.skills.includes(skill) ? 'selected' : ''}`}>
              <input 
                type="checkbox" 
                checked={formData.skills.includes(skill)} 
                onChange={() => toggleSkill(skill)}
              />
              {skill}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Backstory:</label>
        <textarea 
          name="backstory" 
          rows="5"
          value={formData.backstory} 
          onChange={handleChange}
          placeholder="Who are you? Where do you come from?"
        />
      </div>

      <button className="submit-btn" onClick={() => alert("Character Ready (Logic coming soon!)")}>
        Embark
      </button>
    </div>
  );
}