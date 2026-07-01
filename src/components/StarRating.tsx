import { useState } from 'react';

// Display stars, or an interactive picker when `onChange` is provided.
export default function StarRating({
  value,
  onChange,
  size = 'text-base',
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: string;
}) {
  const [hover, setHover] = useState(0);
  const interactive = Boolean(onChange);
  const shown = hover || value;

  return (
    <div className={`inline-flex ${size} ${interactive ? 'cursor-pointer' : ''}`} role={interactive ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={interactive ? () => onChange!(n) : undefined}
          onMouseEnter={interactive ? () => setHover(n) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
          className={n <= shown ? 'text-ochre-500' : 'text-majolica-200'}
          aria-label={interactive ? `${n} stars` : undefined}
          role={interactive ? 'radio' : undefined}
          aria-checked={interactive ? n === value : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
}
