import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

/**
 * Cloud Function: Validate and process new bookings
 * Prevents double-booking by checking date availability before confirming
 */
export const processBooking = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snapshot, context) => {
    const booking = snapshot.data();
    const bookingId = context.params.bookingId;

    console.log(`Processing new booking: ${bookingId}`);

    try {
      // Check if the date is already booked
      const existingBookings = await db
        .collection('bookings')
        .where('hallId', '==', booking.hallId)
        .where('date', '==', booking.date)
        .where('status', 'in', ['pending', 'confirmed'])
        .get();

      // Filter out the current booking
      const otherBookings = existingBookings.docs.filter((doc) => doc.id !== bookingId);

      if (otherBookings.length > 0) {
        // Date is already booked - cancel this booking
        await snapshot.ref.update({
          status: 'cancelled',
          cancellationReason: 'This date was already booked by another customer.',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Booking ${bookingId} cancelled due to double booking`);

        // Send notification to customer (if notification tokens exist)
        await sendNotification(
          booking.userId,
          'Booking Unavailable',
          `Sorry, ${booking.date} is no longer available. Please choose another date.`
        );

        return;
      }

      // Update hall's booked dates
      const hallRef = db.collection('halls').doc(booking.hallId);
      await hallRef.update({
        bookedDates: admin.firestore.FieldValue.arrayUnion(booking.date),
        availableDates: admin.firestore.FieldValue.arrayRemove(booking.date),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send confirmation notification to customer
      await sendNotification(
        booking.userId,
        'Booking Received',
        `Your booking for ${booking.hallName} on ${booking.date} has been received and is pending confirmation.`
      );

      // Send notification to hall owner
      const hall = await hallRef.get();
      if (hall.exists) {
        const hallData = hall.data();
        if (hallData?.ownerId) {
          await sendNotification(
            hallData.ownerId,
            'New Booking Request',
            `New booking request for ${booking.date} from ${booking.userName}`
          );
        }
      }

      console.log(`Booking ${bookingId} processed successfully`);
    } catch (error) {
      console.error(`Error processing booking ${bookingId}:`, error);
      throw error;
    }
  });

/**
 * Cloud Function: Handle booking status changes
 * Updates hall availability when bookings are confirmed or cancelled
 */
export const onBookingStatusChange = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const bookingId = context.params.bookingId;

    // Only process if status changed
    if (before.status === after.status) {
      return;
    }

    console.log(`Booking ${bookingId} status changed: ${before.status} -> ${after.status}`);

    try {
      const hallRef = db.collection('halls').doc(after.hallId);

      if (after.status === 'cancelled') {
        // Remove from booked dates, add back to available
        await hallRef.update({
          bookedDates: admin.firestore.FieldValue.arrayRemove(after.date),
          availableDates: admin.firestore.FieldValue.arrayUnion(after.date),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Notify customer
        await sendNotification(
          after.userId,
          'Booking Cancelled',
          after.cancellationReason
            ? `Your booking for ${after.date} has been cancelled: ${after.cancellationReason}`
            : `Your booking for ${after.date} has been cancelled.`
        );
      } else if (after.status === 'confirmed') {
        // Notify customer
        await sendNotification(
          after.userId,
          'Booking Confirmed! 🎉',
          `Your booking for ${after.hallName} on ${after.date} has been confirmed!`
        );
      } else if (after.status === 'completed') {
        // Mark booking as completed
        await sendNotification(
          after.userId,
          'Thank You!',
          `We hope you had a wonderful event at ${after.hallName}! We'd love to hear your feedback.`
        );
      }

      console.log(`Booking ${bookingId} status update processed`);
    } catch (error) {
      console.error(`Error handling booking status change ${bookingId}:`, error);
      throw error;
    }
  });

/**
 * Cloud Function: Cleanup old pending bookings
 * Runs daily to cancel pending bookings that are more than 48 hours old
 */
export const cleanupPendingBookings = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    console.log('Running cleanup of old pending bookings');

    try {
      const oldPendingBookings = await db
        .collection('bookings')
        .where('status', '==', 'pending')
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(twoDaysAgo))
        .get();

      const batch = db.batch();
      let count = 0;

      for (const doc of oldPendingBookings.docs) {
        batch.update(doc.ref, {
          status: 'cancelled',
          cancellationReason: 'Booking expired - no response within 48 hours',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        count++;
      }

      if (count > 0) {
        await batch.commit();
        console.log(`Cancelled ${count} expired pending bookings`);
      } else {
        console.log('No expired bookings to cleanup');
      }
    } catch (error) {
      console.error('Error cleaning up pending bookings:', error);
      throw error;
    }
  });

/**
 * Cloud Function: Send booking reminder
 * Runs daily to send reminders for bookings happening tomorrow
 */
export const sendBookingReminders = functions.pubsub
  .schedule('every day 09:00')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Sending reminders for bookings on ${tomorrowStr}`);

    try {
      const upcomingBookings = await db
        .collection('bookings')
        .where('date', '==', tomorrowStr)
        .where('status', '==', 'confirmed')
        .get();

      for (const doc of upcomingBookings.docs) {
        const booking = doc.data();
        await sendNotification(
          booking.userId,
          'Reminder: Your Event is Tomorrow! 📅',
          `Don't forget - your event at ${booking.hallName} is tomorrow!`
        );
      }

      console.log(`Sent ${upcomingBookings.size} booking reminders`);
    } catch (error) {
      console.error('Error sending booking reminders:', error);
      throw error;
    }
  });

/**
 * Helper function to send push notifications
 */
async function sendNotification(
  userId: string,
  title: string,
  body: string
): Promise<void> {
  try {
    // Store notification in Firestore
    await db.collection('notifications').add({
      userId,
      title,
      message: body,
      type: 'booking',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Get user's FCM tokens (if web push is set up)
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const fcmTokens = userData?.fcmTokens || [];

      if (fcmTokens.length > 0) {
        const message = {
          notification: { title, body },
          tokens: fcmTokens,
        };

        try {
          await admin.messaging().sendEachForMulticast(message);
          console.log(`Push notification sent to user ${userId}`);
        } catch (fcmError) {
          console.log(`FCM error (non-critical): ${fcmError}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * HTTP Function: Health check endpoint
 */
export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

