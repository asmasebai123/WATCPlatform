/**
 * Seed de la base WATC — domaines & compétences techniques (cahier des charges §3.3 étape 2)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DOMAINS: {
  slug: string;
  name: string;
  icon: string;
  skills: { slug: string; name: string }[];
}[] = [
  {
    slug: "ia-ml",
    name: "Intelligence Artificielle & Machine Learning",
    icon: "Brain",
    skills: [
      { slug: "python", name: "Python" },
      { slug: "tensorflow", name: "TensorFlow" },
      { slug: "pytorch", name: "PyTorch" },
      { slug: "scikit-learn", name: "Scikit-learn" },
      { slug: "keras", name: "Keras" },
      { slug: "langchain", name: "LangChain" },
    ],
  },
  {
    slug: "data-science",
    name: "Data Science",
    icon: "BarChart3",
    skills: [
      { slug: "pandas", name: "Pandas" },
      { slug: "numpy", name: "NumPy" },
      { slug: "powerbi", name: "Power BI" },
      { slug: "tableau", name: "Tableau" },
      { slug: "sql", name: "SQL" },
      { slug: "spark", name: "Spark" },
    ],
  },
  {
    slug: "web",
    name: "Développement Web",
    icon: "Globe",
    skills: [
      { slug: "html-css", name: "HTML/CSS" },
      { slug: "react", name: "React" },
      { slug: "vue", name: "Vue" },
      { slug: "angular", name: "Angular" },
      { slug: "nodejs", name: "Node.js" },
      { slug: "django", name: "Django" },
      { slug: "laravel", name: "Laravel" },
    ],
  },
  {
    slug: "mobile",
    name: "Développement Mobile",
    icon: "Smartphone",
    skills: [
      { slug: "flutter", name: "Flutter" },
      { slug: "react-native", name: "React Native" },
      { slug: "swift", name: "Swift" },
      { slug: "kotlin", name: "Kotlin" },
      { slug: "dart", name: "Dart" },
    ],
  },
  {
    slug: "cybersec",
    name: "Cybersécurité",
    icon: "ShieldCheck",
    skills: [
      { slug: "kali", name: "Kali Linux" },
      { slug: "wireshark", name: "Wireshark" },
      { slug: "metasploit", name: "Metasploit" },
      { slug: "pentesting", name: "Pentesting" },
      { slug: "cryptography", name: "Cryptographie" },
    ],
  },
  {
    slug: "cloud-devops",
    name: "Cloud & DevOps",
    icon: "Cloud",
    skills: [
      { slug: "aws", name: "AWS" },
      { slug: "azure", name: "Azure" },
      { slug: "gcp", name: "GCP" },
      { slug: "docker", name: "Docker" },
      { slug: "kubernetes", name: "Kubernetes" },
      { slug: "cicd", name: "CI/CD" },
      { slug: "terraform", name: "Terraform" },
    ],
  },
  {
    slug: "database",
    name: "Base de données",
    icon: "Database",
    skills: [
      { slug: "mysql", name: "MySQL" },
      { slug: "postgresql", name: "PostgreSQL" },
      { slug: "mongodb", name: "MongoDB" },
      { slug: "redis", name: "Redis" },
      { slug: "firebase", name: "Firebase" },
    ],
  },
  {
    slug: "network",
    name: "Réseaux & Systèmes",
    icon: "Network",
    skills: [
      { slug: "tcpip", name: "TCP/IP" },
      { slug: "linux", name: "Linux" },
      { slug: "cisco", name: "Cisco" },
      { slug: "vlan", name: "VLAN" },
      { slug: "vpn", name: "VPN" },
    ],
  },
  {
    slug: "embedded",
    name: "Électronique & Embarqué",
    icon: "Cpu",
    skills: [
      { slug: "arduino", name: "Arduino" },
      { slug: "raspberry-pi", name: "Raspberry Pi" },
      { slug: "fpga", name: "FPGA" },
      { slug: "vhdl", name: "VHDL" },
      { slug: "proteus", name: "Proteus" },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding WATC database...");

  // 1) Domaines et compétences
  for (const [idx, d] of DOMAINS.entries()) {
    const domain = await prisma.skillDomain.upsert({
      where: { slug: d.slug },
      update: { name: d.name, icon: d.icon, order: idx },
      create: { slug: d.slug, name: d.name, icon: d.icon, order: idx },
    });
    for (const s of d.skills) {
      await prisma.skill.upsert({
        where: { domainId_slug: { domainId: domain.id, slug: s.slug } },
        update: { name: s.name },
        create: { domainId: domain.id, slug: s.slug, name: s.name },
      });
    }
  }
  console.log(`   ✓ ${DOMAINS.length} domaines seedés`);

  // 2) Compte administrateur de démonstration
  const adminEmail = "admin@watc.tn";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash("watc-demo-2025", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        username: "admin",
        passwordHash,
        role: "ADMIN",
        firstName: "Admin",
        lastName: "WATC",
      },
    });
    console.log(`   ✓ Admin créé : ${adminEmail} / watc-demo-2025`);
  }

  console.log("✅ Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
