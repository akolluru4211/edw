import { prisma, firebaseAuth } from '../lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import axios from 'axios';

export interface MockOpening {
  title: string;
  companyName: string;
  companyType: 'STARTUP' | 'ENTERPRISE';
  location: string;
  salary?: string;
  remote: boolean;
  type: 'JOB' | 'INTERNSHIP';
  skillsRequired: string[];
  description: string;
  externalLink?: string;
}

// 1. Hybrid E2EE Encryption Helper for Node.js
// Matches browser-side CryptoJS E2EE hybrid decryption packet layout
export function encryptHybridNode(plaintext: string, recipientPublicKeyBase64: string): string {
  try {
    // A. Generate random 256-bit AES key for the message
    const aesKey = crypto.randomBytes(32);

    // B. Encrypt the raw AES key using the recipient's RSA public key (RSA-OAEP with SHA-256)
    const recipientPublicKeyDer = Buffer.from(recipientPublicKeyBase64, 'base64');
    const encryptedAesKey = crypto.publicEncrypt({
      key: crypto.createPublicKey({
        key: recipientPublicKeyDer,
        type: 'spki',
        format: 'der'
      }),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, aesKey);

    // C. Generate random 12-byte IV
    const iv = crypto.randomBytes(12);

    // D. Encrypt the message text with the AES key (AES-256-GCM)
    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);
    const authTag = cipher.getAuthTag();

    // Browser Web Crypto appends the 16-byte authentication tag at the end of the ciphertext
    const ciphertextWithTag = Buffer.concat([ciphertext, authTag]);

    // E. Return JSON matching E2EE hybrid structure
    return JSON.stringify({
      ek: encryptedAesKey.toString('base64'),
      iv: iv.toString('base64'),
      ct: ciphertextWithTag.toString('base64')
    });
  } catch (error) {
    console.error('Node hybrid encryption error:', error);
    return JSON.stringify({ error: 'Node encryption failed' });
  }
}

// 2. High-Quality Seed Openings dataset
const MOCK_OPENINGS: MockOpening[] = [];

// 3. Ingestion Sync Pipeline (seeding Google, Stripe, Microsoft, Meta, and Amazon jobs if empty)
export const syncDailyOpportunities = async () => {
  try {
    const count = await prisma.opportunity.count()
    if (count > 0) {
      console.log('RAG Pipeline Ingestion: Opportunities already exist. Skipping automatic seeding.');
      return;
    }

    console.log('RAG Pipeline Ingestion: Seeding top tech company opportunities...');
    await prisma.opportunity.createMany({
      data: [
        {
          title: 'Software Engineering Intern',
          companyName: 'Google',
          companyType: 'ENTERPRISE',
          location: 'Mountain View, CA',
          salary: '$45 - $55 / hr',
          remote: true,
          type: 'INTERNSHIP',
          skillsRequired: JSON.stringify(['JavaScript', 'TypeScript', 'Python', 'SQL']),
          description: 'Work on Google Cloud Platform frontend development, building intuitive console layouts and API analytics interfaces.'
        },
        {
          title: 'Backend Engineer',
          companyName: 'Stripe',
          companyType: 'ENTERPRISE',
          location: 'San Francisco, CA',
          salary: '$130,000 - $160,000 / yr',
          remote: false,
          type: 'JOB',
          skillsRequired: JSON.stringify(['Node.js', 'SQL', 'TypeScript', 'Git', 'Docker', 'System Design']),
          description: 'Scale core billing and subscription APIs. You will design database schemas, write migrations, and optimize payment processing latency.'
        },
        {
          title: 'Software Engineer',
          companyName: 'Microsoft',
          companyType: 'ENTERPRISE',
          location: 'Redmond, WA',
          salary: '$120,000 - $150,000 / yr',
          remote: false,
          type: 'JOB',
          skillsRequired: JSON.stringify(['TypeScript', 'React', 'Node.js', 'CI/CD']),
          description: 'Build premium web experiences within the Microsoft 365 developer suite. Implement glassmorphic layouts, optimize startup performance, and automate CI/CD workflows.'
        },
        {
          title: 'Frontend Engineer',
          companyName: 'Meta',
          companyType: 'ENTERPRISE',
          location: 'Menlo Park, CA',
          salary: '$140,000 - $170,000 / yr',
          remote: false,
          type: 'JOB',
          skillsRequired: JSON.stringify(['React', 'JavaScript', 'Git', 'TypeScript']),
          description: 'Develop web interfaces for the Ads Manager platform. Create high-fidelity design system components, prioritize performance budgets, and build micro-animations.'
        },
        {
          title: 'Software Development Engineer Intern',
          companyName: 'Amazon',
          companyType: 'ENTERPRISE',
          location: 'Seattle, WA',
          salary: '$40 - $50 / hr',
          remote: true,
          type: 'INTERNSHIP',
          skillsRequired: JSON.stringify(['Python', 'SQL', 'Docker', 'System Design']),
          description: 'Design automated supply-chain routing and fulfillment models. You will write robust analytics jobs and scale containerized services.'
        }
      ]
    });
    console.log('RAG Pipeline Ingestion: Seeding completed successfully.');
  } catch (error) {
    console.error('Failed to sync daily opportunities:', error);
  }
};

