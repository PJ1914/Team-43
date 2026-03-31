const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
});

const auth = admin.auth();
const db = admin.firestore();

const TEST_USERS = [
  {
    email: 'admin@bvrit.ac.in',
    password: 'admin123456',
    name: 'Dr. Admin User',
    department: 'CSE',
    role: 'admin'
  },
  {
    email: 'coordinator@bvrit.ac.in',
    password: 'coord123456',
    name: 'Dr. Coordinator User',
    department: 'ECE',
    role: 'coordinator'
  },
  {
    email: 'faculty@bvrit.ac.in',
    password: 'faculty123456',
    name: 'Prof. Faculty User',
    department: 'CSE(AI&ML)',
    role: 'faculty'
  }
];

async function seedUsers() {
  console.log('🚀 Starting user seeding...\n');

  for (const userData of TEST_USERS) {
    try {
      // Check if user already exists
      let user;
      try {
        user = await auth.getUserByEmail(userData.email);
        console.log(`⚠️  User ${userData.email} already exists, updating role...`);
      } catch (error) {
        // User doesn't exist, create it
        user = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.name,
        });
        console.log(`✓ Created user: ${userData.email}`);
      }

      // Create/update Firestore document
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: userData.email,
        name: userData.name,
        department: userData.department,
        role: userData.role,
      }, { merge: true });

      console.log(`✓ Set role "${userData.role}" for ${userData.email}\n`);

    } catch (error) {
      console.error(`❌ Error processing ${userData.email}:`, error.message);
    }
  }

  console.log('✅ User seeding complete!\n');
  console.log('═══════════════════════════════════════');
  console.log('TEST CREDENTIALS:');
  console.log('═══════════════════════════════════════');
  TEST_USERS.forEach(user => {
    console.log(`${user.role.toUpperCase().padEnd(12)} | ${user.email.padEnd(25)} | ${user.password}`);
  });
  console.log('═══════════════════════════════════════\n');

  process.exit(0);
}

seedUsers().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
