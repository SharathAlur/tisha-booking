/**
 * Sample Data Seed Script for Tisha Booking
 * 
 * Run this script to populate Firestore with sample data:
 * 1. Install ts-node: npm install -g ts-node
 * 2. Set up Firebase Admin credentials
 * 3. Run: ts-node scripts/seedData.ts
 * 
 * Or use Firebase Console to manually add this data.
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin (update path to your service account key)
// const serviceAccount = require('./serviceAccountKey.json');
// initializeApp({ credential: cert(serviceAccount as ServiceAccount) });

// For local testing without service account, use this:
initializeApp();

const db = getFirestore();

// Generate dates for the next 3 months
function generateDates(startDate: Date, months: number): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(startDate);
  end.setMonth(end.getMonth() + months);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Sample hall data
const sampleHall = {
  name: 'Tisha Grand Hall',
  description: `Welcome to Tisha Grand Hall, the premier venue for your most cherished celebrations. 
  
Our magnificent 10,000 sq ft hall features soaring ceilings adorned with crystal chandeliers, elegant marble flooring, and floor-to-ceiling windows that flood the space with natural light. The versatile layout accommodates everything from intimate gatherings of 50 to grand celebrations of 500 guests.

The venue includes a fully equipped professional kitchen, dedicated bridal suite, groom's room, and ample backstage area for entertainers. Our state-of-the-art audio-visual system ensures your event sounds and looks spectacular.

Located in the heart of the city with easy access to major highways and public transit, Tisha Grand Hall offers convenience alongside luxury. Complimentary valet parking is available for all guests.

Whether you're planning a wedding, corporate event, birthday celebration, or any special occasion, our dedicated team is committed to making your event unforgettable.`,
  shortDescription: 'Elegant 10,000 sq ft venue perfect for weddings, receptions, and corporate events. Features crystal chandeliers, marble floors, and state-of-the-art amenities.',
  address: '123 Celebration Avenue',
  city: 'Mumbai',
  state: 'Maharashtra',
  zipCode: '400001',
  capacity: 500,
  squareFeet: 10000,
  amenities: [
    { id: 'wifi', name: 'High-Speed WiFi', icon: 'wifi', included: true },
    { id: 'parking', name: 'Valet Parking', icon: 'parking', included: true },
    { id: 'kitchen', name: 'Professional Kitchen', icon: 'kitchen', included: true },
    { id: 'sound', name: 'Sound System', icon: 'sound', included: true },
    { id: 'ac', name: 'Central AC', icon: 'ac', included: true },
    { id: 'outdoor', name: 'Outdoor Garden', icon: 'outdoor', included: true },
    { id: 'bridal', name: 'Bridal Suite', icon: 'bridal', included: true },
    { id: 'stage', name: 'Built-in Stage', icon: 'stage', included: true },
    { id: 'lighting', name: 'Event Lighting', icon: 'lighting', included: true },
    { id: 'security', name: '24/7 Security', icon: 'security', included: true },
  ],
  images: [
    {
      url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200',
      alt: 'Tisha Grand Hall main view',
      isPrimary: true,
    },
    {
      url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200',
      alt: 'Wedding setup',
      isPrimary: false,
    },
    {
      url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200',
      alt: 'Reception area',
      isPrimary: false,
    },
  ],
  pricing: {
    basePrice: 75000,
    currency: '₹',
    pricePerHour: 5000,
    minimumHours: 4,
    weekendMultiplier: 0.2,
    holidayMultiplier: 0.5,
  },
  contactEmail: 'bookings@tishahall.com',
  contactPhone: '+91 98765 43210',
  rules: [
    'No smoking inside the venue',
    'Outside catering allowed with prior approval',
    'Decoration must be removed within 2 hours after event',
    'Music must stop by 10:00 PM as per local regulations',
    'Security deposit of ₹25,000 required (refundable)',
    'Cancellation within 7 days: 50% refund',
    'Cancellation within 48 hours: No refund',
  ],
  isActive: true,
  ownerId: 'owner-uid-placeholder', // Replace with actual owner UID after creating owner account
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

// Generate available dates (next 3 months, excluding some random "booked" dates)
const today = new Date();
today.setHours(0, 0, 0, 0);
const allDates = generateDates(today, 3);

// Simulate some booked dates (random 10% of dates)
const bookedDates = allDates
  .filter(() => Math.random() < 0.1)
  .slice(0, 15);

// Remaining dates are available
const availableDates = allDates.filter(
  (date) => !bookedDates.includes(date) && new Date(date) > today
);

// Add blocked dates (maintenance days - first Monday of each month)
const blockedDates: string[] = [];
for (let i = 0; i < 3; i++) {
  const date = new Date(today);
  date.setMonth(date.getMonth() + i);
  date.setDate(1);
  // Find first Monday
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() + 1);
  }
  blockedDates.push(date.toISOString().split('T')[0]);
}

async function seedData() {
  console.log('Starting data seed...');

  try {
    // Create sample hall
    const hallData = {
      ...sampleHall,
      availableDates: availableDates.slice(0, 50), // Limit to 50 dates for initial seed
      bookedDates,
      blockedDates,
    };

    const hallRef = await db.collection('halls').add(hallData);
    console.log(`Created hall with ID: ${hallRef.id}`);

    // Create sample bookings for the booked dates
    for (let i = 0; i < Math.min(bookedDates.length, 5); i++) {
      const bookingDate = bookedDates[i];
      const sampleBooking = {
        hallId: hallRef.id,
        hallName: sampleHall.name,
        userId: `sample-user-${i}`,
        userEmail: `customer${i}@example.com`,
        userName: `Sample Customer ${i + 1}`,
        userPhone: `+91 98765 4321${i}`,
        date: bookingDate,
        status: i < 2 ? 'confirmed' : 'pending',
        details: {
          eventType: ['wedding', 'reception', 'birthday', 'corporate', 'engagement'][i % 5],
          guestCount: 100 + i * 50,
          specialRequests: 'Please arrange for vegetarian catering',
          gasCylinderRequired: 2,
        },
        totalAmount: 75000 + (i * 10000),
        depositAmount: (75000 + (i * 10000)) * 0.3,
        depositPaid: i < 2,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const bookingRef = await db.collection('bookings').add(sampleBooking);
      console.log(`Created booking with ID: ${bookingRef.id} for date: ${bookingDate}`);
    }

    console.log('\n✅ Data seed completed successfully!');
    console.log(`\nSummary:`);
    console.log(`- Hall created: ${sampleHall.name}`);
    console.log(`- Available dates: ${availableDates.length}`);
    console.log(`- Booked dates: ${bookedDates.length}`);
    console.log(`- Blocked dates: ${blockedDates.length}`);
    console.log(`- Sample bookings: 5`);
    console.log(`\nHall ID: ${hallRef.id}`);
    console.log(`\nNote: Update the hall's ownerId field with the actual owner's UID after creating an owner account.`);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Run seed
seedData().then(() => process.exit(0));

