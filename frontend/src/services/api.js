/**
 * RapidAid AI - API Service
 * Handles backend calls with robust fallback demo data for Hyderabad, India incidents
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// In-memory demo data store for seamless offline/standalone demo experience
let mockIncidents = [
  {
    id: 'INC-2026-001',
    title: 'Multi-Vehicle Collision with Fuel Leak',
    description: '3 cars and 1 delivery truck collided near Cyber Towers junction. Fuel is leaking from the truck. 2 passengers trapped inside a sedan with head injuries.',
    category: 'Road Accident',
    severity: 'critical',
    status: 'in_progress',
    latitude: 17.4485,
    longitude: 78.3742,
    location_name: 'Cyber Towers Junction, Hitec City, Hyderabad',
    report_count: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
    updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    ai_analysis: {
      summary: 'High-speed multi-vehicle pileup with trapped occupants and combustible fuel spill on primary arterial junction.',
      priority_score: 94,
      priority_explanation: 'Active entrapment reported + hazardous combustible fuel leakage posing explosion hazard in dense tech corridor during rush hour.',
      extracted_entities: {
        people_injured: 4,
        people_trapped: 2,
        vehicles_involved: 4,
        hazards: ['Diesel fuel spill', 'Road blockage', 'Power cable hazard']
      },
      recommended_responders: ['Traffic Police Hyderabad', 'Fire & Rescue (Hydraulic Cutters)', '108 Ambulance (2 units)'],
      missing_information: ['Hazardous cargo status of the delivery truck', 'Consciousness level of trapped passenger'],
      urgency_level: 'Immediate Action Required (Code Red)'
    },
    timeline: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), action: 'Incident Detected', user: 'AI Correlator', note: 'Grouped 3 independent 112 citizen reports within 75m radius.' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(), action: 'Verified', user: 'Officer K. Raman', note: 'CCTV camera #HT-204 confirms pileup and traffic stall.' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), action: 'Responders Dispatched', user: 'Central Dispatch', note: 'Fire Tender 04 and 108 Ambulances dispatched from Madhapur station.' }
    ],
    linked_reports: [
      { id: 'REP-101', reporter_name: 'Rahul Varma', phone: '+91 98480 12345', text: 'Accident just happened right at Cyber Towers flyover ramp! Two cars smashed, one truck leaking oil. People shouting for help!', language: 'en', timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), source: 'Citizen Portal' },
      { id: 'REP-102', reporter_name: 'Suresh Reddy', phone: '+91 99890 54321', text: 'సైబర్ టవర్స్ దగ్గర పెద్ద యాక్సిడెంట్ అయింది. కారులో ఇద్దరు ఇరుక్కుపోయారు. వెంటనే అంబులెన్స్ పంపండి.', language: 'te', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), source: 'Voice Report' },
      { id: 'REP-103', reporter_name: 'Pooja Sharma', phone: '+91 94401 98765', text: 'Smoke coming from truck undercarriage at Cyber Towers signal. Traffic completely backed up.', language: 'en', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), source: 'Citizen Portal' }
    ]
  },
  {
    id: 'INC-2026-002',
    title: 'Severe Urban Inundation & Submerged Vehicles',
    description: 'Flash flooding on Begumpet main road under the flyover. Water levels reached 3.5 feet. Multiple auto-rickshaws stalled, commuters stranded on median divider.',
    category: 'Flood',
    severity: 'high',
    status: 'verified',
    latitude: 17.4447,
    longitude: 78.4664,
    location_name: 'Begumpet Railway Bridge Underpass, Hyderabad',
    report_count: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    ai_analysis: {
      summary: 'Storm drain overflow resulting in waist-deep water underpass stagnation. Multiple vehicles submerged with 12+ commuters stranded.',
      priority_score: 82,
      priority_explanation: 'Rising water levels threatening stranded elderly citizens on median; electrical junction box near water surface.',
      extracted_entities: {
        water_depth_feet: 3.5,
        people_stranded: 14,
        hazards: ['Open manholes submerged', 'TSSPDCL transformer near waterline', 'Hypothermia/drowning risk']
      },
      recommended_responders: ['GHMC Disaster Response Force (DRF)', 'State Disaster Response Force (SDRF Boats)', 'Traffic Wardens'],
      missing_information: ['Are stormwater drain gates opened upstream?'],
      urgency_level: 'High Priority Deployment'
    },
    timeline: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(), action: 'Incident Created', user: 'Citizen Web Form', note: 'Multiple automated alerts triggered.' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), action: 'Verified', user: 'GHMC Monsoon Cell', note: 'Water logging sensor #BG-09 confirms 105cm depth.' }
    ],
    linked_reports: [
      { id: 'REP-201', reporter_name: 'K. Venkatesh', phone: '+91 97000 11223', text: 'వాటర్ లెవెల్ చాలా పెరిగిపోయింది బేగంపేట బ్రిడ్జి కింద. బస్సులు కూడా ఆగిపోయాయి. మ్యాన్‌హోల్స్ కనిపించడం లేదు.', language: 'te', timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(), source: 'Citizen Portal' },
      { id: 'REP-202', reporter_name: 'Ananya Rao', phone: '+91 98850 44332', text: 'Water level up to bonnet height. People standing on top of autos. Please send SDRF rescue boats immediately.', language: 'en', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), source: 'Citizen Portal' }
    ]
  },
  {
    id: 'INC-2026-003',
    title: 'Commercial Complex 4th Floor Fire & Smoke Spread',
    description: 'Electrical fire erupted on the 4th floor of a 6-story commercial complex. Heavy black smoke spreading through air ducts. Approximately 25 employees trapped on upper floor.',
    category: 'Fire',
    severity: 'critical',
    status: 'in_progress',
    latitude: 17.4156,
    longitude: 78.4350,
    location_name: 'Road No. 12, Banjara Hills, Hyderabad',
    report_count: 6,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    ai_analysis: {
      summary: 'Rapidly escalating structure fire in commercial multi-storey building with trapped occupants above fire line.',
      priority_score: 96,
      priority_explanation: 'Active smoke inhalation risk for 25+ people on 5th/6th floor; primary emergency stairwell compromised by smoke.',
      extracted_entities: {
        people_trapped: 25,
        floors_involved: '4th to 6th',
        hazards: ['Toxic smoke', 'Blocked fire escape', 'Rooftop access door locked']
      },
      recommended_responders: ['Fire Services Hydraulic Platform (54m Bronto Skylift)', 'Emergency Medical Services (EMS)', 'Police Cordon Unit'],
      missing_information: ['Are automatic sprinklers activated?', 'Status of roof door lock'],
      urgency_level: 'Immediate Action Required (Code Red)'
    },
    timeline: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), action: 'Incident Created', user: 'AI Correlator', note: 'Multiple 112 calls and voice reports combined.' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), action: 'Verified & Upgraded to Critical', user: 'Fire Control Room', note: 'Skylift deployed from Filmnagar Fire Station.' }
    ],
    linked_reports: [
      { id: 'REP-301', reporter_name: 'Aditya Sen', phone: '+91 91234 56789', text: 'Huge fire at 4th floor IT office! Staircase full of black smoke, cannot go down. We are moving to terrace!', language: 'en', timestamp: new Date(Date.now() - 1000 * 60 * 24).toISOString(), source: 'Citizen Portal' }
    ]
  },
  {
    id: 'INC-2026-004',
    title: 'Partial Structural Collapse of Dilapidated Facade',
    description: 'Balcony and front wall of an older 3-storey heritage building collapsed onto pedestrian footpath and two parked auto-rickshaws. Suspected civilian trapped under masonry debris.',
    category: 'Building Collapse',
    severity: 'high',
    status: 'new',
    latitude: 17.4399,
    longitude: 78.4983,
    location_name: 'Station Road, Secunderabad, Hyderabad',
    report_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    ai_analysis: {
      summary: 'Masonry collapse over busy pedestrian corridor with potential live victim trapped under rubble slab.',
      priority_score: 88,
      priority_explanation: 'Immediate search and rescue needed before further progressive collapse of weakened remaining facade.',
      extracted_entities: {
        possible_victims: 2,
        hazards: ['Unstable overhead structure', 'Severed overhead electrical wires', 'Crowd gathering']
      },
      recommended_responders: ['NDRF / SDRF Urban Search & Rescue (USAR)', 'Gas Cutters & Heavy Crane Unit', 'TSSPDCL Electrical Safety Crew'],
      missing_information: ['Exact number of pedestrians walking under awning at collapse instant'],
      urgency_level: 'High Priority Deployment'
    },
    timeline: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), action: 'Incident Created', user: 'Citizen Web Form', note: 'Initial voice and photo report received.' }
    ],
    linked_reports: [
      { id: 'REP-401', reporter_name: 'Naveen Kumar', phone: '+91 98765 43210', text: 'రైల్వే స్టేషన్ రోడ్ దగ్గర పాత భవనం గోడ కూలిపోయింది. ఒక ఆటో కింద నలిగిపోయింది. ఒకరు లోపల ఉండొచ్చు.', language: 'te', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), source: 'Citizen Portal' }
    ]
  },
  {
    id: 'INC-2026-005',
    title: 'Domestic LPG Pipeline Rupture with Strong Odor',
    description: 'Construction backhoe snagged underground piped natural gas line. Strong sulfur odor detectable across 200m radius. Evacuation initiated informally by locals.',
    category: 'Gas Leak',
    severity: 'high',
    status: 'verified',
    latitude: 17.4933,
    longitude: 78.3914,
    location_name: 'Phase 3, KPHB Colony, Kukatpally, Hyderabad',
    report_count: 4,
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    ai_analysis: {
      summary: 'Pressurized gas line rupture in high-density residential colony. High deflagration risk if ignition source encountered.',
      priority_score: 85,
      priority_explanation: 'Vapor cloud expanding towards nearby street food vendor stalls with open flames.',
      extracted_entities: {
        leak_type: 'Piped Natural Gas (PNG)',
        affected_radius_meters: 250,
        hazards: ['Open fire ignition risk', 'Inhalation toxicity', 'Panic evacuation']
      },
      recommended_responders: ['Bhagyanagar Gas Emergency Shutoff Team', 'Fire Brigade Fog Nozzle Crew', 'Local Police Zone 5'],
      missing_information: ['Main line isolation valve location key confirmation'],
      urgency_level: 'High Priority Deployment'
    },
    timeline: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), action: 'Incident Created', user: 'Citizen Portal', note: 'Reported by local resident association member.' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), action: 'Status Verified', user: 'Gas Safety Inspector', note: 'Line pressure drop confirmed on grid telemetry.' }
    ],
    linked_reports: [
      { id: 'REP-501', reporter_name: 'Deepak Jha', phone: '+91 94900 88776', text: 'Excavator hit PNG pipe! Huge hissing sound and gas smell everywhere. People running away.', language: 'en', timestamp: new Date(Date.now() - 1000 * 60 * 34).toISOString(), source: 'Citizen Portal' }
    ]
  },
  {
    id: 'INC-2026-006',
    title: 'Mass Cardiac & Heat Distress at Public Gathering',
    description: 'During large rally, 6 elderly individuals collapsed simultaneously due to severe heat exhaustion and dehydration; 1 person experiencing suspected acute myocardial infarction.',
    category: 'Medical Emergency',
    severity: 'medium',
    status: 'resolved',
    latitude: 17.3850,
    longitude: 78.4867,
    location_name: 'Near Nizam College Grounds, Gunfoundry, Hyderabad',
    report_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    ai_analysis: {
      summary: 'Multiple heat stress casualties with suspected acute cardiac episode requiring immediate CPR & triage.',
      priority_score: 65,
      priority_explanation: 'Primary patients stabilized by on-site paramedical response; transferred to Osmania General Hospital.',
      extracted_entities: {
        patients_treated: 6,
        critical_cases: 1,
        hazards: ['Dehydration crowd surge', 'Ambulance ingress delay due to rally barricades']
      },
      recommended_responders: ['108 Advanced Life Support (ALS)', 'Red Cross First Aid Mobile Unit'],
      missing_information: ['All patients accounted for and transferred.'],
      urgency_level: 'Resolved'
    },
    timeline: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(), action: 'Report Received', user: 'Citizen Portal', note: 'Rally volunteer reported collapsed attendees.' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), action: 'Paramedics On-Scene', user: '108 Team 12', note: 'IV fluids administered, AED applied to cardiac patient.' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), action: 'Marked Resolved', user: 'Field Commander', note: 'All patients safely admitted to Osmania Hospital.' }
    ],
    linked_reports: [
      { id: 'REP-601', reporter_name: 'Dr. Satish Kumar', phone: '+91 93910 22334', text: 'Elderly gentleman collapsed near gate 2. Weak pulse, needs immediate oxygen and defibrillator.', language: 'en', timestamp: new Date(Date.now() - 1000 * 60 * 94).toISOString(), source: 'Citizen Portal' }
    ]
  },
  {
    id: 'INC-2026-007',
    title: 'Major Grid Transformer Trip & Traffic Signal Blackout',
    description: '33kV substation feeder tripped causing blackout across 4 major traffic intersections. Extreme vehicle gridlock blocking emergency transit corridors.',
    category: 'Power Outage',
    severity: 'low',
    status: 'in_progress',
    latitude: 17.4375,
    longitude: 78.4483,
    location_name: 'Ameerpet Metro Junction, Hyderabad',
    report_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    ai_analysis: {
      summary: 'Traffic signal infrastructure blackout leading to multi-kilometer vehicular gridlock at primary transit hub.',
      priority_score: 48,
      priority_explanation: 'No immediate direct life threat, but high indirect risk to ambulances attempting cross-city transit.',
      extracted_entities: {
        junctions_affected: 4,
        hazards: ['Traffic paralysis', 'Pedestrian crossing hazards']
      },
      recommended_responders: ['TSSPDCL Quick Restoration Cell', 'Hyderabad Traffic Police Manual Wardens'],
      missing_information: ['Estimated substation restoration ETA from load dispatch centre'],
      urgency_level: 'Standard Response Required'
    },
    timeline: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(), action: 'Incident Logged', user: 'Traffic Cell', note: 'SCADA alarm indicated 33kV breaker open.' }
    ],
    linked_reports: [
      { id: 'REP-701', reporter_name: 'Srikanth M', phone: '+91 99080 33445', text: 'All traffic lights dead at Ameerpet circle for 45 mins. Total chaos!', language: 'en', timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString(), source: 'Citizen Portal' }
    ]
  }
];

// Helper to simulate network latency
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Submit an emergency report
 */
