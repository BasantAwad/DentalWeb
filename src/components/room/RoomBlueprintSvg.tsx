/**
 * AUTO-GENERATED — do not edit by hand.
 * Source: dental_dummy_head_lab_blueprint.html (supplied room blueprint)
 * Regenerate: node scripts/extract-blueprint.mjs
 *
 * Geometry is preserved verbatim from the source plan. The only changes are:
 *   - JSX attribute names
 *   - stable ids / data attributes on the 14 phantom-head stations
 *
 * Station ids (PH-01 … PH-14) and their zones come from the plan itself:
 *   PH-01…PH-07  top counter
 *   PH-08…PH-10  left wall counter
 *   PH-11…PH-14  bottom counter
 */
export const BLUEPRINT_VIEWBOX = '0 0 1600 1100'

export interface BlueprintStation {
  index: number
  id: string
  label: string
  zone: 'top-counter' | 'left-wall' | 'bottom-counter'
  zoneLabel: string
  /** Station mount point, in blueprint user units. */
  transform: { x: number; y: number; rot: number }
  /** Centre of the mannequin head, in blueprint user units. */
  head: { x: number; y: number }
}

export const BLUEPRINT_STATIONS: BlueprintStation[] = [
  {
    "index": 1,
    "id": "PH-01",
    "label": "PH-01",
    "zone": "top-counter",
    "zoneLabel": "Top counter",
    "transform": {
      "x": 360,
      "y": 220,
      "rot": 180
    },
    "head": {
      "x": 360,
      "y": 287
    }
  },
  {
    "index": 2,
    "id": "PH-02",
    "label": "PH-02",
    "zone": "top-counter",
    "zoneLabel": "Top counter",
    "transform": {
      "x": 520,
      "y": 220,
      "rot": 180
    },
    "head": {
      "x": 520,
      "y": 287
    }
  },
  {
    "index": 3,
    "id": "PH-03",
    "label": "PH-03",
    "zone": "top-counter",
    "zoneLabel": "Top counter",
    "transform": {
      "x": 680,
      "y": 220,
      "rot": 180
    },
    "head": {
      "x": 680,
      "y": 287
    }
  },
  {
    "index": 4,
    "id": "PH-04",
    "label": "PH-04",
    "zone": "top-counter",
    "zoneLabel": "Top counter",
    "transform": {
      "x": 840,
      "y": 220,
      "rot": 180
    },
    "head": {
      "x": 840,
      "y": 287
    }
  },
  {
    "index": 5,
    "id": "PH-05",
    "label": "PH-05",
    "zone": "top-counter",
    "zoneLabel": "Top counter",
    "transform": {
      "x": 1000,
      "y": 220,
      "rot": 180
    },
    "head": {
      "x": 1000,
      "y": 287
    }
  },
  {
    "index": 6,
    "id": "PH-06",
    "label": "PH-06",
    "zone": "top-counter",
    "zoneLabel": "Top counter",
    "transform": {
      "x": 1160,
      "y": 220,
      "rot": 180
    },
    "head": {
      "x": 1160,
      "y": 287
    }
  },
  {
    "index": 7,
    "id": "PH-07",
    "label": "PH-07",
    "zone": "top-counter",
    "zoneLabel": "Top counter",
    "transform": {
      "x": 1320,
      "y": 220,
      "rot": 180
    },
    "head": {
      "x": 1320,
      "y": 287
    }
  },
  {
    "index": 8,
    "id": "PH-08",
    "label": "PH-08",
    "zone": "left-wall",
    "zoneLabel": "Left wall counter",
    "transform": {
      "x": 270,
      "y": 340,
      "rot": 90
    },
    "head": {
      "x": 337,
      "y": 340
    }
  },
  {
    "index": 9,
    "id": "PH-09",
    "label": "PH-09",
    "zone": "left-wall",
    "zoneLabel": "Left wall counter",
    "transform": {
      "x": 270,
      "y": 620,
      "rot": 90
    },
    "head": {
      "x": 337,
      "y": 620
    }
  },
  {
    "index": 10,
    "id": "PH-10",
    "label": "PH-10",
    "zone": "left-wall",
    "zoneLabel": "Left wall counter",
    "transform": {
      "x": 270,
      "y": 760,
      "rot": 90
    },
    "head": {
      "x": 337,
      "y": 760
    }
  },
  {
    "index": 11,
    "id": "PH-11",
    "label": "PH-11",
    "zone": "bottom-counter",
    "zoneLabel": "Bottom counter",
    "transform": {
      "x": 540,
      "y": 880,
      "rot": 0
    },
    "head": {
      "x": 540,
      "y": 813
    }
  },
  {
    "index": 12,
    "id": "PH-12",
    "label": "PH-12",
    "zone": "bottom-counter",
    "zoneLabel": "Bottom counter",
    "transform": {
      "x": 700,
      "y": 880,
      "rot": 0
    },
    "head": {
      "x": 700,
      "y": 813
    }
  },
  {
    "index": 13,
    "id": "PH-13",
    "label": "PH-13",
    "zone": "bottom-counter",
    "zoneLabel": "Bottom counter",
    "transform": {
      "x": 860,
      "y": 880,
      "rot": 0
    },
    "head": {
      "x": 860,
      "y": 813
    }
  },
  {
    "index": 14,
    "id": "PH-14",
    "label": "PH-14",
    "zone": "bottom-counter",
    "zoneLabel": "Bottom counter",
    "transform": {
      "x": 1020,
      "y": 880,
      "rot": 0
    },
    "head": {
      "x": 1020,
      "y": 813
    }
  }
]

/**
 * The plan geometry as a reusable <g>.
 * Embed this inside any SVG that uses the {0 0 1600 1100{'}'} viewBox so
 * interaction layers can be registered in the same coordinate space.
 */