// 4. Seeding real-world peer users (Only Gitam Admin seeded for production setup)
export const seedRealUsers = async () => {
  try {
    console.log('RAG Pipeline: Verifying admin user in network...');
    
    const mockUsers = [
      {
        email: 'edworld.eden@gmail.com',
        fullName: 'Adarsh Kolluru',
        role: 'ADMIN',
        memberId: 'EDW-AKOL-1928',
        password: '123456789',
        profile: {
          collegeName: 'GITAM University',
          degree: 'Bachelor of Technology',
          branch: 'Computer Science and Engineering',
          graduationYear: 2026,
          headline: 'Workspace Administrator',
          interests: JSON.stringify(['Systems Development', 'Cloud Architecture']),
          goals: JSON.stringify(['Manage Edworld workspace']),
          bio: 'System administrator for the Edworld career development space.',
          readinessScore: 100,
          latitude: 17.7816,
          longitude: 83.3777
        }
      }
    ];

    for (const mu of mockUsers) {
      const rawPassword = mu.password || 'Pass1234!';
      const passwordHash = bcrypt.hashSync(rawPassword, 10);

      // Register/sync user in Firebase Auth first so they appear in dashboard
      let firebaseUserId: string | null = null;
      try {
        const fbUser = await firebaseAuth.createUser({
          email: mu.email,
          password: rawPassword,
          displayName: mu.fullName
        });
        firebaseUserId = fbUser.uid;
        console.log(`Seeded user ${mu.email} registered in Firebase Auth with ID: ${firebaseUserId}`);
      } catch (err: any) {
        if (err.code === 'auth/email-already-exists') {
          try {
            const fbUser = await firebaseAuth.getUserByEmail(mu.email);
            firebaseUserId = fbUser.uid;
            console.log(`Seeded user ${mu.email} already registered in Firebase Auth with ID: ${firebaseUserId}`);
          } catch (fetchErr: any) {
            console.error(`Failed to fetch existing Firebase Auth user ${mu.email}:`, fetchErr.message);
          }
        } else {
          console.error(`Failed to register seeded user ${mu.email} in Firebase Auth:`, err.message);
        }
      }

      if (!firebaseUserId) {
        console.error(`Could not resolve Firebase UID for ${mu.email}, skipping.`);
        continue;
      }

      // Check if local user record already exists with the CORRECT Firebase UID
      const existingById = await prisma.user.findUnique({ where: { id: firebaseUserId } });
      if (existingById) {
        // User already exists with correct ID — check if profile also exists
        const existingProfile = await prisma.profile.findUnique({ where: { userId: firebaseUserId } });
        if (existingProfile) {
          console.log(`Seeded user ${mu.email} already fully provisioned, skipping recreation.`);
          continue;
        }
        // Profile missing — just create it
        await prisma.profile.create({ data: { userId: firebaseUserId, ...mu.profile } });
        console.log(`Seeded missing profile for existing user: ${mu.fullName}`);
        continue;
      }

      // User exists with a different/old ID — clean up stale records
      const existingByEmail = await prisma.user.findUnique({ where: { email: mu.email } });
      if (existingByEmail) {
        try {
          // Purge ALL orphaned profiles for this old userId first
          await prisma.profile.deleteMany({ where: { userId: existingByEmail.id } });
          await prisma.user.delete({ where: { id: existingByEmail.id } });
          console.log(`Deleted stale local user record for E2EE / ID alignment: ${mu.email}`);
        } catch (delErr) {
          console.error(`Failed to delete stale user ${mu.email}:`, delErr);
        }
      }

      // Generate RSA SPKI key pair for E2EE
      const { publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'der'
        }
      });
      const publicKeyBase64 = publicKey.toString('base64');

      const user = await prisma.user.create({
        data: {
          id: firebaseUserId,
          email: mu.email,
          fullName: mu.fullName,
          role: mu.role,
          memberId: mu.memberId,
          passwordHash,
          publicKey: publicKeyBase64
        }
      });

      await prisma.profile.create({
        data: {
          userId: user.id,
          ...mu.profile
        }
      });
      console.log(`Seeded user profile: ${mu.fullName}`);
    }
    console.log('Real network users check completed.');
  } catch (error) {
    console.error('Failed to seed real users:', error);
  }
};

