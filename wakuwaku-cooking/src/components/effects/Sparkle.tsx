import React, { useEffect, useState } from 'react';

interface SparkleProps {
  x: number;
  y: number;
  onComplete?: () => void;
}

export const Sparkle: React.FC<SparkleProps> = ({ x, y, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className="absolute pointer-events-none text-3xl animate-[sparkle_0.6s_ease-out_forwards]"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      ⭐
    </div>
  );
};