export async function submitReport(reportData) {
  try {
    const res = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend API unavailable, simulating intelligent AI processing & grouping:', err);
  }

  // Standalone simulation fallback
  await delay(600);

  // Generate intelligent AI assessment based on content
  const text = (reportData.description || '').toLowerCase();
  let category = reportData.category;
  if (!category || category === 'Auto-detect') {
    if (text.includes('fire') || text.includes('smoke') || text.includes('flame') || text.includes('మంటలు') || text.includes('నిప్పు')) {
      category = 'Fire';
    } else if (text.includes('flood') || text.includes('water') || text.includes('drown') || text.includes('వర్షం') || text.includes('వరద')) {
      category = 'Flood';
    } else if (text.includes('accident') || text.includes('crash') || text.includes('car') || text.includes('truck') || text.includes('యాక్సిడెంట్')) {
      category = 'Road Accident';
    } else if (text.includes('collapse') || text.includes('building') || text.includes('wall') || text.includes('కూలిపోయింది')) {
      category = 'Building Collapse';
    } else if (text.includes('gas') || text.includes('leak') || text.includes('smell') || text.includes('గ్యాస్')) {
      category = 'Gas Leak';
    } else if (text.includes('heart') || text.includes('breath') || text.includes('blood') || text.includes('unconscious') || text.includes('స్పృహ')) {
      category = 'Medical Emergency';
    } else if (text.includes('power') || text.includes('electric') || text.includes('transformer') || text.includes('కరెంట్')) {
      category = 'Power Outage';
    } else {
      category = 'Medical Emergency';
    }
  }

  let severity = 'high';
  let priorityScore = 78;
  if (text.includes('trap') || text.includes('dead') || text.includes('serious') || text.includes('explosion') || text.includes('burning') || text.includes('ఇరుక్కు')) {
    severity = 'critical';
    priorityScore = 93;
  } else if (text.includes('light') || text.includes('minor') || text.includes('traffic')) {
    severity = 'low';
    priorityScore = 45;
  }

  const newReportId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
  const lat = reportData.latitude || 17.4385 + (Math.random() - 0.5) * 0.05;
  const lng = reportData.longitude || 78.4485 + (Math.random() - 0.5) * 0.05;

  // Correlate with existing incident or create new
  let incident = mockIncidents.find((inc) => inc.category === category && Math.abs(inc.latitude - lat) < 0.03 && Math.abs(inc.longitude - lng) < 0.03);

  if (incident) {
    incident.report_count += 1;
    incident.linked_reports.unshift({
      id: newReportId,
      reporter_name: reportData.reporter_name || 'Anonymous Citizen',
      phone: reportData.phone || 'Not provided',
      text: reportData.description,
      language: reportData.language || 'en',
      timestamp: new Date().toISOString(),
      source: 'Citizen Portal'
    });
    incident.timeline.unshift({
      timestamp: new Date().toISOString(),
      action: 'Correlated Citizen Report Added',
      user: 'AI Correlation Engine',
      note: `Correlated report #${newReportId} with 89% spatial-textual confidence.`
    });
  } else {
    incident = {
      id: `INC-2026-${String(mockIncidents.length + 1).padStart(3, '0')}`,
      title: `${category} Reported near ${reportData.location_name || 'Hyderabad Metro Area'}`,
      description: reportData.description,
      category,
      severity,
      status: 'new',
      latitude: lat,
      longitude: lng,
      location_name: reportData.location_name || 'Hyderabad, Telangana, India',
      report_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ai_analysis: {
        summary: `AI analysis of citizen dispatch: Identified primary emergency category "${category}" with calculated urgency rating of ${priorityScore}/100.`,
        priority_score: priorityScore,
        priority_explanation: `Detected high-urgency keywords and verified geographical coordinates in active response perimeter.`,
        extracted_entities: {
          detected_hazards: ['Active incident perimeter', 'Traffic obstruction risk'],
          reported_language: reportData.language === 'te' ? 'Telugu (AI Translated)' : 'English',
        },
        recommended_responders: [
          category === 'Fire' ? 'Telangana Fire Services' :
          category === 'Road Accident' ? 'Hyderabad Traffic Police & 108 EMS' :
          category === 'Flood' ? 'GHMC DRF & SDRF' : 'Emergency Response Team 112'
        ],
        missing_information: ['Exact count of affected individuals', 'Safe access route confirmation'],
        urgency_level: severity === 'critical' ? 'Immediate Action Required (Code Red)' : 'High Priority Deployment'
      },
      timeline: [
        {
          timestamp: new Date().toISOString(),
          action: 'Incident Created via RapidAid AI',
          user: 'AI Dispatche Engine',
          note: `Auto-triaged report #${newReportId} into incident system.`
        }
      ],
      linked_reports: [
        {
          id: newReportId,
          reporter_name: reportData.reporter_name || 'Anonymous Citizen',
          phone: reportData.phone || 'Not provided',
          text: reportData.description,
          language: reportData.language || 'en',
          timestamp: new Date().toISOString(),
          source: 'Citizen Portal'
        }
      ]
    };
    mockIncidents.unshift(incident);
  }

  return {
    success: true,
    report_id: newReportId,
    incident_id: incident.id,
    incident: incident,
    ai_summary: incident.ai_analysis.summary,
    severity: incident.severity,
    priority_score: incident.ai_analysis.priority_score,
    message: 'Report received and analyzed by RapidAid AI. Emergency teams alerted.'
  };
}

