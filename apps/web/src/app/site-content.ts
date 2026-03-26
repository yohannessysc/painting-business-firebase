export type ServiceItem = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  highlights: string[];
};

export type ResultItem = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

export type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

export type TrustHighlight = {
  value: string;
  label: string;
};

export const companyName = 'Evolution Painting Solutions';
export const contactPhone = '343-571-3927';
export const contactEmail = 'evolutionspaintingsolutions@gmail.com';
export const serviceAreas = [
  'Barrhaven',
  'Kanata',
  'Nepean',
  'Orleans',
  'Gloucester',
  'Downtown Ottawa'
];

export const trustHighlights: TrustHighlight[] = [
  { value: 'New Team', label: 'Startup with owner-led quality control' },
  { value: '48h', label: 'Typical quote response window' },
  { value: 'Clean Site', label: 'Protected floors and daily cleanup' },
  { value: 'Clear Scope', label: 'Written plan before day one' }
];

export const services: ServiceItem[] = [
  {
    title: 'Interior Painting',
    description:
      'Full-room and targeted interior repainting with patching, sanding, priming, and clean cut-lines.',
    imageUrl:
      'https://images.pexels.com/photos/5493662/pexels-photo-5493662.jpeg?auto=compress&cs=tinysrgb&w=1200',
    imageAlt: 'Professional painters applying interior wall paint with rollers',
    highlights: ['Drywall patch and surface prep', 'Clean edges on trim and ceilings', 'Low-odor options for occupied homes']
  },
  {
    title: 'Exterior Painting',
    description:
      'Exterior coatings for siding, stucco, trim, and doors with weather-smart preparation and finish systems.',
    imageUrl:
      'https://images.pexels.com/photos/5493664/pexels-photo-5493664.jpeg?auto=compress&cs=tinysrgb&w=1200',
    imageAlt: 'Exterior prep and painting activity on a house facade',
    highlights: ['Wash, scrape, and prime sequence', 'Detailed caulking and crack fill', 'UV and moisture-resistant top coats']
  },
  {
    title: 'Cabinet Refinishing',
    description:
      'Kitchen and built-in cabinet repainting that delivers a durable, smooth finish without full replacement costs.',
    imageUrl:
      'https://images.pexels.com/photos/6474135/pexels-photo-6474135.jpeg?auto=compress&cs=tinysrgb&w=1200',
    imageAlt: 'Painter working carefully on detailed surface refinishing',
    highlights: ['Degrease, sand, and bond-prime', 'Spray and brush combination by surface', 'Hardware-safe masking and reassembly']
  },
  {
    title: 'Commercial Spaces',
    description:
      'Office, retail, and rental-unit painting delivered in phases to keep operations moving with minimal downtime.',
    imageUrl:
      'https://images.pexels.com/photos/36153946/pexels-photo-36153946.jpeg?auto=compress&cs=tinysrgb&w=1200',
    imageAlt: 'Commercial painting team working on an interior renovation site',
    highlights: ['After-hours and staged scheduling', 'Clear daily completion targets', 'Site protection and cleanup protocol']
  }
];

export const processSteps: ProcessStep[] = [
  {
    number: '01',
    title: 'On-Site Assessment',
    description: 'We review surfaces, lighting, color goals, and timeline to create a clear scope.'
  },
  {
    number: '02',
    title: 'Protection And Prep',
    description: 'Masking, patching, sanding, and priming are completed before any finish coat begins.'
  },
  {
    number: '03',
    title: 'Precision Application',
    description: 'Our crew applies consistent coats with pro-grade tools for clean lines and even coverage.'
  },
  {
    number: '04',
    title: 'Walkthrough And Handover',
    description: 'We inspect every area together, complete touch-ups, and share care tips for longevity.'
  }
];

export const results: ResultItem[] = [
  {
    title: 'Exterior Refresh',
    description: 'Complete exterior prep and finish pass for stronger curb appeal and long-term protection.',
    imageUrl:
      'https://images.pexels.com/photos/5493669/pexels-photo-5493669.jpeg?auto=compress&cs=tinysrgb&w=1600',
    imageAlt: 'Professional house painter rolling paint on exterior wall'
  },
  {
    title: 'Interior Repaint',
    description: 'A full interior repaint with cleaner light reflection and uniform color consistency.',
    imageUrl:
      'https://images.pexels.com/photos/7218683/pexels-photo-7218683.jpeg?auto=compress&cs=tinysrgb&w=1200',
    imageAlt: 'Painter rolling new paint onto an interior wall'
  },
  {
    title: 'Precision Finishing',
    description: 'Detail work and finish corrections completed with meticulous masking and clean execution.',
    imageUrl:
      'https://images.pexels.com/photos/6474301/pexels-photo-6474301.jpeg?auto=compress&cs=tinysrgb&w=1200',
    imageAlt: 'Painter performing detail-focused finishing work indoors'
  }
];