export function BlueprintGeometry() {
  return (<g>
            <defs>
                
                <pattern id="wall-hatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="12" stroke="var(--plan-line)" strokeWidth="1.5" opacity="0.4" />
                </pattern>
                <pattern id="wall-hatch-paper" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="12" stroke="#0f172a" strokeWidth="1.5" opacity="0.3" />
                </pattern>

                
                <pattern id="wood-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <rect width="40" height="40" fill="none"/>
                    <path d="M 0,10 Q 10,5 20,10 T 40,10 M 0,25 Q 15,30 25,25 T 40,25" fill="none" stroke="var(--plan-accent)" strokeWidth="0.8" opacity="0.3"/>
                </pattern>

                
                <filter id="light-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="12" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                
                <g id="phantom-head-unit">
                    
                    <rect x="-12" y="-4" width="24" height="8" rx="2" fill="var(--plan-metal)" stroke="var(--plan-line)" strokeWidth="1"/>
                    <path d="M 0,0 L 0,-22" stroke="var(--plan-metal-2)" strokeWidth="4" strokeLinecap="round"/>
                    <circle cx="0" cy="-22" r="5" fill="var(--plan-metal-3)" stroke="var(--plan-line)" strokeWidth="1"/>
                    <path d="M 0,-22 L 0,-38" stroke="var(--plan-soft)" strokeWidth="3"/>
                    
                    
                    <circle cx="0" cy="-38" r="6" fill="var(--plan-line)" opacity="0.8"/>
                    
                    
                    <path d="M -16,-46 L 16,-46 L 12,-38 L -12,-38 Z" fill="var(--plan-metal-3)" stroke="var(--plan-line)" strokeWidth="1"/>

                    
                    
                    <path d="M -18,-52 C -24,-62 -22,-88 0,-90 C 22,-88 24,-62 18,-52 C 14,-45 -14,-45 -18,-52 Z" 
                          fill="rgba(200, 217, 207, 0.14)" stroke="var(--plan-line)" strokeWidth="1.5" strokeDasharray="4,2"/>
                    
                    
                    
                    <path d="M -11,-62 C -11,-76 11,-76 11,-62 C 11,-55 -11,-55 -11,-62 Z" fill="var(--plan-gums)" opacity="0.75" stroke="var(--plan-gums-dark)" strokeWidth="1"/>
                    <path d="M -8,-64 C -8,-72 8,-72 8,-64 C 8,-60 -8,-60 -8,-64 Z" fill="var(--plan-teeth)" stroke="var(--plan-soft)" strokeWidth="1"/>
                    
                    
                    <line x1="-7" y1="-67" x2="-5" y2="-61" stroke="var(--plan-metal-2)" strokeWidth="0.8"/>
                    <line x1="-3" y1="-70" x2="-2" y2="-60" stroke="var(--plan-metal-2)" strokeWidth="0.8"/>
                    <line x1="0" y1="-71" x2="0" y2="-60" stroke="var(--plan-metal-2)" strokeWidth="0.8"/>
                    <line x1="3" y1="-70" x2="2" y2="-60" stroke="var(--plan-metal-2)" strokeWidth="0.8"/>
                    <line x1="7" y1="-67" x2="5" y2="-61" stroke="var(--plan-metal-2)" strokeWidth="0.8"/>

                    
                    <path d="M -14,-50 C -20,-58 -16,-72 -14,-75" fill="none" stroke="var(--plan-accent)" strokeWidth="1.2" opacity="0.8"/>
                    <path d="M 14,-50 C 20,-58 16,-72 14,-75" fill="none" stroke="var(--plan-accent)" strokeWidth="1.2" opacity="0.8"/>
                </g>

                
                <g id="dental-stool">
                    
                    <path d="M 0,0 L 0,-24 M 0,0 L 22.8,-7.4 M 0,0 L 14.1,19.4 M 0,0 L -14.1,19.4 M 0,0 L -22.8,-7.4" stroke="var(--plan-metal)" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="0" cy="-24" r="3" fill="var(--plan-line)"/>
                    <circle cx="22.8" cy="-7.4" r="3" fill="var(--plan-line)"/>
                    <circle cx="14.1" cy="19.4" r="3" fill="var(--plan-line)"/>
                    <circle cx="-14.1" cy="19.4" r="3" fill="var(--plan-line)"/>
                    <circle cx="-22.8" cy="-7.4" r="3" fill="var(--plan-line)"/>
                    
                    <circle cx="0" cy="0" r="16" fill="var(--plan-fill-2)" stroke="var(--plan-line)" strokeWidth="2"/>
                    <circle cx="0" cy="0" r="12" fill="none" stroke="var(--plan-line)" strokeWidth="1" strokeDasharray="2,2"/>
                </g>

                
                <g id="task-lamp">
                    <circle cx="0" cy="0" r="5" fill="var(--plan-metal)" stroke="var(--plan-line)" strokeWidth="1"/>
                    <path d="M 0,0 L 12,-15 L 28,-12" fill="none" stroke="var(--plan-metal-2)" strokeWidth="2" strokeLinecap="round"/>
                    
                    <path d="M 24,-20 L 36,-14 L 30,-4 L 18,-10 Z" fill="var(--plan-line)" opacity="0.8" stroke="var(--plan-fill-2)" strokeWidth="1"/>
                    
                    <polygon points="30,-14 90,-45 80,15" fill="url(#lamp-beam)" className="lamp-light-beam" opacity="0.35"/>
                </g>

                
                <linearGradient id="lamp-beam" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--plan-line)" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="var(--plan-line)" stopOpacity="0"/>
                </linearGradient>

                
                <g id="demo-chair">
                    <rect x="-14" y="-14" width="28" height="28" rx="4" fill="var(--plan-fill-2)" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <path d="M -12,10 L 12,10" stroke="var(--plan-accent)" strokeWidth="3" strokeLinecap="round"/>
                </g>
            </defs>

            
            <g id="grid-subdivision">
                
                <rect x="200" y="150" width="1200" height="800" fill="none" stroke="var(--plan-line)" strokeWidth="0.5" opacity="0.2"/>
            </g>

            
            <g id="floor-tiles" opacity="0.15">
                
                <path d="
                    M 200,250 L 1400,250 M 200,350 L 1400,350 M 200,450 L 1400,450 M 200,550 L 1400,550 
                    M 200,650 L 1400,650 M 200,750 L 1400,750 M 200,850 L 1400,850 
                    M 300,150 L 300,950 M 400,150 L 400,950 M 500,150 L 500,950 M 600,150 L 600,950 
                    M 700,150 L 700,950 M 800,150 L 800,950 M 900,150 L 900,950 M 1000,150 L 1000,950 
                    M 1100,150 L 1100,950 M 1200,150 L 1200,950 M 1300,150 L 1300,950
                " stroke="var(--plan-line)" strokeWidth="1"/>
            </g>

            
            <g id="architectural-walls" className="glow-element">
                
                
                
                
                
                <path d="
                    M 176,126 L 1424,126 L 1424,974 L 176,974 Z
                    M 200,150 L 200,950 L 1400,950 L 1400,150 Z
                " fill="url(#wall-hatch)" className="wall-hatch-target" fillRule="evenodd"/>

                
                <rect x="176" y="126" width="1248" height="848" fill="none" stroke="var(--plan-line)" strokeWidth="3" className="blueprint-stroke"/>
                <rect x="200" y="150" width="1200" height="800" fill="none" stroke="var(--plan-line)" strokeWidth="2" className="blueprint-stroke"/>

                
                
                
                
                <rect x="170" y="320" width="36" height="260" fill="var(--plan-bg)" className="window-cutout-bg"/>
                
                <rect x="176" y="320" width="24" height="260" fill="none" stroke="var(--plan-line)" strokeWidth="2"/>
                <line x1="188" y1="320" x2="188" y2="580" stroke="var(--plan-line)" strokeWidth="1.5"/>
                <line x1="176" y1="385" x2="200" y2="385" stroke="var(--plan-line)" strokeWidth="1.5"/>
                <line x1="176" y1="450" x2="200" y2="450" stroke="var(--plan-line)" strokeWidth="1.5"/>
                <line x1="176" y1="515" x2="200" y2="515" stroke="var(--plan-line)" strokeWidth="1.5"/>

                
                
                <rect x="1390" y="800" width="36" height="110" fill="var(--plan-bg)" className="door-cutout-bg"/>
                <line x1="1400" y1="800" x2="1400" y2="910" stroke="var(--plan-bg)" strokeWidth="4" className="door-cutout-line"/>
                
                <line x1="1400" y1="800" x2="1300" y2="800" stroke="var(--plan-line)" strokeWidth="3" strokeLinecap="round"/>
                
                <path d="M 1300,800 A 100,100 0 0,0 1400,900" fill="none" stroke="var(--plan-line)" strokeWidth="1.5" strokeDasharray="4,4"/>
                
                <rect x="1394" y="794" width="12" height="8" fill="var(--plan-line)"/>
                <rect x="1394" y="904" width="12" height="8" fill="var(--plan-line)"/>
            </g>

            
            
            <g id="perimeter-counters">
                
                
                <path d="M 200,150 L 1400,150 L 1400,220 L 270,220 L 270,950 L 200,950 Z" 
                      fill="rgba(127, 195, 188, 0.1)" stroke="var(--plan-line)" strokeWidth="2" className="counter-fill"/>
                
                
                <path d="M 450,880 L 1250,880 L 1250,950 L 450,950 Z" 
                      fill="rgba(127, 195, 188, 0.1)" stroke="var(--plan-line)" strokeWidth="2" className="counter-fill"/>

                
                <path d="M 200,215 L 1395,215" stroke="var(--plan-line)" strokeWidth="1" opacity="0.6"/>
                <path d="M 265,220 L 265,950" stroke="var(--plan-line)" strokeWidth="1" opacity="0.6"/>
                <path d="M 450,885 L 1250,885" stroke="var(--plan-line)" strokeWidth="1" opacity="0.6"/>

                
                <g id="corner-sink" transform="translate(210, 160)">
                    <rect x="0" y="0" width="45" height="45" rx="6" fill="var(--plan-fill)" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <rect x="5" y="5" width="35" height="35" rx="4" fill="none" stroke="var(--plan-line)" strokeWidth="1"/>
                    <circle cx="22.5" cy="22.5" r="4" fill="var(--plan-line)"/>
                    
                    <path d="M 22.5,5 L 22.5,14" stroke="var(--plan-metal-2)" strokeWidth="3" strokeLinecap="round"/>
                </g>
            </g>

            
            
            <g id="central-table" transform="translate(520, 420)">
                
                <rect x="10" y="10" width="480" height="220" rx="8" fill="#000000" opacity="0.3"/>
                
                <rect x="0" y="0" width="480" height="220" rx="6" fill="rgba(180, 83, 9, 0.25)" stroke="var(--plan-accent)" strokeWidth="2.5"/>
                
                <rect x="0" y="0" width="480" height="220" rx="6" fill="url(#wood-pattern)"/>
                
                <rect x="8" y="8" width="464" height="204" rx="4" fill="none" stroke="var(--plan-accent)" strokeWidth="1" opacity="0.5"/>
                
                <rect x="160" y="95" width="50" height="30" rx="3" fill="var(--plan-fill)" stroke="var(--plan-accent)" strokeWidth="1"/>
                <rect x="270" y="95" width="50" height="30" rx="3" fill="var(--plan-fill)" stroke="var(--plan-accent)" strokeWidth="1"/>
            </g>

            
            <g id="central-chairs">
                
                <use href="#demo-chair" x="580" y="380" transform="rotate(180 580 380)"/>
                <use href="#demo-chair" x="680" y="380" transform="rotate(180 680 380)"/>
                <use href="#demo-chair" x="780" y="380" transform="rotate(180 780 380)"/>
                <use href="#demo-chair" x="880" y="380" transform="rotate(180 880 380)"/>
                <use href="#demo-chair" x="930" y="380" transform="rotate(180 930 380)"/>

                
                <use href="#demo-chair" x="580" y="680"/>
                <use href="#demo-chair" x="680" y="680"/>
                <use href="#demo-chair" x="780" y="680"/>
                <use href="#demo-chair" x="880" y="680"/>
                <use href="#demo-chair" x="930" y="680"/>

                
                <use href="#demo-chair" x="480" y="530" transform="rotate(90 480 530)"/>
                <use href="#demo-chair" x="1030" y="530" transform="rotate(-90 1030 530)"/>
            </g>

            
            
            <g id="dental-workstations">
                
                
                
                <g id="station-ph-01" data-station-id="PH-01" data-resource-key="phantom-head-ph-01" data-zone="top-counter" data-head-x="360" data-head-y="287" className="plan-station" transform="translate(360, 220) rotate(180)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-02" data-station-id="PH-02" data-resource-key="phantom-head-ph-02" data-zone="top-counter" data-head-x="520" data-head-y="287" className="plan-station" transform="translate(520, 220) rotate(180)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-03" data-station-id="PH-03" data-resource-key="phantom-head-ph-03" data-zone="top-counter" data-head-x="680" data-head-y="287" className="plan-station" transform="translate(680, 220) rotate(180)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-04" data-station-id="PH-04" data-resource-key="phantom-head-ph-04" data-zone="top-counter" data-head-x="840" data-head-y="287" className="plan-station" transform="translate(840, 220) rotate(180)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-05" data-station-id="PH-05" data-resource-key="phantom-head-ph-05" data-zone="top-counter" data-head-x="1000" data-head-y="287" className="plan-station" transform="translate(1000, 220) rotate(180)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-06" data-station-id="PH-06" data-resource-key="phantom-head-ph-06" data-zone="top-counter" data-head-x="1160" data-head-y="287" className="plan-station" transform="translate(1160, 220) rotate(180)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-07" data-station-id="PH-07" data-resource-key="phantom-head-ph-07" data-zone="top-counter" data-head-x="1320" data-head-y="287" className="plan-station" transform="translate(1320, 220) rotate(180)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>

                
                
                <g id="station-ph-08" data-station-id="PH-08" data-resource-key="phantom-head-ph-08" data-zone="left-wall" data-head-x="337" data-head-y="340" className="plan-station" transform="translate(270, 340) rotate(90)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-09" data-station-id="PH-09" data-resource-key="phantom-head-ph-09" data-zone="left-wall" data-head-x="337" data-head-y="620" className="plan-station" transform="translate(270, 620) rotate(90)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-10" data-station-id="PH-10" data-resource-key="phantom-head-ph-10" data-zone="left-wall" data-head-x="337" data-head-y="760" className="plan-station" transform="translate(270, 760) rotate(90)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>

                
                
                <g id="station-ph-11" data-station-id="PH-11" data-resource-key="phantom-head-ph-11" data-zone="bottom-counter" data-head-x="540" data-head-y="813" className="plan-station" transform="translate(540, 880) rotate(0)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-12" data-station-id="PH-12" data-resource-key="phantom-head-ph-12" data-zone="bottom-counter" data-head-x="700" data-head-y="813" className="plan-station" transform="translate(700, 880) rotate(0)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>

                
                <g id="station-ph-13" data-station-id="PH-13" data-resource-key="phantom-head-ph-13" data-zone="bottom-counter" data-head-x="860" data-head-y="813" className="plan-station" transform="translate(860, 880) rotate(0)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>

                
                <g id="station-ph-14" data-station-id="PH-14" data-resource-key="phantom-head-ph-14" data-zone="bottom-counter" data-head-x="1020" data-head-y="813" className="plan-station" transform="translate(1020, 880) rotate(0)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
            </g>

            
            
            <g id="wall-equipment">
                
                <g transform="translate(720, 136)">
                    
                    <rect x="0" y="0" width="160" height="14" rx="2" fill="var(--plan-fill-2)" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <rect x="10" y="3" width="140" height="8" rx="1" fill="var(--plan-line)" opacity="0.8"/>
                    
                    <path d="M 0,14 L -20,40 M 160,14 L 180,40" stroke="var(--plan-line)" strokeWidth="1" strokeDasharray="2,2" opacity="0.4"/>
                </g>

                
                <g transform="translate(1120, 136)">
                    <rect x="0" y="0" width="110" height="14" rx="2" fill="var(--plan-fill-2)" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <rect x="8" y="3" width="94" height="8" rx="1" fill="var(--plan-line)" opacity="0.8"/>
                </g>

                
                <g transform="translate(420, 132)">
                    <rect x="0" y="0" width="120" height="18" rx="3" fill="var(--plan-soft)" stroke="var(--plan-fill-2)" strokeWidth="1.5"/>
                    <line x1="10" y1="14" x2="110" y2="14" stroke="var(--plan-metal)" strokeWidth="2"/>
                    
                    <line x1="15" y1="6" x2="45" y2="6" stroke="var(--plan-metal-2)" strokeWidth="1"/>
                    
                    <circle cx="105" cy="6" r="1.5" fill="var(--plan-accent)"/>
                </g>

                
                
                <g transform="translate(200, 680) rotate(90)">
                    <rect x="0" y="0" width="70" height="8" fill="var(--plan-fill)" stroke="var(--plan-line)" strokeWidth="1"/>
                </g>
                
                <g transform="translate(600, 138)">
                    <rect x="0" y="0" width="60" height="8" fill="var(--plan-fill)" stroke="var(--plan-line)" strokeWidth="1"/>
                </g>
            </g>

            
            <g id="dimension-lines" opacity="0.5">
                
                <g transform="translate(200, 80)">
                    <line x1="0" y1="0" x2="1200" y2="0" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <line x1="0" y1="-10" x2="0" y2="10" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <line x1="1200" y1="-10" x2="1200" y2="10" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    
                    <path d="M -5,5 L 5,-5 M 1195,5 L 1205,-5" stroke="var(--plan-line)" strokeWidth="2"/>
                    
                    <circle cx="600" cy="0" r="8" fill="var(--plan-bg)" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <path d="M 595,0 L 605,0 M 600,-5 L 600,5" stroke="var(--plan-line)" strokeWidth="1"/>
                </g>

                
                <g transform="translate(100, 150)">
                    <line x1="0" y1="0" x2="0" y2="800" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <line x1="-10" y1="0" x2="10" y2="0" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <line x1="-10" y1="800" x2="10" y2="800" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    
                    <path d="M -5,-5 L 5,5 M -5,795 L 5,805" stroke="var(--plan-line)" strokeWidth="2"/>
                    
                    <circle cx="0" cy="400" r="8" fill="var(--plan-bg)" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <path d="M -5,400 L 5,400 M 0,395 L 0,405" stroke="var(--plan-line)" strokeWidth="1"/>
                </g>

                
                <g transform="translate(1330, 870)">
                    <circle cx="0" cy="0" r="32" fill="rgba(15, 23, 42, 0.6)" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    
                    <polygon points="0,-26 8,0 0,-4" fill="var(--plan-line)"/>
                    <polygon points="0,-26 -8,0 0,-4" fill="var(--plan-fill-2)"/>
                    
                    <polygon points="0,26 8,0 0,4" fill="var(--plan-metal)"/>
                    <polygon points="0,26 -8,0 0,4" fill="var(--plan-metal-3)"/>
                    <circle cx="0" cy="0" r="3" fill="var(--plan-line)"/>
                </g>
            </g>
        
    </g>
  )
}

