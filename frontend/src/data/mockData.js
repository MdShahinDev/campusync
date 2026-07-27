
export const SAMPLE_RESOURCES = [
  {
    id: 'res-camera-01',
    name: 'Sony Alpha A7 IV Camera Kit',
    category: 'Cameras',
    department: 'School of Media & Journalism',
    location: 'Media Lab 2B • Studio Desk 4',
    status: 'available',
    availableCount: 4,
    totalCount: 5,
    rating: 4.9,
    reviewsCount: 128,
    specs: ['33MP Full-Frame', '4K 60p 10-Bit', 'FE 24-70mm f/2.8 GM II Lens', '2x 128GB Pro Tough SD'],
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    popularForClubs: ['Film Club', 'Documentary Crew', 'Journalism Guild'],
    rfidTag: 'RFID-MEDIA-9021'
  },
  {
    id: 'res-book-01',
    name: 'Quantum Mechanics: Principles & Applications (4th Ed)',
    category: 'Books',
    department: 'Physics & Applied Sciences Library',
    location: 'Science Library • Stack 14B',
    status: 'available',
    availableCount: 9,
    totalCount: 10,
    rating: 4.8,
    reviewsCount: 64,
    specs: ['Hardcover Edition', 'Includes Companion Code', 'Annotated Solution Guide'],
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    popularForClubs: ['Quantum Physics Society', 'Undergrad Physics Council'],
    rfidTag: 'RFID-PHYS-4402'
  },
  {
    id: 'res-room-01',
    name: 'Innovation Study Room 304 (Acoustic Glass Pod)',
    category: 'Rooms',
    department: 'Student Innovation Hub',
    location: 'Engineering Building 3 • 3rd Floor',
    status: 'booked',
    availableCount: 0,
    totalCount: 1,
    rating: 5.0,
    reviewsCount: 312,
    specs: ['8 Person Capacity', '75" 4K Interactive Touchscreen', 'Dual Whiteboard Walls', 'High-Speed Mesh Wi-Fi 7'],
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    popularForClubs: ['Hackathon Committee', 'Robotics Team', 'AI Research Lab'],
    rfidTag: 'RFID-ROOM-0304'
  },
  {
    id: 'res-iot-01',
    name: 'Raspberry Pi 5 Developer Starter Kit (8GB RAM)',
    category: 'IoT Kits',
    department: 'Computer Science & Robotics',
    location: 'Turing Hall • Hardware Locker A7',
    status: 'available',
    availableCount: 12,
    totalCount: 15,
    rating: 4.9,
    reviewsCount: 204,
    specs: ['2.4GHz Quad-Core 64-bit', 'Active Cooling Fan', '64GB High-Endurance NVMe', 'Sensor Expansion HAT'],
    imageUrl: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80',
    popularForClubs: ['IoT Hackers', 'Embedded Systems Club', 'Cybersecurity Guild'],
    rfidTag: 'RFID-CS-8819'
  },
  {
    id: 'res-proj-01',
    name: 'Epson Pro 4K Laser Cinema Projector',
    category: 'Projectors',
    department: 'Auditorium & Events Services',
    location: 'Student Union • Central Tech Depot',
    status: 'available',
    availableCount: 3,
    totalCount: 3,
    rating: 4.7,
    reviewsCount: 89,
    specs: ['6,000 Lumens', 'HDR10+ / 4K Pro-UHD', 'Motorized Lens Shift', 'Wireless HDMI & AirPlay'],
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
    popularForClubs: ['Campus Cinema Society', 'TEDx Student Chapter'],
    rfidTag: 'RFID-AV-2091'
  },
  {
    id: 'res-lab-01',
    name: 'Keysight InfiniiVision 4-Channel Oscilloscope',
    category: 'Laboratory',
    department: 'Electrical Engineering',
    location: 'Tesla Hall • Bench 12',
    status: 'available',
    availableCount: 2,
    totalCount: 4,
    rating: 4.9,
    reviewsCount: 76,
    specs: ['200 MHz Bandwidth', '5 GSa/s Sample Rate', 'MegaZoom IV Technology', 'I2C / SPI Decoding'],
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    popularForClubs: ['IEEE Student Branch', 'Solar Car Team'],
    rfidTag: 'RFID-EE-7102'
  },
  {
    id: 'res-vr-01',
    name: 'Meta Quest 3 Enterprise VR / MR Suite',
    category: 'Electronics',
    department: 'Human-Computer Interaction Lab',
    location: 'Design Center • Room 102',
    status: 'available',
    availableCount: 6,
    totalCount: 8,
    rating: 4.9,
    reviewsCount: 150,
    specs: ['4K+ Infinite Display', 'Full-Color Passthrough MR', 'Touch Plus Controllers', 'Sanitized UV Station Included'],
    imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=600&q=80',
    popularForClubs: ['Game Dev Club', 'Spatial Computing Lab'],
    rfidTag: 'RFID-HCI-3310'
  },
  {
    id: 'res-3d-01',
    name: 'Formlabs Form 3+ SLA High-Precision 3D Printer',
    category: 'Creative Tools',
    department: 'Makerspace & Prototyping Core',
    location: 'FabLab • Station Alpha',
    status: 'reserved',
    availableCount: 1,
    totalCount: 2,
    rating: 5.0,
    reviewsCount: 94,
    specs: ['25-Micron Laser Resolution', 'Clear / Tough Resin Tanks', 'Automated Post-Wash & Cure'],
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80',
    popularForClubs: ['Formula Student Engineering', 'Biomedical Inventors'],
    rfidTag: 'RFID-FAB-5501'
  }
];

