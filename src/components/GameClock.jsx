// src/components/GameClock.jsx
import React from 'react';
import { formatGameTime } from '../utils/time';

export default function GameClock({ totalMinutes }) {
  const { timeString, dateString, isNight } = formatGameTime(totalMinutes);

  return (
    <div className={`game-clock ${isNight ? 'night' : 'day'}`}>
      <div className="clock-face">
        <i className={`ra ${isNight ? 'ra-moon-sun' : 'ra-sun'} ra-2x icon-glow`}></i>
      </div>
      <div className="clock-text">
        <div className="clock-time">{timeString}</div>
        <div className="clock-date">{dateString}</div>
      </div>
    </div>
  );
}