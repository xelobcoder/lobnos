import Link from "next/link";
import { implementationSteps } from "../../data/content";

const stagePeople = [
  "Your facility lead + PLS team",
  "Your workflow owners + PLS team",
  "Your future users + PLS team",
  "Your implementation lead + PLS team",
  "Your users + PLS team",
  "Your facility team + PLS support",
];

function PeopleScene({ stage }: { stage: number }) {
  return (
    <svg viewBox="0 0 560 330" className="journey-people" aria-hidden="true" focusable="false">
      <rect x="22" y="18" width="516" height="282" rx="24" fill="#edf5ef" />
      <circle cx="280" cy="148" r="104" fill="#e0eee3" />
      <path d="M70 291h420" stroke="#c6dbcc" strokeWidth="3" strokeLinecap="round" />
      <g className="journey-scene-board">
        <rect x="185" y="42" width="190" height="122" rx="12" fill="white" stroke="#bfd5c6" strokeWidth="2" />
        <rect x="205" y="61" width="90" height="8" rx="4" fill="#2e7d32" />
        {Array.from({ length: 6 }, (_, index) => (
          <g key={index}>
            <circle cx={211 + index * 27} cy="92" r="8" fill={index <= stage ? "#2e7d32" : "#e0eee3"} />
            {index < 5 && <path d={`M${220 + index * 27} 92h9`} stroke="#bfd5c6" strokeWidth="2" />}
          </g>
        ))}
        <path d="M205 120h110m-110 15h145" stroke="#d1e2d6" strokeWidth="6" strokeLinecap="round" />
        <path d="m333 62 6 6 12-14" stroke="#2e7d32" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="journey-person journey-person-left">
        <path d="M95 243h48l-5 47h-17l-4-28-5 28H95z" fill="#244b39" />
        <path d="M88 286h28v9H83q-5-5 5-9m39 0h17l9 9h-27z" fill="#153f31" />
        <path d="M81 182q6-24 36-24t41 25l-8 64H87z" fill="#2e7d32" />
        <path d="M145 177q19 15 28 27l41-15" fill="none" stroke="#9b6447" strokeWidth="15" strokeLinecap="round" />
        <path d="M145 177l16 20" stroke="#2e7d32" strokeWidth="21" strokeLinecap="round" />
        <path d="M88 186l-9 46 34 8" fill="none" stroke="#9b6447" strokeWidth="14" strokeLinecap="round" />
        <rect x="105" y="145" width="23" height="23" rx="8" fill="#9b6447" />
        <ellipse cx="117" cy="126" rx="27" ry="33" fill="#ac7757" />
        <path d="M90 125q-8-42 27-40 33 0 29 40l-9-17q-22 2-36-7z" fill="#293d32" />
        <circle cx="108" cy="125" r="2" fill="#293d32" /><circle cx="127" cy="125" r="2" fill="#293d32" />
        <path d="M111 139q6 5 12 0" stroke="#633c2c" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="m111 176 7 9 8-9" fill="none" stroke="#d9ebde" strokeWidth="3" />
      </g>
      <g className="journey-person journey-person-right">
        <path d="M411 242h48l7 48h-18l-10-29-2 29h-18z" fill="#36536a" />
        <path d="M418 287h20v9h-30q-2-5 10-9m30 0h19l10 9h-29z" fill="#153f31" />
        <path d="M403 183q5-25 33-25 31 0 42 26l-9 63h-60z" fill="#fff" stroke="#bfd5c6" strokeWidth="2" />
        <path d="M410 180l-24 25-38-12" fill="none" stroke="#dbab85" strokeWidth="15" strokeLinecap="round" />
        <path d="M410 179l-16 17" stroke="#fff" strokeWidth="21" strokeLinecap="round" />
        <path d="m470 185 11 44-29 10" fill="none" stroke="#dbab85" strokeWidth="14" strokeLinecap="round" />
        <rect x="425" y="143" width="23" height="24" rx="8" fill="#dbab85" />
        <path d="M407 125q-2-39 29-39 36 0 32 46v28h-19v-39z" fill="#3f352f" />
        <ellipse cx="436" cy="125" rx="25" ry="31" fill="#e5b995" />
        <path d="M410 115q0-30 27-29 25 0 29 27-22 0-37-15z" fill="#3f352f" />
        <circle cx="427" cy="125" r="2" fill="#3f352f" /><circle cx="445" cy="125" r="2" fill="#3f352f" />
        <path d="M431 139q6 5 11 0" stroke="#956647" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="m428 168 9 18 10-18" fill="none" stroke="#bfd5c6" strokeWidth="3" />
        <rect x="449" y="193" width="11" height="15" rx="2" fill="#2e7d32" />
      </g>
      <g className="journey-scene-desk">
        <rect x="173" y="225" width="214" height="13" rx="6" fill="#bad1c1" />
        <path d="M193 238v53m174-53v53" stroke="#8dad97" strokeWidth="8" />
        {stage === 0 || stage === 5 ? (
          <g fill="white" stroke="#2e7d32" strokeWidth="2">
            <path d="M228 183h40v24h-14l-9 8v-8h-17z" />
            <path d="M291 169h40v24h-17l-9 8v-8h-14z" />
          </g>
        ) : stage === 1 || stage === 3 ? (
          <g>
            <rect x="247" y="175" width="67" height="48" rx="5" fill="white" stroke="#bfd5c6" strokeWidth="2" />
            <path d="m257 189 4 4 7-8m-11 21 4 4 7-8" fill="none" stroke="#2e7d32" strokeWidth="3" />
            <path d="M276 190h27m-27 17h27" stroke="#bfd5c6" strokeWidth="4" />
          </g>
        ) : (
          <g>
            <rect x="237" y="178" width="86" height="45" rx="5" fill="#153f31" />
            <rect x="244" y="185" width="72" height="30" rx="2" fill="#e0eee3" />
            <path d="M256 202h11m6 0h12m6 0h12" stroke="#2e7d32" strokeWidth="5" />
            <path d="M230 223h100" stroke="#36536a" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}
      </g>
    </svg>
  );
}

export function ImplementationJourney() {
  const points = [
    { x: 380, y: 80, labelX: 380, labelY: 24, lines: ["Initial", "conversation"] },
    { x: 588, y: 200, labelX: 685, labelY: 191, lines: ["Requirements", "assessment"] },
    { x: 588, y: 440, labelX: 685, labelY: 431, lines: ["Product", "demonstration"] },
    { x: 380, y: 560, labelX: 380, labelY: 614, lines: ["Configuration", "planning"] },
    { x: 172, y: 440, labelX: 75, labelY: 431, lines: ["Training", "& readiness"] },
    { x: 172, y: 200, labelX: 75, labelY: 191, lines: ["Go-live", "& support"] },
  ];

  return (
    <div className="implementation-circle">
      <p className="journey-reading-guide">Follow the numbered path clockwise, from the first conversation to go-live and support.</p>
      <div className="journey-circle-diagram" aria-hidden="true">
        <svg viewBox="0 0 760 660" className="journey-ring" focusable="false">
          <circle cx="380" cy="320" r="240" fill="none" stroke="#d1e2d6" strokeWidth="16" />
          <path d="M380 80a240 240 0 1 1-208 120" fill="none" stroke="#2e7d32" strokeWidth="3" strokeDasharray="7 9" />
          <path d="m488 100 18 13-22 3m132 191-10 20-10-20m-95 221-22 2 12-18m-221-6-18-13 22-3m-132-191 10-20 10 20" fill="#2e7d32" />
          {points.map((point, index) => (
            <g key={index}>
              <circle cx={point.x} cy={point.y} r="30" fill="#2e7d32" stroke="white" strokeWidth="5" />
              <text x={point.x} y={point.y + 10} textAnchor="middle" fill="white" fontSize="27" fontWeight="700">{implementationSteps[index][0]}</text>
              <text className="journey-ring-label" x={point.labelX} y={point.labelY} textAnchor="middle" fill="#153f31" fontSize="17" fontWeight="700">
                {point.lines.map((line, lineIndex) => <tspan key={line} x={point.labelX} dy={lineIndex === 0 ? 0 : 23}>{line}</tspan>)}
              </text>
            </g>
          ))}
        </svg>
        <div className="journey-circle-people">
          <PeopleScene stage={5} />
          <strong>People first.<br />A shared plan.</strong>
        </div>
      </div>
      <ol className="journey-visible-stages" aria-label="Implementation stages in order">
        {implementationSteps.map(([number, title, copy], index) => (
          <li key={number} className="journey-visible-stage">
            <span className="journey-step-number">{number}</span>
            <div>
              <h3>{title}</h3>
              <p>{copy}</p>
              <small>{stagePeople[index]}</small>
            </div>
          </li>
        ))}
      </ol>
      <div className="journey-circle-footer">
        <span>Illustrative people, not staff portraits.</span>
        <Link className="text-link" href="/request-demo">Talk through your implementation <span aria-hidden="true">&rarr;</span></Link>
      </div>
    </div>
  );
}