export const CATEGORIES = [
  { id: 'cat-books', name: 'Books & Research', icon: 'BookOpen', description: 'Academic textbooks, journal archives, and course reserves.', itemCount: 14200, featuredItems: ['Quantum Mechanics', 'Organic Chemistry', 'Algorithms Unlocked'] },
  { id: 'cat-electronics', name: 'Electronics & Chips', icon: 'Cpu', description: 'Development boards, GPUs, FPGAs, and test equipment.', itemCount: 6800, featuredItems: ['Jetson Orin', 'Arduino Mega', 'FPGA Kits'] },
  { id: 'cat-lab', name: 'Laboratory Gear', icon: 'FlaskConical', description: 'Oscilloscopes, microscopes, spectrometers, and centrifuges.', itemCount: 3400, featuredItems: ['Keysight Scope', 'Electron Microscope', 'PCR Thermal Cycler'] },
  { id: 'cat-rooms', name: 'Study & Collab Pods', icon: 'DoorClosed', description: 'Soundproof pods, recording booths, and project war rooms.', itemCount: 450, featuredItems: ['Glass Pod 304', 'Podcast Booth B', 'VR Dev Lab'] },
  { id: 'cat-cameras', name: 'Cameras & AV Gear', icon: 'Camera', description: 'Mirrorless cameras, cinema primes, gimbals, and audio mics.', itemCount: 2100, featuredItems: ['Sony A7 IV', 'RED Komodo 6K', 'Rode Wireless Pro'] },
  { id: 'cat-iot', name: 'IoT & Robotics Kits', icon: 'Bot', description: 'Raspberry Pi 5, LiDAR sensors, drones, and servo rigs.', itemCount: 4100, featuredItems: ['Raspberry Pi 5', 'Solid State LiDAR', 'TurtleBot 4'] },
  { id: 'cat-projectors', name: 'Projectors & Displays', icon: 'Tv', description: '4K laser projectors, portable LED displays, and touch monitors.', itemCount: 980, featuredItems: ['Epson Pro 4K', 'Anker Nebula', 'Samsung Flip 2'] },
  { id: 'cat-creative', name: 'Creative Tools', icon: 'Wrench', description: 'SLA 3D printers, laser cutters, CNC routers, and VR headsets.', itemCount: 1250, featuredItems: ['Formlabs SLA', 'Glowforge Laser', 'Meta Quest 3'] },
];

