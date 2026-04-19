/**
 * Catalogue d'offres d'emploi DEMO.
 * En prod, ces données viendraient de la table Prisma `JobOffer`
 * ou d'une API partenaire (LinkedIn, Keejob.com, Tanitjobs).
 */
export type JobOffer = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "CDI" | "CDD" | "STAGE" | "FREELANCE";
  filiere: "INFORMATIQUE" | "ELECTRONIQUE" | "BOTH";
  requiredSkills: string[];
  salary?: string;
  description: string;
  postedDays: number;
  logo?: string;
};

export const JOB_OFFERS: JobOffer[] = [
  {
    id: "j1",
    title: "Développeur Full-Stack React/Node",
    company: "Vermeg",
    location: "Tunis, Centre Urbain Nord",
    type: "CDI",
    filiere: "INFORMATIQUE",
    requiredSkills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Git"],
    salary: "1800 - 2500 TND",
    description: "Rejoignez notre équipe produit pour développer une plateforme SaaS financière utilisée par 500+ banques internationales.",
    postedDays: 2,
  },
  {
    id: "j2",
    title: "Ingénieur Systèmes Embarqués",
    company: "Sagemcom Tunisie",
    location: "Ariana, Technopark",
    type: "CDI",
    filiere: "ELECTRONIQUE",
    requiredSkills: ["C", "C++", "Linux embarqué", "STM32", "Protocoles IoT"],
    salary: "2000 - 2800 TND",
    description: "Conception de passerelles IoT pour la smart home. Travail en équipe avec R&D Paris.",
    postedDays: 5,
  },
  {
    id: "j3",
    title: "Stage PFE — Développement Mobile Flutter",
    company: "Talan Tunisie",
    location: "Lac 2, Tunis",
    type: "STAGE",
    filiere: "INFORMATIQUE",
    requiredSkills: ["Flutter", "Dart", "Firebase", "REST API"],
    salary: "Gratification 600 TND",
    description: "Stage de 6 mois avec fortes perspectives d'embauche. Projet mobile bancaire.",
    postedDays: 1,
  },
  {
    id: "j4",
    title: "Data Analyst Junior",
    company: "Instadeep",
    location: "Lac 2, Tunis",
    type: "CDI",
    filiere: "INFORMATIQUE",
    requiredSkills: ["Python", "SQL", "Power BI", "Statistiques", "Machine Learning"],
    salary: "1700 - 2200 TND",
    description: "Analyse de datasets biomédicaux pour la recherche IA. Environnement international.",
    postedDays: 7,
  },
  {
    id: "j5",
    title: "Ingénieur Test Électronique",
    company: "Actia Tunisie",
    location: "Sousse",
    type: "CDI",
    filiere: "ELECTRONIQUE",
    requiredSkills: ["Oscilloscope", "CAN bus", "LabVIEW", "Automotive"],
    salary: "1900 - 2400 TND",
    description: "Validation de calculateurs pour l'industrie automobile (clients Renault, Stellantis).",
    postedDays: 10,
  },
  {
    id: "j6",
    title: "DevOps / SRE",
    company: "Expensya",
    location: "Remote · Tunis",
    type: "CDI",
    filiere: "INFORMATIQUE",
    requiredSkills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform"],
    salary: "2500 - 3500 TND",
    description: "Automatisation de l'infrastructure SaaS. Équipe de 120 ingénieurs.",
    postedDays: 3,
  },
  {
    id: "j7",
    title: "Stage PFE — Cybersécurité offensive",
    company: "Keyrus Tunisie",
    location: "Centre Urbain Nord",
    type: "STAGE",
    filiere: "INFORMATIQUE",
    requiredSkills: ["Linux", "Python", "Kali", "Burp Suite", "OWASP"],
    salary: "Gratification 700 TND",
    description: "Audit de sécurité pour des clients bancaires. Excellente formation initiale.",
    postedDays: 4,
  },
  {
    id: "j8",
    title: "Designer FPGA",
    company: "ST Microelectronics Tunis",
    location: "Lac 1, Tunis",
    type: "CDI",
    filiere: "ELECTRONIQUE",
    requiredSkills: ["VHDL", "Verilog", "Xilinx Vivado", "Simulation"],
    salary: "2200 - 3000 TND",
    description: "Intégration de blocs logiques pour SoC grand public.",
    postedDays: 12,
  },
  {
    id: "j9",
    title: "Développeur Backend Java Spring",
    company: "Sofrecom Tunisie",
    location: "Les Berges du Lac",
    type: "CDI",
    filiere: "INFORMATIQUE",
    requiredSkills: ["Java", "Spring Boot", "Microservices", "Kafka", "MongoDB"],
    salary: "2000 - 2800 TND",
    description: "Refonte du SI télécom pour un grand opérateur européen.",
    postedDays: 6,
  },
  {
    id: "j10",
    title: "Ingénieur R&D Énergie Solaire",
    company: "STEG ER",
    location: "Tunis",
    type: "CDI",
    filiere: "ELECTRONIQUE",
    requiredSkills: ["PSIM", "Matlab", "Convertisseurs DC/DC", "Batteries"],
    salary: "1900 - 2500 TND",
    description: "Conception de micro-onduleurs pour installations photovoltaïques résidentielles.",
    postedDays: 8,
  },
  {
    id: "j11",
    title: "Freelance — App mobile e-commerce",
    company: "Jumia Tunisie",
    location: "Remote",
    type: "FREELANCE",
    filiere: "INFORMATIQUE",
    requiredSkills: ["React Native", "Node.js", "Stripe", "UX"],
    salary: "TJM 300-450 TND",
    description: "Mission 3 mois sur refonte de l'app marchande. Très bonne exposition.",
    postedDays: 0,
  },
  {
    id: "j12",
    title: "Stage PFE — Robotique industrielle",
    company: "Leoni Tunisie",
    location: "Sousse",
    type: "STAGE",
    filiere: "ELECTRONIQUE",
    requiredSkills: ["ROS", "Arduino", "Vision industrielle", "OpenCV"],
    salary: "Gratification 650 TND",
    description: "Développement d'un bras robotisé pour contrôle qualité automobile.",
    postedDays: 2,
  },
];

/**
 * Calcule un score de compatibilité 0-100 entre un étudiant et une offre.
 * Basé sur : filière + recouvrement des skills déclarés.
 */
export function matchScore(
  offer: JobOffer,
  profile: {
    filiere?: string | null;
    skills?: { name: string }[];
  }
): number {
  let score = 0;

  // Filière (40 points)
  if (offer.filiere === "BOTH" || offer.filiere === profile.filiere) score += 40;
  else score += 10;

  // Skills (60 points max)
  const userSkills = (profile.skills ?? []).map((s) => s.name.toLowerCase());
  if (userSkills.length > 0 && offer.requiredSkills.length > 0) {
    const matched = offer.requiredSkills.filter((rs) =>
      userSkills.some(
        (us) => us.includes(rs.toLowerCase()) || rs.toLowerCase().includes(us)
      )
    ).length;
    score += Math.round((matched / offer.requiredSkills.length) * 60);
  }

  return Math.min(100, score);
}
