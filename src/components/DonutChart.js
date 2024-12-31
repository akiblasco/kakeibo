import React from 'react';

export function DonutChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativeValue = 0;

  return (
    <svg viewBox="0 0 36 36" className="w-32 h-32">
      {data.map((item, index) => {
        const startAngle = (cumulativeValue / total) * 360;
        const endAngle = ((cumulativeValue + item.value) / total) * 360;
        cumulativeValue += item.value;

        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
        const x1 = 18 + 18 * Math.cos((startAngle * Math.PI) / 180);
        const y1 = 18 - 18 * Math.sin((startAngle * Math.PI) / 180);
        const x2 = 18 + 18 * Math.cos((endAngle * Math.PI) / 180);
        const y2 = 18 - 18 * Math.sin((endAngle * Math.PI) / 180);

        return (
          <path
            key={index}
            d={`M18,18 L${x1},${y1} A18,18 0 ${largeArcFlag},1 ${x2},${y2} Z`}
            fill={item.color}
          />
        );
      })}
    </svg>
  );
}