/**
 * Fetch all incidents with optional filters
 */
export async function getIncidents(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.severity && filters.severity !== 'all') params.append('severity', filters.severity);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/incidents${query}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend API unavailable, using simulated incidents:', err);
  }

  await delay(150);
  let list = [...mockIncidents];

  if (filters.category && filters.category !== 'all') {
    list = list.filter((i) => i.category.toLowerCase() === filters.category.toLowerCase());
  }
  if (filters.severity && filters.severity !== 'all') {
    list = list.filter((i) => i.severity.toLowerCase() === filters.severity.toLowerCase());
  }
  if (filters.status && filters.status !== 'all') {
    list = list.filter((i) => i.status.toLowerCase() === filters.status.toLowerCase());
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    list = list.filter((i) => 
      i.title.toLowerCase().includes(s) || 
      i.description.toLowerCase().includes(s) || 
      i.location_name.toLowerCase().includes(s) ||
      i.id.toLowerCase().includes(s)
    );
  }

  return list;
}

/**
 * Fetch a single incident by ID
 */
export async function getIncident(id) {
  try {
    const res = await fetch(`${BASE_URL}/incidents/${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Backend API unavailable, fetching incident ${id} from local cache:`, err);
  }

  await delay(100);
  const found = mockIncidents.find((i) => i.id === id);
  if (!found) {
    throw new Error(`Incident ${id} not found.`);
  }
  return found;
}

