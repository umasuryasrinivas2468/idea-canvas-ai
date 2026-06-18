import type { StudyPack } from "@/lib/study-agent";

export function Mindmap({ data }: { data: StudyPack["mindmap"] }) {
  const W = 1000;
  const H = 700;
  const cx = W / 2;
  const cy = H / 2;
  const branchR = 230;
  const childR = 160;

  const branches = data.branches.map((b, i) => {
    const angle = (i / data.branches.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * branchR;
    const y = cy + Math.sin(angle) * branchR;
    return { ...b, x, y, angle };
  });

  return (
    <div className="card-soft p-4 overflow-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-h-[500px]">
        <defs>
          <radialGradient id="rootGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="oklch(0.78 0.14 230)" />
            <stop offset="100%" stopColor="oklch(0.55 0.16 245)" />
          </radialGradient>
        </defs>

        {branches.map((b, i) => {
          const childAngleSpread = Math.PI / 3;
          return (
            <g key={i}>
              <path
                d={`M ${cx} ${cy} Q ${(cx + b.x) / 2} ${(cy + b.y) / 2 - 20} ${b.x} ${b.y}`}
                stroke="oklch(0.78 0.14 230 / 0.5)"
                strokeWidth="2"
                fill="none"
              />
              {b.children.map((c, ci) => {
                const t = b.children.length === 1 ? 0.5 : ci / (b.children.length - 1);
                const a = b.angle - childAngleSpread / 2 + t * childAngleSpread;
                const x = b.x + Math.cos(a) * childR;
                const y = b.y + Math.sin(a) * childR;
                return (
                  <g key={ci}>
                    <line
                      x1={b.x}
                      y1={b.y}
                      x2={x}
                      y2={y}
                      stroke="oklch(0.82 0.13 85 / 0.5)"
                      strokeWidth="1.5"
                    />
                    <g transform={`translate(${x},${y})`}>
                      <rect
                        x={-70}
                        y={-18}
                        width={140}
                        height={36}
                        rx={18}
                        fill="oklch(0.27 0.03 252)"
                        stroke="oklch(0.82 0.13 85 / 0.6)"
                      />
                      <text
                        textAnchor="middle"
                        dy="0.35em"
                        fontSize="12"
                        fill="oklch(0.96 0.01 250)"
                      >
                        {truncate(c, 22)}
                      </text>
                    </g>
                  </g>
                );
              })}
              <g transform={`translate(${b.x},${b.y})`}>
                <rect
                  x={-90}
                  y={-22}
                  width={180}
                  height={44}
                  rx={22}
                  fill="oklch(0.78 0.14 230)"
                />
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fontSize="14"
                  fontWeight="600"
                  fill="oklch(0.18 0.03 250)"
                >
                  {truncate(b.label, 26)}
                </text>
              </g>
            </g>
          );
        })}

        <g transform={`translate(${cx},${cy})`}>
          <circle r={70} fill="url(#rootGrad)" />
          <text
            textAnchor="middle"
            dy="0.35em"
            fontSize="16"
            fontWeight="700"
            fill="oklch(0.18 0.03 250)"
          >
            {truncate(data.root, 18)}
          </text>
        </g>
      </svg>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
