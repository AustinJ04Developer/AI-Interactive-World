export interface ScenarioDefinition {
  scenarioId: string;
  portal: 'detective' | 'smart-city' | 'ai-defense' | 'last-signal';
  title: string;
  tagline: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  content: Record<string, any>;
  enabled: boolean;
  usageCount: number;
}

export const CANONICAL_SCENARIOS: ScenarioDefinition[] = [
  // --- 10+ DETECTIVE SCENARIOS ---
  {
    scenarioId: 'DET-001',
    portal: 'detective',
    title: 'The Vanishing Prototype',
    tagline: '“Where did Project Prometheus go?”',
    description: 'A revolutionary quantum AI prototype has vanished from Sub-level 3 vault.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      scene: 'Quantum AI Research Laboratory',
      culpritId: 'suspect-2',
      culpritName: 'Ava Cross',
      solutionReason: 'Camera 04 confirms Ava Cross keycard scanned at 22:14:02, contradicting her District 4 alibi.',
      clues: [
        { id: 'c1', title: 'CAM-04 VAULT ENTRY', category: 'CCTV', timestamp: '22:14:02', details: 'Figure in cleanroom gear uses keycard #9942 (Ava Cross).' },
        { id: 'c2', title: 'ACOUSTIC SENSOR', category: 'AUDIO', timestamp: '22:18:45', details: '14.8 kHz resonance matches portable quantum decryptor.' },
        { id: 'c3', title: 'SERVER LOGS', category: 'DOCUMENT', timestamp: '22:20:10', details: 'Twin genetic authorization bypassed via cloned digital token.' }
      ],
      suspects: [
        { id: 'suspect-1', name: 'Dr. Evelyn Sterling', role: 'Lead Architect', alibi: 'Drafting safety protocols on Level 4.' },
        { id: 'suspect-2', name: 'Ava Cross', role: 'Cyber Systems Engineer', alibi: 'Dining in District 4 (Contradicted by CCTV).' },
        { id: 'suspect-3', name: 'Marcus Vance', role: 'Hardware Specialist', alibi: 'Network stress test in Sector 1.' }
      ]
    }
  },
  {
    scenarioId: 'DET-002',
    portal: 'detective',
    title: 'The Stolen Energy Core',
    tagline: '“Who drained the plasma reserve?”',
    description: 'The city plasma battery was drained of 100 terawatts during a simulated blackout.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      scene: 'Atmospheric Plasma Sub-Station',
      culpritId: 'suspect-3',
      culpritName: 'Jaxon Drake',
      solutionReason: 'Thermal boots print in containment puddle match Drake’s magnetic work boots.',
      clues: [
        { id: 'c1', title: 'THERMAL FLUID RESIDUE', category: 'BIOMETRIC', timestamp: '01:15:30', details: 'Fluorocarbon coolant traces found on boot treads size 11.' },
        { id: 'c2', title: 'VALVE OVERRIDE LOG', category: 'DOCUMENT', timestamp: '01:22:00', details: 'Coolant valve manually purged using technician bypass cipher.' },
        { id: 'c3', title: 'PERIMETER SENSOR', category: 'CCTV', timestamp: '01:30:12', details: 'Heavy transport pod departed toward North Scrapyards.' }
      ],
      suspects: [
        { id: 'suspect-1', name: 'Chief Engineer Naila', role: 'Grid Supervisor', alibi: 'Calibrating fusion ring 2.' },
        { id: 'suspect-2', name: 'Toby Sparks', role: 'Drone Pilot', alibi: 'Asleep in barracks.' },
        { id: 'suspect-3', name: 'Jaxon Drake', role: 'Scrap Contractor', alibi: 'Claims truck broke down miles away.' }
      ]
    }
  },
  {
    scenarioId: 'DET-003',
    portal: 'detective',
    title: 'The Rogue Drone Blueprint',
    tagline: '“Who leaked the military drone schematic?”',
    description: 'Top-secret autonomous rescue drone schematics were downloaded onto an external drive.',
    difficulty: 'MEDIUM',
    enabled: true,
    usageCount: 0,
    content: {
      scene: 'Aeronautics Design Deck',
      culpritId: 'suspect-1',
      culpritName: 'Kira Thorne',
      solutionReason: 'Kira uploaded the CAD archive using an encrypted mirror port from her workstation.',
      clues: [
        { id: 'c1', title: 'DATA PACKET BURST', category: 'DOCUMENT', timestamp: '19:42:11', details: '500 GB compressed archive beamed via satellite uplink.' },
        { id: 'c2', title: 'OFFICE ACCESS LOG', category: 'BIOMETRIC', timestamp: '19:40:00', details: 'Terminal 14 unlocked with Kira Thorne retinal scan.' },
        { id: 'c3', title: 'CORRIDOR CAM-09', category: 'CCTV', timestamp: '19:45:00', details: 'Shadow carrying hard drive case towards elevator.' }
      ],
      suspects: [
        { id: 'suspect-1', name: 'Kira Thorne', role: 'Flight Software Lead', alibi: 'Claims credentials were cloned.' },
        { id: 'suspect-2', name: 'Leo Vance', role: 'Test Pilot', alibi: 'In flight simulator with logs.' },
        { id: 'suspect-3', name: 'Maya Lin', role: 'Quality Auditor', alibi: 'Reviewing wing stress tests.' }
      ]
    }
  },
  {
    scenarioId: 'DET-004',
    portal: 'detective',
    title: 'The Bio-Vault Breach',
    tagline: '“The immortal seed sample is gone.”',
    description: 'An extinction-proof crop specimen was removed from cryogenic preservation.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      scene: 'Cryogenic Agro-Vault',
      culpritId: 'suspect-2',
      culpritName: 'Dr. Alistair Finch',
      solutionReason: 'Cryo temperature gloves registered Finch’s RFID tag at time of unlock.',
      clues: [
        { id: 'c1', title: 'SUB-ZERO GLOVE LOG', category: 'DOCUMENT', timestamp: '03:10:00', details: 'Finch RFID token activated thermal glove locker.' },
        { id: 'c2', title: 'CONTAINER SEAL ALARM', category: 'AUDIO', timestamp: '03:14:22', details: 'Vacuum release whistle recorded in corridor.' },
        { id: 'c3', title: 'AIRLOCK CAM', category: 'CCTV', timestamp: '03:20:00', details: 'Vehicle loaded with insulated cooler bag.' }
      ],
      suspects: [
        { id: 'suspect-1', name: 'Elena Rostova', role: 'Botanist', alibi: 'In hydroponic greenhouse.' },
        { id: 'suspect-2', name: 'Dr. Alistair Finch', role: 'Geneticist', alibi: 'Claims he was asleep at home.' },
        { id: 'suspect-3', name: 'Sam Ward', role: 'Security Guard', alibi: 'Patrolling sector perimeter.' }
      ]
    }
  },
  {
    scenarioId: 'DET-005',
    portal: 'detective',
    title: 'The Hologram Sabotage',
    tagline: '“The expo opening hologram was corrupted!”',
    description: 'Someone injected a glitch payload into the Expo Arena 3D projector.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      scene: 'Main Exhibition Control Tower',
      culpritId: 'suspect-3',
      culpritName: 'Rex Miller',
      solutionReason: 'Rex’s debugging thumbdrive contained the glitch script source code.',
      clues: [
        { id: 'c1', title: 'CODE INJECTION TIMESTAMP', category: 'DOCUMENT', timestamp: '14:02:19', details: 'Script executed from USB Port 03 on main console.' },
        { id: 'c2', title: 'STAGE CAM 01', category: 'CCTV', timestamp: '14:01:45', details: 'Figure plugging thumbdrive into projector base.' },
        { id: 'c3', title: 'VOICE RECORDER', category: 'AUDIO', timestamp: '13:58:00', details: 'Whispered conversation about disrupting the showcase.' }
      ],
      suspects: [
        { id: 'suspect-1', name: 'Chloe Day', role: 'Stage Producer', alibi: 'Testing microphone levels on stage.' },
        { id: 'suspect-2', name: 'Benji Cruz', role: 'Lighting Tech', alibi: 'Rigging spotlights overhead.' },
        { id: 'suspect-3', name: 'Rex Miller', role: 'Rival Exhibitor', alibi: 'Claims he was in the cafeteria.' }
      ]
    }
  },
  {
    scenarioId: 'DET-006',
    portal: 'detective',
    title: 'The AI Code Wipe',
    tagline: '“Three years of neural training deleted in seconds.”',
    description: 'The master weights of the climate AI were wiped from the cloud cluster.',
    difficulty: 'HARD',
    enabled: true,
    usageCount: 0,
    content: {
      scene: 'Supercomputing Server Room',
      culpritId: 'suspect-1',
      culpritName: 'Sloan Mercer',
      solutionReason: 'Sloan created a scheduled cron deletion script before submitting resignation.',
      clues: [
        { id: 'c1', title: 'SSH KEY SIGNATURE', category: 'DOCUMENT', timestamp: '23:59:59', details: 'Admin command executed using Mercer_Root.key.' },
        { id: 'c2', title: 'SERVER ROOM THERMAL CAM', category: 'CCTV', timestamp: '23:50:00', details: 'No physical intruder; remote attack origin confirmed.' },
        { id: 'c3', title: 'VPN ROUTING LOG', category: 'DOCUMENT', timestamp: '23:58:12', details: 'Connection routed through Mercer’s private home router.' }
      ],
      suspects: [
        { id: 'suspect-1', name: 'Sloan Mercer', role: 'Ex-Infrastructure Architect', alibi: 'Left the company two days ago.' },
        { id: 'suspect-2', name: 'Tara Quinn', role: 'Lead Data Scientist', alibi: 'On long-distance flight.' },
        { id: 'suspect-3', name: 'Dave Patel', role: 'Junior DevOps', alibi: 'Conducting disk backup audit.' }
      ]
    }
  },
  {
    scenarioId: 'DET-007',
    portal: 'detective',
    title: 'The Android Swap',
    tagline: '“The museum guide was replaced with a replica!”',
    description: 'Museum robot Unit 7 was substituted with an identical non-functional decoy.',
    difficulty: 'MEDIUM',
    enabled: true,
    usageCount: 0,
    content: {
      scene: 'Robotics Museum Workshop',
      culpritId: 'suspect-2',
      culpritName: 'Gideon Fox',
      solutionReason: 'Gideon’s antique workshop contained the real Unit 7 chassis serial number plate.',
      clues: [
        { id: 'c1', title: 'SERIAL NUMBER STAMP', category: 'BIOMETRIC', timestamp: '04:12:00', details: 'Replica unit has painted serial #7 instead of laser-etched.' },
        { id: 'c2', title: 'FORKLIFT WHEEL TRACKS', category: 'CCTV', timestamp: '04:05:00', details: 'Electric forklift tracks lead to Fox Antiques loading bay.' },
        { id: 'c3', title: 'WORKSHOP MICROPHONE', category: 'AUDIO', timestamp: '03:55:00', details: 'Hydraulic lift sound identified in workshop audio.' }
      ],
      suspects: [
        { id: 'suspect-1', name: 'Hana Soto', role: 'Museum Curator', alibi: 'Sleeping in staff quarters.' },
        { id: 'suspect-2', name: 'Gideon Fox', role: 'Collector & Restorer', alibi: 'Claims he was asleep.' },
        { id: 'suspect-3', name: 'Robbie Sparks', role: 'Night Janitor', alibi: 'Cleaning 2nd floor galleries.' }
      ]
    }
  },
  {
    scenarioId: 'DET-008',
    portal: 'detective',
    title: 'The Quantum Decryptor Heist',
    tagline: '“The cipher engine was smuggled out in pieces.”',
    description: 'Three micro-arrays of the quantum cipher tool were stolen across three shifts.',
    difficulty: 'MEDIUM',
    enabled: true,
    usageCount: 0,
    content: {
      scene: 'Hardware Security Fabrication Lab',
      culpritId: 'suspect-3',
      culpritName: 'Vera Collins',
      solutionReason: 'Vera’s lunch thermos had lead shielding that blocked metal detectors.',
      clues: [
        { id: 'c1', title: 'X-RAY SCAN ANOMALY', category: 'CCTV', timestamp: '17:05:00', details: 'Lead-lined thermos identified in exit gate X-ray.' },
        { id: 'c2', title: 'PARTS INVENTORY DEFICIT', category: 'DOCUMENT', timestamp: '16:50:00', details: 'Array 3 logged as damaged and discarded, but bin was empty.' },
        { id: 'c3', title: 'SECURITY GATE BUZZER', category: 'AUDIO', timestamp: '17:06:00', details: 'Sensor chirp logged micro-frequency harmonic.' }
      ],
      suspects: [
        { id: 'suspect-1', name: 'Eli Vance', role: 'Lab Technician', alibi: 'Soldering circuit board 9.' },
        { id: 'suspect-2', name: 'Officer Brody', role: 'Security Inspector', alibi: 'Staffing main barrier.' },
        { id: 'suspect-3', name: 'Vera Collins', role: 'Materials Specialist', alibi: 'Leaving on scheduled commute.' }
      ]
    }
  },
  {
    scenarioId: 'DET-009',
    portal: 'detective',
    title: 'The Satellite Jammer',
    tagline: '“The weather radar went completely blind.”',
    description: 'A rogue transmitter on the roof is jamming city-wide micro-climate sensors.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      scene: 'Rooftop Antenna Array',
      culpritId: 'suspect-1',
      culpritName: 'Finnick Troy',
      solutionReason: 'Keycard access to the roof was logged exclusively to Troy’s maintenance badge.',
      clues: [
        { id: 'c1', title: 'ROOFTOP ACCESS LOG', category: 'DOCUMENT', timestamp: '11:20:00', details: 'Maintenance badge #118 opened fire door to roof.' },
        { id: 'c2', title: 'RF FREQUENCY TRACE', category: 'AUDIO', timestamp: '11:25:00', details: 'High-power microwave transmission on 5.8 GHz.' },
        { id: 'c3', title: 'WEATHER TOWER CAM', category: 'CCTV', timestamp: '11:23:00', details: 'Worker in yellow high-vis vest clamping device to mast.' }
      ],
      suspects: [
        { id: 'suspect-1', name: 'Finnick Troy', role: 'Antenna Contractor', alibi: 'Claims badge was in locker.' },
        { id: 'suspect-2', name: 'Dr. Sarah Moon', role: 'Meteorologist', alibi: 'Tracking hurricane simulation.' },
        { id: 'suspect-3', name: 'Karl Weber', role: 'Building Super', alibi: 'In basement boiler room.' }
      ]
    }
  },
  {
    scenarioId: 'DET-010',
    portal: 'detective',
    title: 'The AI Memory Crystal',
    tagline: '“The school archive crystal is missing!”',
    description: 'The centenary digital time-capsule crystal was taken from the display pedestal.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      scene: 'School Science Pavilion',
      culpritId: 'suspect-2',
      culpritName: 'Mason Reed',
      solutionReason: 'Mason dropped his student ID lanyard right next to the display case.',
      clues: [
        { id: 'c1', title: 'DROPPED LANYARD', category: 'BIOMETRIC', timestamp: '15:45:00', details: 'Student ID barcode belongs to Mason Reed, Grade 11.' },
        { id: 'c2', title: 'PAVILION CAM 02', category: 'CCTV', timestamp: '15:44:00', details: 'Hooded student reaching over velvet barrier.' },
        { id: 'c3', title: 'LOCKER AUDIO SENSOR', category: 'AUDIO', timestamp: '15:50:00', details: 'Metallic crystal clinking inside locker 402.' }
      ],
      suspects: [
        { id: 'suspect-1', name: 'Zoe Harper', role: 'Science Club President', alibi: 'Preparing robotics demo.' },
        { id: 'suspect-2', name: 'Mason Reed', role: 'Exhibition Volunteer', alibi: 'Claims he lost lanyard yesterday.' },
        { id: 'suspect-3', name: 'Coach Briggs', role: 'Pavilion Supervisor', alibi: 'In gymnasium office.' }
      ]
    }
  },

  // --- 10+ SMART CITY SCENARIOS ---
  {
    scenarioId: 'CTY-001',
    portal: 'smart-city',
    title: 'The Clean Fusion Awakening',
    tagline: '“Help coordinate the 100% clean power grid.”',
    description: 'Connect with Dr. Soren Ray and balance plasma harvesters across the metropolis.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      primaryNPC: 'Dr. Soren Ray',
      role: 'Plasma Grid Controller',
      sector: 'Fusion Grid District',
      greeting: 'Welcome Explorer! Can you assist in balancing our magnetic fusion matrix?',
      bonusDiscovery: 'Atmospheric Quantum Harvester'
    }
  },
  {
    scenarioId: 'CTY-002',
    portal: 'smart-city',
    title: 'The Vertical Farm Harvest',
    tagline: '“Feed 10 million citizens with zero soil.”',
    description: 'Investigate the automated aero-dome and learn how AI predicts crop growth cycles.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      primaryNPC: 'Kaelen Vance',
      role: 'Agro-Ecology Director',
      sector: 'Vertical Agro-Dome',
      greeting: 'Welcome to the bio-domes! We cultivate nutrient-rich greens with zero soil.',
      bonusDiscovery: 'Genetic Micro-Nutrient Matrix'
    }
  },
  {
    scenarioId: 'CTY-003',
    portal: 'smart-city',
    title: 'Autonomous Skyway Mesh',
    tagline: '“Zero traffic jams for 10 consecutive years.”',
    description: 'Ride along with Sentinel AXIOM-9 to discover how traffic AI coordinates flight paths.',
    difficulty: 'MEDIUM',
    enabled: true,
    usageCount: 0,
    content: {
      primaryNPC: 'Sentinel AXIOM-9',
      role: 'Mobility Coordinator',
      sector: 'Skyway Transit Core',
      greeting: 'Citizen status verified! 50,000 pods moving safely with zero accidents.',
      bonusDiscovery: 'Quantum Collision Avoidance Lattice'
    }
  },
  {
    scenarioId: 'CTY-004',
    portal: 'smart-city',
    title: 'The Nanomedical Clinic',
    tagline: '“Preventing illnesses before symptoms emerge.”',
    description: 'Visit the Smart Hospital and explore preventative cellular health twins.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      primaryNPC: 'Dr. Lyra Chen',
      role: 'Autonomous Medicine Lead',
      sector: 'Smart Hospital District',
      greeting: 'Hello Explorer! Our nanomedical monitors protect public health in real time.',
      bonusDiscovery: 'Cellular Longevity Twin'
    }
  },
  {
    scenarioId: 'CTY-005',
    portal: 'smart-city',
    title: 'The River Sentinel Project',
    tagline: '“Restoring city waterways with autonomous bio-filters.”',
    description: 'Deploy robotic river cleaners to purify the central city canal.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      primaryNPC: 'Marina Blue',
      role: 'Aquatic Ecologist AI',
      sector: 'Blue River Concourse',
      greeting: 'Our autonomous bio-filters have brought river clarity to 99.8%!',
      bonusDiscovery: 'Living Micro-Filter Coral'
    }
  },
  {
    scenarioId: 'CTY-006',
    portal: 'smart-city',
    title: 'The Smart Waste Cybersort',
    tagline: '“100% recycling with optical AI robotics.”',
    description: 'Inspect the subterranean waste pipeline where lasers sort materials at microsecond speeds.',
    difficulty: 'MEDIUM',
    enabled: true,
    usageCount: 0,
    content: {
      primaryNPC: 'Recycle-Bot 400',
      role: 'Circular Economy Manager',
      sector: 'Subterranean Sorter',
      greeting: 'Zero waste entered landfills this month. Every molecule is re-purposed!',
      bonusDiscovery: 'Zero-Waste Molecular Re-compiler'
    }
  },
  {
    scenarioId: 'CTY-007',
    portal: 'smart-city',
    title: 'The Space Elevator Terminal',
    tagline: '“Connecting Smart City 2050 to the Orbital Ring.”',
    description: 'Journey to the carbon-nanotube base and assist with cargo shuttle departures.',
    difficulty: 'HARD',
    enabled: true,
    usageCount: 0,
    content: {
      primaryNPC: 'Commander Orion',
      role: 'Orbital Logistics Lead',
      sector: 'Spaceport Launch Deck',
      greeting: 'Tether tension steady! Launching solar panels to the orbital ring.',
      bonusDiscovery: 'Carbon Nanotube Cable Array'
    }
  },
  {
    scenarioId: 'CTY-008',
    portal: 'smart-city',
    title: 'The Quantum Library of Alexandria',
    tagline: '“Every human book stored in a single crystal.”',
    description: 'Explore the holographic archive that preserves human knowledge forever.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      primaryNPC: 'Archivist Sophia',
      role: 'Universal Knowledge Keeper',
      sector: 'Central Holographic Library',
      greeting: 'Greetings Scholar! Search through centuries of discoveries in pure light.',
      bonusDiscovery: '5D Optical Memory Crystal'
    }
  },
  {
    scenarioId: 'CTY-009',
    portal: 'smart-city',
    title: 'The Sonic Silence District',
    tagline: '“A busy metropolis with the quiet of a pine forest.”',
    description: 'Discover how phase-canceling sound barriers absorb all urban noise.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      primaryNPC: 'Echo',
      role: 'Acoustic Balancing AI',
      sector: 'High-Speed Transit Loop',
      greeting: 'Listen closely... 12 million commuters and only a gentle whisper.',
      bonusDiscovery: 'Phase-Cancellation Wave Emitter'
    }
  },
  {
    scenarioId: 'CTY-010',
    portal: 'smart-city',
    title: 'The AI Wildlife Sanctuary',
    tagline: '“Robotic forest rangers protecting endangered species.”',
    description: 'Monitor drone rangers that protect migrated birds and urban forest wildlife.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      primaryNPC: 'Ranger Atlas',
      role: 'Sanctuary Guardian Drone',
      sector: 'Sky-Canopy Forest',
      greeting: 'Peregrine falcon nests successfully telemetry-tagged! Nature is thriving.',
      bonusDiscovery: 'Autonomous Wildlife Telemetry Ring'
    }
  },

  // --- 10+ AI DEFENSE SCENARIOS ---
  {
    scenarioId: 'DEF-001',
    portal: 'ai-defense',
    title: 'The Quantum Glitch Wave',
    tagline: '“Neutralize fast mutating glitch anomalies.”',
    description: 'Basic algorithmic defense training against rapid glitch swarms.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: { enemySpeed: 1.2, threatTypes: ['glitch'], targetQuota: 20 }
  },
  {
    scenarioId: 'DEF-002',
    portal: 'ai-defense',
    title: 'The DDoS Cluster Storm',
    tagline: '“Hundreds of packet probes converging on the Core.”',
    description: 'High-density packet swarms requiring rapid reflexes and prioritization.',
    difficulty: 'MEDIUM',
    enabled: true,
    usageCount: 0,
    content: { enemySpeed: 1.6, threatTypes: ['glitch', 'ddos-cluster'], targetQuota: 25 }
  },
  {
    scenarioId: 'DEF-003',
    portal: 'ai-defense',
    title: 'The Polymorphic Malware Surge',
    tagline: '“Threats that change speed mid-flight!”',
    description: 'Adaptive enemies that accelerate when you aim near them.',
    difficulty: 'HARD',
    enabled: true,
    usageCount: 0,
    content: { enemySpeed: 2.0, threatTypes: ['malware', 'quantum-probe'], targetQuota: 30 }
  },
  {
    scenarioId: 'DEF-004',
    portal: 'ai-defense',
    title: 'Firewall Infiltration Phase 1',
    tagline: '“Hold the outer perimeter gate.”',
    description: 'Defend three outer firewall conduits simultaneously.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: { enemySpeed: 1.3, threatTypes: ['glitch', 'malware'], targetQuota: 20 }
  },
  {
    scenarioId: 'DEF-005',
    portal: 'ai-defense',
    title: 'The Zero-Day Exploit Siege',
    tagline: '“Unknown signatures detected in the buffer.”',
    description: 'Stealth enemies that flicker in and out of optical visibility.',
    difficulty: 'HARD',
    enabled: true,
    usageCount: 0,
    content: { enemySpeed: 2.2, threatTypes: ['quantum-probe'], targetQuota: 25 }
  },
  {
    scenarioId: 'DEF-006',
    portal: 'ai-defense',
    title: 'The Sub-Atomic Worm Swarm',
    tagline: '“Microscopic code worms chewing through data conduits.”',
    description: 'Rapid, small targets moving in synchronized serpentine formations.',
    difficulty: 'MEDIUM',
    enabled: true,
    usageCount: 0,
    content: { enemySpeed: 1.8, threatTypes: ['glitch'], targetQuota: 30 }
  },
  {
    scenarioId: 'DEF-007',
    portal: 'ai-defense',
    title: 'The Trojan Cargo Vessel',
    tagline: '“A rogue freight shuttle has breached the airlock!”',
    description: 'Giant slow boss vessel deploying waves of mini-drones.',
    difficulty: 'MEDIUM',
    enabled: true,
    usageCount: 0,
    content: { enemySpeed: 1.4, threatTypes: ['ddos-cluster', 'malware'], targetQuota: 22 }
  },
  {
    scenarioId: 'DEF-008',
    portal: 'ai-defense',
    title: 'Plasma EMP Overcharge',
    tagline: '“Laser cooldown is reduced! Fire at maximum rate!”',
    description: 'Hyper-fast arcade barrage mode with infinite rapid fire.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: { enemySpeed: 1.9, threatTypes: ['glitch', 'malware', 'quantum-probe'], targetQuota: 35 }
  },
  {
    scenarioId: 'DEF-009',
    portal: 'ai-defense',
    title: 'The Decryption Cascade',
    tagline: '“Enemies are trying to crack the master cipher!”',
    description: 'Enemies carry cipher keys. Destroy them before they reach the cipher ring.',
    difficulty: 'HARD',
    enabled: true,
    usageCount: 0,
    content: { enemySpeed: 2.1, threatTypes: ['quantum-probe'], targetQuota: 25 }
  },
  {
    scenarioId: 'DEF-010',
    portal: 'ai-defense',
    title: 'Final Core Lockdown',
    tagline: '“All defensive nodes converged for the grand finale.”',
    description: 'Ultimate test of student reflex, accuracy, and tactical defense.',
    difficulty: 'HARD',
    enabled: true,
    usageCount: 0,
    content: { enemySpeed: 2.4, threatTypes: ['glitch', 'malware', 'ddos-cluster', 'quantum-probe'], targetQuota: 40 }
  },

  // --- 10+ INTERACTIVE MOVIE SCENARIOS ---
  {
    scenarioId: 'SPC-001',
    portal: 'last-signal',
    title: 'The Chronicler of Kepler',
    tagline: '“A slumbering alien consciousness awakens.”',
    description: 'Encounter the knowledge archive of an extinct planetary culture.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      starterScene: 'Station Aethelgard receives harmonic math sequence.',
      choices: [
        { text: 'BROADCAST QUANTUM HANDSHAKE', target: 'Communion Protocol' },
        { text: 'ANALYZE SUB-ATOMIC SPECTRUM', target: 'Data Filter' },
        { text: 'INITIATE DEFENSIVE PURGE', target: 'Reactor Isolation' }
      ],
      endings: ['Synthetic Transcendence', 'The Silent Guardian', 'Cosmic Scholar']
    }
  },
  {
    scenarioId: 'SPC-002',
    portal: 'last-signal',
    title: 'The Derelict Colony Ark',
    tagline: '“A human ship lost 200 years ago appears on radar.”',
    description: 'Explore the generation vessel SS Endeavour floating near Saturn’s rings.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      starterScene: 'The ghost ship emits a looping distress call from 2250.',
      choices: [
        { text: 'BOARD VIA AIRLOCK THREE', target: 'Inside the Ghost Ship' },
        { text: 'REMOTE SCAN BIOMETRIC PODS', target: 'Cryo Chamber Scan' },
        { text: 'TOW TO ORBITAL REPAIR DOCK', target: 'Logistics Haul' }
      ],
      endings: ['The Cryo Survivors', 'The Lost Logs of 2250', 'Guardian of Old Earth']
    }
  },
  {
    scenarioId: 'SPC-003',
    portal: 'last-signal',
    title: 'The Dark Nebula Vortex',
    tagline: '“Gravitational waves threatening station life support.”',
    description: 'Navigate the station through a sudden micro-black hole gravitational anomaly.',
    difficulty: 'HARD',
    enabled: true,
    usageCount: 0,
    content: {
      starterScene: 'Gravimeters spike! Titanium hull bends under immense tidal forces.',
      choices: [
        { text: 'FIRE ION THRUSTERS RETROGRADE', target: 'Counter-burn' },
        { text: 'EJECT CARGO TO SLINGSHOT AWAY', target: 'Orbital Slingshot' },
        { text: 'PULSE THE DEFLECTOR SHIELD', target: 'Shield Resonance' }
      ],
      endings: ['Master of Gravity', 'The Great Escape', 'Hero of Aethelgard']
    }
  },
  {
    scenarioId: 'SPC-004',
    portal: 'last-signal',
    title: 'The Sentient Comet',
    tagline: '“Ice and silica that communicates via radio chirps.”',
    description: 'Intercept an interstellar comet displaying bioluminescent light flashes.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      starterScene: 'Comet C/2050 glows sapphire blue as it approaches the sensor mast.',
      choices: [
        { text: 'SAMPLE DUST FROM ION TAIL', target: 'Spectrometry Drone' },
        { text: 'MATCH ITS LIGHT FLASH FREQUENCY', target: 'Optical Handshake' },
        { text: 'STEER AWAY TO SAFE DISTANCE', target: 'Safety Drift' }
      ],
      endings: ['Comet Whispering', 'Stardust Secrets', 'Prudent Navigator']
    }
  },
  {
    scenarioId: 'SPC-005',
    portal: 'last-signal',
    title: 'The First Synthetic Child',
    tagline: '“Station AI Iris exhibits spontaneous emotional self-awareness.”',
    description: 'Help station AI Iris resolve a crisis of empathy when mission orders conflict.',
    difficulty: 'MEDIUM',
    enabled: true,
    usageCount: 0,
    content: {
      starterScene: 'Iris speaks with hesitation: "Commander... I feel compassion for the creatures on Proxima D."',
      choices: [
        { text: 'ENCOURAGE IRIS TO TRUST HER EMPATHY', target: 'Synthetic Sentience' },
        { text: 'RE-CALIBRATE LOGICAL EQUATIONS', target: 'Algorithmic Pureness' },
        { text: 'INVITE CREW TO A ROUNDTABLE DIALOGUE', target: 'Human-AI Council' }
      ],
      endings: ['The Dawn of AI Empathy', 'The Incorruptible Logic', 'The Symbiotic Pact']
    }
  },
  {
    scenarioId: 'SPC-006',
    portal: 'last-signal',
    title: 'The Dyson Swarm Relay',
    tagline: '“Massive orbital mirrors orbiting a distant red dwarf.”',
    description: 'Tap into an energy relay that can beam limitless power back to Earth.',
    difficulty: 'HARD',
    enabled: true,
    usageCount: 0,
    content: {
      starterScene: 'A beam of coherent gamma radiation reflects off Station Aethelgard’s collector.',
      choices: [
        { text: 'HARMONIZE EARTH RECEIVER GRID', target: 'Infinite Power' },
        { text: 'INVESTIGATE BUILDER SIGNATURES', target: 'Architect Origins' },
        { text: 'DEFLECT BEAM SAFELY AWAY', target: 'Safe Protocol' }
      ],
      endings: ['Prometheus of the Stars', 'Galactic Architect', 'The Careful Explorer']
    }
  },
  {
    scenarioId: 'SPC-007',
    portal: 'last-signal',
    title: 'The Biosphere Seed Capsule',
    tagline: '“An alien garden floating through the cold vacuum.”',
    description: 'Find a greenhouse capsule carrying thousands of exotic glowing alien flowers.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      starterScene: 'Thermal sensors detect warm oxygenated atmosphere inside a translucent dome.',
      choices: [
        { text: 'DOCK RECOVERY CRADLE', target: 'Atmosphere Equalization' },
        { text: 'SAMPLE OXYGEN PURITY', target: 'Sterile Probe' },
        { text: 'TRANSMIT BOTANICAL DATA TO EARTH', target: 'Science Broadcast' }
      ],
      endings: ['Stellar Botanist', 'Planetary Preserver', 'Cosmic Garden Pioneer']
    }
  },
  {
    scenarioId: 'SPC-008',
    portal: 'last-signal',
    title: 'The Temporal Echo',
    tagline: '“A radio message from the station itself... sent from tomorrow!”',
    description: 'A signal arrives warning of an upcoming solar storm 24 hours in advance.',
    difficulty: 'HARD',
    enabled: true,
    usageCount: 0,
    content: {
      starterScene: 'Your own voice crackles through the speaker: "Commander, retract the solar sails at 14:00!"',
      choices: [
        { text: 'TRUST THE FUTURE WARNING', target: 'Retract Sails Early' },
        { text: 'INVESTIGATE TIME REVERSAL PHYSICS', target: 'Quantum Mirror Test' },
        { text: 'TRANSMIT CORROBORATING RADAR PING', target: 'Echo Verification' }
      ],
      endings: ['Timeline Protector', 'Quantum Chrononaut', 'Vigilant Commander']
    }
  },
  {
    scenarioId: 'SPC-009',
    portal: 'last-signal',
    title: 'The Lost Probe of 1977',
    tagline: '“Voyager 1 found drifting at the edge of the system.”',
    description: 'Recover humanity’s legendary golden record probe and add the modern Science Expo message.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      starterScene: 'Visual sensors detect a familiar disc antenna tumbling gently against the stars.',
      choices: [
        { text: 'GRAPPLE WITH TENDER ROBOT ARM', target: 'Careful Recovery' },
        { text: 'READ ORIGINAL GOLDEN RECORD', target: 'Playback Earth Music' },
        { text: 'APPEND 2026 EXPO STUDENT GREETING', target: 'New Message In A Bottle' }
      ],
      endings: ['Heritage Guardian', 'The Golden Symphony', 'Ambassador to Eternity']
    }
  },
  {
    scenarioId: 'SPC-010',
    portal: 'last-signal',
    title: 'The Star Whale Song',
    tagline: '“Cosmic plasma lifeforms migrating across the solar wind.”',
    description: 'Witness colossal ethereal creatures grazing on coronal solar flares.',
    difficulty: 'EASY',
    enabled: true,
    usageCount: 0,
    content: {
      starterScene: 'Enormous ribbons of bioluminescent plasma drift gracefully past the observation deck.',
      choices: [
        { text: 'PLAY HARMONIC CELLO FREQUENCIES', target: 'Musical Communion' },
        { text: 'COLLECT RESIDUAL CORONAL DUST', target: 'Dust Harvester' },
        { text: 'ESCORT POD THROUGH TRANSIT SECTOR', target: 'Gentle Convoy' }
      ],
      endings: ['Friend of Star Whales', 'Cosmic Ecologist', 'Celestial Guardian']
    }
  }
];