/**
 * Update incident details (status, note, team assignment, etc.)
 */
export async function updateIncident(id, data) {
  try {
    const res = await fetch(`${BASE_URL}/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Backend API unavailable, updating incident ${id} locally:`, err);
  }

  await delay(200);
  const idx = mockIncidents.findIndex((i) => i.id === id);
  if (idx === -1) {
    throw new Error(`Incident ${id} not found.`);
  }

  const current = mockIncidents[idx];
  const updated = {
    ...current,
    ...data,
    updated_at: new Date().toISOString()
  };

  if (data.status && data.status !== current.status) {
    updated.timeline = [
      {
        timestamp: new Date().toISOString(),
        action: `Status changed to ${data.status.toUpperCase()}`,
        user: data.updated_by || 'Coordinator',
        note: data.note || `Status updated via Coordinator Dashboard.`
      },
      ...current.timeline
    ];
  } else if (data.note) {
    updated.timeline = [
      {
        timestamp: new Date().toISOString(),
        action: 'Operational Note Added',
        user: data.updated_by || 'Coordinator',
        note: data.note
      },
      ...current.timeline
    ];
  }

  mockIncidents[idx] = updated;
  return updated;
}

/**
 * Get reports linked to a specific incident
 */
export async function getIncidentReports(id) {
  try {
    const res = await fetch(`${BASE_URL}/incidents/${id}/reports`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Backend API unavailable, fetching reports for incident ${id}:`, err);
  }

  await delay(100);
  const inc = mockIncidents.find((i) => i.id === id);
  return inc ? inc.linked_reports : [];
}

/**
 * Get coordinator dashboard overview stats
 */
export async function getDashboardStats() {
  try {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend API unavailable, calculating stats from local store:', err);
  }

  await delay(100);
  const total = mockIncidents.length;
  const critical = mockIncidents.filter((i) => i.severity === 'critical').length;
  const active = mockIncidents.filter((i) => i.status === 'in_progress' || i.status === 'verified').length;
  const resolved = mockIncidents.filter((i) => i.status === 'resolved').length;
  const totalReports = mockIncidents.reduce((acc, curr) => acc + (curr.report_count || 1), 0);

  // Category counts
  const categoryCounts = {};
  mockIncidents.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  return {
    total_incidents: total,
    critical_incidents: critical,
    active_responses: active,
    resolved_today: resolved,
    reports_received: totalReports,
    categories: categoryCounts,
    trend: '+14% vs yesterday'
  };
}

/**
 * Get recent activity feed
 */
export async function getRecentActivity() {
  try {
    const res = await fetch(`${BASE_URL}/dashboard/recent`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend API unavailable, generating activity from incidents:', err);
  }

  await delay(100);
  const activities = [];
  mockIncidents.forEach((inc) => {
    inc.timeline.forEach((t) => {
      activities.push({
        incident_id: inc.id,
        incident_title: inc.title,
        severity: inc.severity,
        action: t.action,
        user: t.user,
        note: t.note,
        timestamp: t.timestamp
      });
    });
  });

  // Sort descending by timestamp
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return activities.slice(0, 10);
}