export const WORKFLOW_STEPS = [
  {
    step: 1,
    title: 'Search',
    subtitle: 'Cross-Campus Discovery',
    icon: 'Search',
    badge: 'Real-time Sync',
    detail: 'Search across 48+ university departments simultaneously. Filter by real-time location, hardware specs, or class requirements.'
  },
  {
    step: 2,
    title: 'Reserve',
    subtitle: 'Smart Slot Lock',
    icon: 'CalendarCheck',
    badge: 'Conflict-Free',
    detail: 'Choose exact pickup & return timestamps. The AI engine guarantees zero double-bookings by locking hardware in real-time.'
  },
  {
    step: 3,
    title: 'Approval',
    subtitle: 'Automated / Faculty Gate',
    icon: 'ShieldCheck',
    badge: 'Instant Trust',
    detail: 'Low-risk items pass instantly based on peer reputation score. High-value lab gear triggers automated faculty authorization.'
  },
  {
    step: 4,
    title: 'Borrow',
    subtitle: 'Contactless Smart Station',
    icon: 'ScanLine',
    badge: 'RFID / QR Station',
    detail: 'Scan your digital student wallet QR or NFC badge at the automated cabinet station to retrieve gear in under 8 seconds.'
  },
  {
    step: 5,
    title: 'Use',
    subtitle: 'Telemetry Monitoring',
    icon: 'Cpu',
    badge: 'Active Protection',
    detail: 'Integrated IoT sensors track battery health, location ping inside campus boundaries, and maintenance warnings.'
  },
  {
    step: 6,
    title: 'QR Return',
    subtitle: 'Instant Drop Box',
    icon: 'QrCode',
    badge: 'Auto-Check',
    detail: 'Drop gear into the smart return station. Optical RFID sensors verify kit completeness and condition in real-time.'
  },
  {
    step: 7,
    title: 'Review',
    subtitle: 'Peer Trust Score',
    icon: 'Star',
    badge: '+25 Rep Points',
    detail: 'On-time returns boost your campus trust score, unlocking higher borrowing limits and priority booking privileges.'
  }
];

export const LIVE_BOOKINGS = [
  {
    id: 'BK-9021',
    resourceName: 'Sony Alpha A7 IV Camera Kit',
    category: 'Cameras',
    borrowerName: 'Elena Rostova',
    borrowerRole: 'Undergrad Student (Senior)',
    department: 'School of Media & Journalism',
    pickupTime: 'Today, 09:30 AM',
    returnTime: 'Today, 04:00 PM',
    status: 'active',
    qrCode: 'QR-CAM-9021'
  },
  {
    id: 'BK-9022',
    resourceName: 'Quantum Mechanics (4th Ed)',
    category: 'Books',
    borrowerName: 'Marcus Vance',
    borrowerRole: 'Graduate Researcher',
    department: 'Physics Department',
    pickupTime: 'Yesterday, 02:15 PM',
    returnTime: 'Tomorrow, 02:15 PM',
    status: 'active',
    qrCode: 'QR-BK-9022'
  },
  {
    id: 'BK-9023',
    resourceName: 'Raspberry Pi 5 Developer Kit',
    category: 'IoT Kits',
    borrowerName: 'Devon Wright',
    borrowerRole: 'CS Club President',
    department: 'Computer Science & Engineering',
    pickupTime: 'Today, 11:00 AM',
    returnTime: 'Friday, 05:00 PM',
    status: 'pending',
    qrCode: 'QR-IOT-9023'
  },
  {
    id: 'BK-9024',
    resourceName: 'Epson Pro 4K Laser Projector',
    category: 'Projectors',
    borrowerName: 'Prof. Sarah Jenkins',
    borrowerRole: 'Faculty Lead',
    department: 'Academic Affairs',
    pickupTime: 'Jul 24, 08:00 AM',
    returnTime: 'Jul 24, 06:00 PM',
    status: 'returned',
    qrCode: 'QR-AV-9024'
  },
  {
    id: 'BK-9025',
    resourceName: 'Keysight Oscilloscope Bench',
    category: 'Laboratory',
    borrowerName: 'Siddharth Patel',
    borrowerRole: 'Master Student',
    department: 'Electrical Engineering',
    pickupTime: 'Jul 22, 10:00 AM',
    returnTime: 'Jul 23, 10:00 AM',
    status: 'returned',
    qrCode: 'QR-EE-9025'
  }
];