// 5. Local RAG Retrieval-Augmented Generation Recommendation Engine
export const getRecommendationsForUser = async (userId: string) => {
  try {
    // A. Retrieve: Fetch user profile, skills, projects, and experiences
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { skills: true, projects: true, experience: true }
    });

    if (!profile) {
      const list = await prisma.opportunity.findMany({ orderBy: { createdAt: 'desc' } });
      return list.map(op => ({
        ...op,
        skillsRequired: JSON.parse(op.skillsRequired),
        matchScore: 50,
        matchExplanation: 'Complete your profile skills and projects to unlock personalized AI matching.'
      }));
    }

    const userSkills = profile.skills.map(s => s.name.toLowerCase());
    const userHeadline = (profile.headline || '').toLowerCase();
    const userBio = (profile.bio || '').toLowerCase();
    const userProjects = profile.projects.map(p => `${p.title} ${p.description} ${p.technologies}`.toLowerCase()).join(' ');
    const userExperience = profile.experience.map(e => `${e.company} ${e.role} ${e.description}`.toLowerCase()).join(' ');

    const combinedProfileText = `${userHeadline} ${userBio} ${userProjects} ${userExperience} ${userSkills.join(' ')}`;

    // B. Retrieve Opportunities
    const list = await prisma.opportunity.findMany({ orderBy: { createdAt: 'desc' } });

    // C. Score & Generate
    return list.map(op => {
      let skillsRequired: string[] = [];
      try {
        skillsRequired = JSON.parse(op.skillsRequired);
      } catch {
        skillsRequired = [];
      }

      const opTitle = op.title.toLowerCase();
      const opDesc = op.description.toLowerCase();
      const opSkillsStr = skillsRequired.join(' ').toLowerCase();

      // Math A: Skills Match Coefficient (0.0 to 1.0)
      let skillMatchesCount = 0;
      if (skillsRequired.length > 0) {
        skillMatchesCount = skillsRequired.filter(s => userSkills.includes(s.toLowerCase())).length;
      }
      const skillCoefficient = skillsRequired.length > 0 ? (skillMatchesCount / skillsRequired.length) : 0.5;

      // Math B: Semantic Overlap Coefficient (0.0 to 1.0)
      const keywordSet = `${opTitle} ${opDesc} ${opSkillsStr}`.split(/\W+/).filter(w => w.length > 3);
      let semanticMatchesCount = 0;
      keywordSet.forEach(word => {
        if (combinedProfileText.includes(word)) {
          semanticMatchesCount++;
        }
      });
      const semanticCoefficient = keywordSet.length > 0 ? (semanticMatchesCount / keywordSet.length) : 0.5;

      // Combine weights: 65% skills matching + 35% general semantic description matching
      let score = Math.round((skillCoefficient * 0.65 + semanticCoefficient * 0.35) * 100);
      score = isNaN(score) ? 50 : Math.min(99, Math.max(35, score));

      // D. Generate customized response paragraph matching the specific credentials
      const matchingSkills = skillsRequired.filter(s => userSkills.includes(s.toLowerCase()));
      
      let matchedProjTitle = '';
      for (const proj of profile.projects) {
        let techArr: string[] = [];
        try { techArr = JSON.parse(proj.technologies || '[]'); } catch { techArr = []; }
        const matched = techArr.some(t => opSkillsStr.includes(t.toLowerCase()) || opDesc.includes(t.toLowerCase()));
        if (matched) {
          matchedProjTitle = proj.title;
          break;
        }
      }

      let matchExplanation = '';
      if (matchingSkills.length > 0) {
        matchExplanation += `You have strong technical synergy for this role due to your verified background in **${matchingSkills.slice(0, 3).join(', ')}**. `;
      } else {
        matchExplanation += `This role presents a great development opportunity. Expanding your skillset in **${skillsRequired.slice(0, 2).join(' and ')}** would optimize your fit. `;
      }

      if (matchedProjTitle) {
        matchExplanation += `Your project **"${matchedProjTitle}"** demonstrates relevant project experience implementing these tools. `;
      }

      if (op.companyType === 'STARTUP') {
        matchExplanation += `As a **Startup**, ${op.companyName} values speed of deployment, adaptability, and cross-functional ownership. Your portfolio indicates the self-starter drive required for this team.`;
      } else {
        matchExplanation += `As a **Big Tech Enterprise**, ${op.companyName} focuses on large-scale architectures, clean systems testing, and collaborative engineering frameworks. Your foundations are a great fit for their cohort.`;
      }

      return {
        ...op,
        skillsRequired,
        matchScore: score,
        matchExplanation
      };
    });

  } catch (error) {
    console.error('RAG matching error:', error);
    return [];
  }
};