/** Standalone rendering of the blueprint, without an interaction layer. */
export default function RoomBlueprintSvg(props: { className?: string }) {
  return (
    <svg
      id="blueprint-svg"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 1600 1100"
      preserveAspectRatio="xMidYMid meet"
      className={props.className}
      role="img"
      aria-label="Architectural plan of the dental dummy head laboratory with fourteen phantom head stations"
    >
            <defs>
                
                <pattern id="wall-hatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="12" stroke="var(--plan-line)" strokeWidth="1.5" opacity="0.4" />
                </pattern>
                <pattern id="wall-hatch-paper" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="12" stroke="#0f172a" strokeWidth="1.5" opacity="0.3" />
                </pattern>

                
                <pattern id="wood-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <rect width="40" height="40" fill="none"/>
                    <path d="M 0,10 Q 10,5 20,10 T 40,10 M 0,25 Q 15,30 25,25 T 40,25" fill="none" stroke="var(--plan-accent)" strokeWidth="0.8" opacity="0.3"/>
                </pattern>

                
                <filter id="light-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="12" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                
                <g id="phantom-head-unit">
                    
                    <rect x="-12" y="-4" width="24" height="8" rx="2" fill="var(--plan-metal)" stroke="var(--plan-line)" strokeWidth="1"/>
                    <path d="M 0,0 L 0,-22" stroke="var(--plan-metal-2)" strokeWidth="4" strokeLinecap="round"/>
                    <circle cx="0" cy="-22" r="5" fill="var(--plan-metal-3)" stroke="var(--plan-line)" strokeWidth="1"/>
                    <path d="M 0,-22 L 0,-38" stroke="var(--plan-soft)" strokeWidth="3"/>
                    
                    
                    <circle cx="0" cy="-38" r="6" fill="var(--plan-line)" opacity="0.8"/>
                    
                    
                    <path d="M -16,-46 L 16,-46 L 12,-38 L -12,-38 Z" fill="var(--plan-metal-3)" stroke="var(--plan-line)" strokeWidth="1"/>

                    
                    
                    <path d="M -18,-52 C -24,-62 -22,-88 0,-90 C 22,-88 24,-62 18,-52 C 14,-45 -14,-45 -18,-52 Z" 
                          fill="rgba(200, 217, 207, 0.14)" stroke="var(--plan-line)" strokeWidth="1.5" strokeDasharray="4,2"/>
                    
                    
                    
                    <path d="M -11,-62 C -11,-76 11,-76 11,-62 C 11,-55 -11,-55 -11,-62 Z" fill="var(--plan-gums)" opacity="0.75" stroke="var(--plan-gums-dark)" strokeWidth="1"/>
                    <path d="M -8,-64 C -8,-72 8,-72 8,-64 C 8,-60 -8,-60 -8,-64 Z" fill="var(--plan-teeth)" stroke="var(--plan-soft)" strokeWidth="1"/>
                    
                    
                    <line x1="-7" y1="-67" x2="-5" y2="-61" stroke="var(--plan-metal-2)" strokeWidth="0.8"/>
                    <line x1="-3" y1="-70" x2="-2" y2="-60" stroke="var(--plan-metal-2)" strokeWidth="0.8"/>
                    <line x1="0" y1="-71" x2="0" y2="-60" stroke="var(--plan-metal-2)" strokeWidth="0.8"/>
                    <line x1="3" y1="-70" x2="2" y2="-60" stroke="var(--plan-metal-2)" strokeWidth="0.8"/>
                    <line x1="7" y1="-67" x2="5" y2="-61" stroke="var(--plan-metal-2)" strokeWidth="0.8"/>

                    
                    <path d="M -14,-50 C -20,-58 -16,-72 -14,-75" fill="none" stroke="var(--plan-accent)" strokeWidth="1.2" opacity="0.8"/>
                    <path d="M 14,-50 C 20,-58 16,-72 14,-75" fill="none" stroke="var(--plan-accent)" strokeWidth="1.2" opacity="0.8"/>
                </g>

                
                <g id="dental-stool">
                    
                    <path d="M 0,0 L 0,-24 M 0,0 L 22.8,-7.4 M 0,0 L 14.1,19.4 M 0,0 L -14.1,19.4 M 0,0 L -22.8,-7.4" stroke="var(--plan-metal)" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="0" cy="-24" r="3" fill="var(--plan-line)"/>
                    <circle cx="22.8" cy="-7.4" r="3" fill="var(--plan-line)"/>
                    <circle cx="14.1" cy="19.4" r="3" fill="var(--plan-line)"/>
                    <circle cx="-14.1" cy="19.4" r="3" fill="var(--plan-line)"/>
                    <circle cx="-22.8" cy="-7.4" r="3" fill="var(--plan-line)"/>
                    
                    <circle cx="0" cy="0" r="16" fill="var(--plan-fill-2)" stroke="var(--plan-line)" strokeWidth="2"/>
                    <circle cx="0" cy="0" r="12" fill="none" stroke="var(--plan-line)" strokeWidth="1" strokeDasharray="2,2"/>
                </g>

                
                <g id="task-lamp">
                    <circle cx="0" cy="0" r="5" fill="var(--plan-metal)" stroke="var(--plan-line)" strokeWidth="1"/>
                    <path d="M 0,0 L 12,-15 L 28,-12" fill="none" stroke="var(--plan-metal-2)" strokeWidth="2" strokeLinecap="round"/>
                    
                    <path d="M 24,-20 L 36,-14 L 30,-4 L 18,-10 Z" fill="var(--plan-line)" opacity="0.8" stroke="var(--plan-fill-2)" strokeWidth="1"/>
                    
                    <polygon points="30,-14 90,-45 80,15" fill="url(#lamp-beam)" className="lamp-light-beam" opacity="0.35"/>
                </g>

                
                <linearGradient id="lamp-beam" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--plan-line)" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="var(--plan-line)" stopOpacity="0"/>
                </linearGradient>

                
                <g id="demo-chair">
                    <rect x="-14" y="-14" width="28" height="28" rx="4" fill="var(--plan-fill-2)" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <path d="M -12,10 L 12,10" stroke="var(--plan-accent)" strokeWidth="3" strokeLinecap="round"/>
                </g>
            </defs>

            
            <g id="grid-subdivision">
                
                <rect x="200" y="150" width="1200" height="800" fill="none" stroke="var(--plan-line)" strokeWidth="0.5" opacity="0.2"/>
            </g>

            
            <g id="floor-tiles" opacity="0.15">
                
                <path d="
                    M 200,250 L 1400,250 M 200,350 L 1400,350 M 200,450 L 1400,450 M 200,550 L 1400,550 
                    M 200,650 L 1400,650 M 200,750 L 1400,750 M 200,850 L 1400,850 
                    M 300,150 L 300,950 M 400,150 L 400,950 M 500,150 L 500,950 M 600,150 L 600,950 
                    M 700,150 L 700,950 M 800,150 L 800,950 M 900,150 L 900,950 M 1000,150 L 1000,950 
                    M 1100,150 L 1100,950 M 1200,150 L 1200,950 M 1300,150 L 1300,950
                " stroke="var(--plan-line)" strokeWidth="1"/>
            </g>

            
            <g id="architectural-walls" className="glow-element">
                
                
                
                
                
                <path d="
                    M 176,126 L 1424,126 L 1424,974 L 176,974 Z
                    M 200,150 L 200,950 L 1400,950 L 1400,150 Z
                " fill="url(#wall-hatch)" className="wall-hatch-target" fillRule="evenodd"/>

                
                <rect x="176" y="126" width="1248" height="848" fill="none" stroke="var(--plan-line)" strokeWidth="3" className="blueprint-stroke"/>
                <rect x="200" y="150" width="1200" height="800" fill="none" stroke="var(--plan-line)" strokeWidth="2" className="blueprint-stroke"/>

                
                
                
                
                <rect x="170" y="320" width="36" height="260" fill="var(--plan-bg)" className="window-cutout-bg"/>
                
                <rect x="176" y="320" width="24" height="260" fill="none" stroke="var(--plan-line)" strokeWidth="2"/>
                <line x1="188" y1="320" x2="188" y2="580" stroke="var(--plan-line)" strokeWidth="1.5"/>
                <line x1="176" y1="385" x2="200" y2="385" stroke="var(--plan-line)" strokeWidth="1.5"/>
                <line x1="176" y1="450" x2="200" y2="450" stroke="var(--plan-line)" strokeWidth="1.5"/>
                <line x1="176" y1="515" x2="200" y2="515" stroke="var(--plan-line)" strokeWidth="1.5"/>

                
                
                <rect x="1390" y="800" width="36" height="110" fill="var(--plan-bg)" className="door-cutout-bg"/>
                <line x1="1400" y1="800" x2="1400" y2="910" stroke="var(--plan-bg)" strokeWidth="4" className="door-cutout-line"/>
                
                <line x1="1400" y1="800" x2="1300" y2="800" stroke="var(--plan-line)" strokeWidth="3" strokeLinecap="round"/>
                
                <path d="M 1300,800 A 100,100 0 0,0 1400,900" fill="none" stroke="var(--plan-line)" strokeWidth="1.5" strokeDasharray="4,4"/>
                
                <rect x="1394" y="794" width="12" height="8" fill="var(--plan-line)"/>
                <rect x="1394" y="904" width="12" height="8" fill="var(--plan-line)"/>
            </g>

            
            
            <g id="perimeter-counters">
                
                
                <path d="M 200,150 L 1400,150 L 1400,220 L 270,220 L 270,950 L 200,950 Z" 
                      fill="rgba(127, 195, 188, 0.1)" stroke="var(--plan-line)" strokeWidth="2" className="counter-fill"/>
                
                
                <path d="M 450,880 L 1250,880 L 1250,950 L 450,950 Z" 
                      fill="rgba(127, 195, 188, 0.1)" stroke="var(--plan-line)" strokeWidth="2" className="counter-fill"/>

                
                <path d="M 200,215 L 1395,215" stroke="var(--plan-line)" strokeWidth="1" opacity="0.6"/>
                <path d="M 265,220 L 265,950" stroke="var(--plan-line)" strokeWidth="1" opacity="0.6"/>
                <path d="M 450,885 L 1250,885" stroke="var(--plan-line)" strokeWidth="1" opacity="0.6"/>

                
                <g id="corner-sink" transform="translate(210, 160)">
                    <rect x="0" y="0" width="45" height="45" rx="6" fill="var(--plan-fill)" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <rect x="5" y="5" width="35" height="35" rx="4" fill="none" stroke="var(--plan-line)" strokeWidth="1"/>
                    <circle cx="22.5" cy="22.5" r="4" fill="var(--plan-line)"/>
                    
                    <path d="M 22.5,5 L 22.5,14" stroke="var(--plan-metal-2)" strokeWidth="3" strokeLinecap="round"/>
                </g>
            </g>

            
            
            <g id="central-table" transform="translate(520, 420)">
                
                <rect x="10" y="10" width="480" height="220" rx="8" fill="#000000" opacity="0.3"/>
                
                <rect x="0" y="0" width="480" height="220" rx="6" fill="rgba(180, 83, 9, 0.25)" stroke="var(--plan-accent)" strokeWidth="2.5"/>
                
                <rect x="0" y="0" width="480" height="220" rx="6" fill="url(#wood-pattern)"/>
                
                <rect x="8" y="8" width="464" height="204" rx="4" fill="none" stroke="var(--plan-accent)" strokeWidth="1" opacity="0.5"/>
                
                <rect x="160" y="95" width="50" height="30" rx="3" fill="var(--plan-fill)" stroke="var(--plan-accent)" strokeWidth="1"/>
                <rect x="270" y="95" width="50" height="30" rx="3" fill="var(--plan-fill)" stroke="var(--plan-accent)" strokeWidth="1"/>
            </g>

            
            <g id="central-chairs">
                
                <use href="#demo-chair" x="580" y="380" transform="rotate(180 580 380)"/>
                <use href="#demo-chair" x="680" y="380" transform="rotate(180 680 380)"/>
                <use href="#demo-chair" x="780" y="380" transform="rotate(180 780 380)"/>
                <use href="#demo-chair" x="880" y="380" transform="rotate(180 880 380)"/>
                <use href="#demo-chair" x="930" y="380" transform="rotate(180 930 380)"/>

                
                <use href="#demo-chair" x="580" y="680"/>
                <use href="#demo-chair" x="680" y="680"/>
                <use href="#demo-chair" x="780" y="680"/>
                <use href="#demo-chair" x="880" y="680"/>
                <use href="#demo-chair" x="930" y="680"/>

                
                <use href="#demo-chair" x="480" y="530" transform="rotate(90 480 530)"/>
                <use href="#demo-chair" x="1030" y="530" transform="rotate(-90 1030 530)"/>
            </g>

            
            
            <g id="dental-workstations">
                
                
                
                <g id="station-ph-01" data-station-id="PH-01" data-resource-key="phantom-head-ph-01" data-zone="top-counter" data-head-x="360" data-head-y="287" className="plan-station" transform="translate(360, 220) rotate(180)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-02" data-station-id="PH-02" data-resource-key="phantom-head-ph-02" data-zone="top-counter" data-head-x="520" data-head-y="287" className="plan-station" transform="translate(520, 220) rotate(180)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-03" data-station-id="PH-03" data-resource-key="phantom-head-ph-03" data-zone="top-counter" data-head-x="680" data-head-y="287" className="plan-station" transform="translate(680, 220) rotate(180)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-04" data-station-id="PH-04" data-resource-key="phantom-head-ph-04" data-zone="top-counter" data-head-x="840" data-head-y="287" className="plan-station" transform="translate(840, 220) rotate(180)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-05" data-station-id="PH-05" data-resource-key="phantom-head-ph-05" data-zone="top-counter" data-head-x="1000" data-head-y="287" className="plan-station" transform="translate(1000, 220) rotate(180)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-06" data-station-id="PH-06" data-resource-key="phantom-head-ph-06" data-zone="top-counter" data-head-x="1160" data-head-y="287" className="plan-station" transform="translate(1160, 220) rotate(180)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-07" data-station-id="PH-07" data-resource-key="phantom-head-ph-07" data-zone="top-counter" data-head-x="1320" data-head-y="287" className="plan-station" transform="translate(1320, 220) rotate(180)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>

                
                
                <g id="station-ph-08" data-station-id="PH-08" data-resource-key="phantom-head-ph-08" data-zone="left-wall" data-head-x="337" data-head-y="340" className="plan-station" transform="translate(270, 340) rotate(90)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-09" data-station-id="PH-09" data-resource-key="phantom-head-ph-09" data-zone="left-wall" data-head-x="337" data-head-y="620" className="plan-station" transform="translate(270, 620) rotate(90)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-10" data-station-id="PH-10" data-resource-key="phantom-head-ph-10" data-zone="left-wall" data-head-x="337" data-head-y="760" className="plan-station" transform="translate(270, 760) rotate(90)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>

                
                
                <g id="station-ph-11" data-station-id="PH-11" data-resource-key="phantom-head-ph-11" data-zone="bottom-counter" data-head-x="540" data-head-y="813" className="plan-station" transform="translate(540, 880) rotate(0)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
                
                <g id="station-ph-12" data-station-id="PH-12" data-resource-key="phantom-head-ph-12" data-zone="bottom-counter" data-head-x="700" data-head-y="813" className="plan-station" transform="translate(700, 880) rotate(0)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>

                
                <g id="station-ph-13" data-station-id="PH-13" data-resource-key="phantom-head-ph-13" data-zone="bottom-counter" data-head-x="860" data-head-y="813" className="plan-station" transform="translate(860, 880) rotate(0)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>

                
                <g id="station-ph-14" data-station-id="PH-14" data-resource-key="phantom-head-ph-14" data-zone="bottom-counter" data-head-x="1020" data-head-y="813" className="plan-station" transform="translate(1020, 880) rotate(0)">
                    <use href="#phantom-head-unit"/>
                    <use href="#task-lamp" x="-35" y="-10"/>
                    <use href="#dental-stool" x="0" y="-110"/>
                </g>
            </g>

            
            
            <g id="wall-equipment">
                
                <g transform="translate(720, 136)">
                    
                    <rect x="0" y="0" width="160" height="14" rx="2" fill="var(--plan-fill-2)" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <rect x="10" y="3" width="140" height="8" rx="1" fill="var(--plan-line)" opacity="0.8"/>
                    
                    <path d="M 0,14 L -20,40 M 160,14 L 180,40" stroke="var(--plan-line)" strokeWidth="1" strokeDasharray="2,2" opacity="0.4"/>
                </g>

                
                <g transform="translate(1120, 136)">
                    <rect x="0" y="0" width="110" height="14" rx="2" fill="var(--plan-fill-2)" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <rect x="8" y="3" width="94" height="8" rx="1" fill="var(--plan-line)" opacity="0.8"/>
                </g>

                
                <g transform="translate(420, 132)">
                    <rect x="0" y="0" width="120" height="18" rx="3" fill="var(--plan-soft)" stroke="var(--plan-fill-2)" strokeWidth="1.5"/>
                    <line x1="10" y1="14" x2="110" y2="14" stroke="var(--plan-metal)" strokeWidth="2"/>
                    
                    <line x1="15" y1="6" x2="45" y2="6" stroke="var(--plan-metal-2)" strokeWidth="1"/>
                    
                    <circle cx="105" cy="6" r="1.5" fill="var(--plan-accent)"/>
                </g>

                
                
                <g transform="translate(200, 680) rotate(90)">
                    <rect x="0" y="0" width="70" height="8" fill="var(--plan-fill)" stroke="var(--plan-line)" strokeWidth="1"/>
                </g>
                
                <g transform="translate(600, 138)">
                    <rect x="0" y="0" width="60" height="8" fill="var(--plan-fill)" stroke="var(--plan-line)" strokeWidth="1"/>
                </g>
            </g>

            
            <g id="dimension-lines" opacity="0.5">
                
                <g transform="translate(200, 80)">
                    <line x1="0" y1="0" x2="1200" y2="0" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <line x1="0" y1="-10" x2="0" y2="10" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <line x1="1200" y1="-10" x2="1200" y2="10" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    
                    <path d="M -5,5 L 5,-5 M 1195,5 L 1205,-5" stroke="var(--plan-line)" strokeWidth="2"/>
                    
                    <circle cx="600" cy="0" r="8" fill="var(--plan-bg)" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <path d="M 595,0 L 605,0 M 600,-5 L 600,5" stroke="var(--plan-line)" strokeWidth="1"/>
                </g>

                
                <g transform="translate(100, 150)">
                    <line x1="0" y1="0" x2="0" y2="800" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <line x1="-10" y1="0" x2="10" y2="0" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <line x1="-10" y1="800" x2="10" y2="800" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    
                    <path d="M -5,-5 L 5,5 M -5,795 L 5,805" stroke="var(--plan-line)" strokeWidth="2"/>
                    
                    <circle cx="0" cy="400" r="8" fill="var(--plan-bg)" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    <path d="M -5,400 L 5,400 M 0,395 L 0,405" stroke="var(--plan-line)" strokeWidth="1"/>
                </g>

                
                <g transform="translate(1330, 870)">
                    <circle cx="0" cy="0" r="32" fill="rgba(15, 23, 42, 0.6)" stroke="var(--plan-line)" strokeWidth="1.5"/>
                    
                    <polygon points="0,-26 8,0 0,-4" fill="var(--plan-line)"/>
                    <polygon points="0,-26 -8,0 0,-4" fill="var(--plan-fill-2)"/>
                    
                    <polygon points="0,26 8,0 0,4" fill="var(--plan-metal)"/>
                    <polygon points="0,26 -8,0 0,4" fill="var(--plan-metal-3)"/>
                    <circle cx="0" cy="0" r="3" fill="var(--plan-line)"/>
                </g>
            </g>
        
    </svg>
  )
}
