export type Solution = {
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  eyebrow: string;
  intro: string;
  workflows: string[];
  outcomes: string[];
  caveat?: string;
  featureNumbers?: string[];
};

export type ProductFeature = {
  number: string;
  title: string;
  copy: string;
  tag: string;
  icon: string;
  workflows: string[];
  benefit: string;
  caveat?: string;
};

export type Industry = {
  slug: string;
  title: string;
  summary: string;
  intro: string;
  workflows: string[];
  considerations: string;
};

export type Testimonial = {
  facilityName: string;
  role: string;
  quotation: string;
  permissionGranted: boolean;
};

export type CaseStudy = {
  facilityName: string;
  challenge: string;
  workflows: string[];
  verifiedOutcomes: string[];
  publicationApproved: boolean;
};