export const TESTIMONIALS= [
  {
    id: 'test-1',
    quote: 'CampusShare eliminated $180,000 in duplicate camera & lighting purchases across journalism, fine arts, and cinema departments in our first semester alone.',
    author: 'Dr. Aris Thorne',
    role: 'Dean of Technology & Resources',
    department: 'Academic Administration',
    university: 'Stanford University Technology Council',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    badge: 'Verified Administrator',
    rating: 5
  },
  {
    id: 'test-2',
    quote: 'As president of the Robotics Guild, booking high-performance Nvidia GPUs and LiDAR kit used to take 2 weeks of physical paper forms. Now it takes 10 seconds on mobile.',
    author: 'Maya Lin',
    role: 'Student Robotics Team Lead',
    department: 'Mechanical & Mechatronics Eng',
    university: 'MIT Robotics Association',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    badge: 'Top Verified Borrower',
    rating: 5
  },
  {
    id: 'test-3',
    quote: 'The QR drop-box return station with automated condition logging has cut missing inventory down to essentially 0%. Faculty can finally trust students with $50k lab rigs.',
    author: 'Prof. Henrik Lindqvist',
    role: 'Director of Physics Labs',
    department: 'Quantum Optics Core',
    university: 'ETH Zürich Science Park',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    badge: 'Faculty Admin',
    rating: 5
  }
];

export const PRICING_PLANS = [
  {
    id: 'plan-club',
    name: 'Student Club Starter',
    tagline: 'Ideal for student organizations, dorm councils, and lab groups starting out.',
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      'Up to 250 Shared Assets',
      'Instant QR Checkouts & Mobile App',
      'Peer Reputation Scoring Engine',
      'Basic SMS & Email Notifications',
      'Community Support & Wiki Guides'
    ],
    cta: 'Start Free for Clubs'
  },
  {
    id: 'plan-pro',
    name: 'Campus Pro',
    tagline: 'For mid-sized colleges seeking full cross-department resource sharing.',
    priceMonthly: 399,
    priceAnnual: 319,
    popular: true,
    features: [
      'Unlimited Assets & Departments',
      'SSO / SAML 2.0 Integration (Okta, Canvas, Azure AD)',
      'Smart RFID & Automated Lock Cabinet Sync',
      'AI Demand Forecasting & Auto Approval Rules',
      'Damage Reporting & Photo Evidence Vault',
      '24/7 Dedicated Campus Success Manager'
    ],
    cta: 'Deploy Campus Pro'
  },
  {
    id: 'plan-enterprise',
    name: 'Multi-Campus Mesh',
    tagline: 'Custom infrastructure for multi-campus university systems and state networks.',
    priceMonthly: 899,
    priceAnnual: 749,
    features: [
      'Multi-Campus Inter-Library & Lab Mesh Routing',
      'Custom IoT Telemetry & Hardware Locks',
      'Institutional Financial & Depreciation Audits',
      'Custom Role-Based Permissions & Air-Gapped Cloud',
      'SLA 99.99% Availability Guarantee',
      'On-Site Hardware Station Installation'
    ],
    cta: 'Contact Enterprise Team'
  }
];

export const FAQS= [
  {
    id: 'faq-1',
    question: 'How does CampusShare integrate with our existing University SSO / Student ID systems?',
    answer: 'CampusShare natively supports SAML 2.0, OAuth 2.0, Okta, Shibboleth, Canvas, Banner, and Azure Active Directory. Students log in directly using their standard university credentials and NFC student badges without creating secondary passwords.',
    category: 'security'
  },
  {
    id: 'faq-2',
    question: 'What happens if a high-value camera or oscilloscope is returned damaged?',
    answer: 'Our automated QR & RFID drop station requires a 3-point condition scan during return. Borrowers submit a 5-second video/photo verification. If damage is flagged, the AI system immediately holds the item for technician review and notifies the department administrator with automated liability logs.',
    category: 'general'
  },
  {
    id: 'faq-3',
    question: 'Can departments restrict certain specialized equipment to specific courses?',
    answer: 'Yes! Department admins set role-based access control (RBAC). For example, a $40,000 Leica Laser Scanner can be restricted strictly to graduate students enrolled in Architecture 501 or students with verified lab safety certifications.',
    category: 'general'
  },
  {
    id: 'faq-4',
    question: 'How hard is it to install the automated RFID and QR smart cabinets?',
    answer: 'CampusShare smart cabinets are plug-and-play IoT modules. They connect to campus Wi-Fi or Ethernet and sync with the CampusShare cloud in under 15 minutes without requiring custom wiring or overhaul.',
    category: 'hardware'
  },
  {
    id: 'faq-5',
    question: 'Can we pilot CampusShare in a single department before rolling it out university-wide?',
    answer: 'Absolutely. Over 80% of our university partners begin with a 30-day single department pilot (such as Media, Electrical Engineering, or Makerspace) and seamlessly expand campus-wide with zero downtime.',
    category: 'pricing'
  }
];
