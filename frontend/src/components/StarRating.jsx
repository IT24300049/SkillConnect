import { useState } from 'react';

const FILLED_COLOR = '#f59e0b';
const EMPTY_COLOR = '#e2e8f0';

export default function StarRating({ value = 0, onChange, size = 20 }) {
  const [hoverValue, setHoverValue] = useState(null);
  const isInteractive = typeof onChange === 'function';
  const displayValue = hoverValue ?? value;

  const handleClick = (i) => {
    if (isInteractive) onChange(i + 1);
  };

  const handleMouseEnter = (i) => {
    if (isInteractive) setHoverValue(i + 1);
  };

  const handleMouseLeave = () => {
    if (isInteractive) setHoverValue(null);
  };

  return (
    <span
      className="stars"
      style={{ gap: 2 }}
      role={isInteractive ? 'slider' : 'img'}
      aria-label={isInteractive ? undefined : `Rating: ${value} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = displayValue > i;
        return (
          <span
            key={i}
            onClick={() => handleClick(i)}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={handleMouseLeave}
            style={{
              fontSize: size,
              color: filled ? FILLED_COLOR : EMPTY_COLOR,
              cursor: isInteractive ? 'pointer' : 'default',
              transition: 'color 0.15s',
              userSelect: 'none',
            }}
          >
            ★
          </span>
        );
      })}
    </span>
  );
}
