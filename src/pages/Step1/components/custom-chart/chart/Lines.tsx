import { linePath } from './path';
import type { SeriesDef, XScale, YScale } from './types';

interface LinesProps {
  series: SeriesDef[];
  x: XScale;
  yLeft: YScale;
  yRight?: YScale;
}

export default function Lines({ series, x, yLeft, yRight }: LinesProps) {
  return (
    <g fill="none">
      {series.map((s) => {
        if (s.hidden) return null;
        const y = (s.axis ?? 'left') === 'right' && yRight ? yRight : yLeft;
        return (
          <path
            key={s.id}
            d={linePath(s.points, x, y)}
            stroke={s.color}
            strokeWidth={s.strokeWidth ?? 1.5}
            strokeDasharray={s.dashed ? '5 4' : undefined}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </g>
  );
}
