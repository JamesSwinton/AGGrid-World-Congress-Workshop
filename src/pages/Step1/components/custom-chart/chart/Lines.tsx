import { linePath } from './path';
import type { PlottedSeries, XScale, YScale } from './types';

interface LinesProps {
  series: PlottedSeries[];
  x: XScale;
  y: YScale;
}

export default function Lines({ series, x, y }: LinesProps) {
  return (
    <g fill="none">
      {series.map((s) => (
        <path
          key={s.country}
          d={linePath(s.points, x, y)}
          stroke={s.color}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );
}
