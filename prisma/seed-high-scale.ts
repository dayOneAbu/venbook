import "dotenv/config";
import pg from "pg";
const { Pool } = pg;

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({
  connectionString,
  ssl: true, 
});

const HOTEL_THEMES = [
  { name: "SkyLight Hotel", subdomain: "skylight", location: "Addis Ababa" },
  { name: "Hilton Addis", subdomain: "hilton", location: "Addis Ababa" },
  { name: "Sheraton Addis", subdomain: "sheraton", location: "Addis Ababa" },
  { name: "Haile Resort", subdomain: "haile", location: "Hawassa" },
  { name: "Kuriftu Resort", subdomain: "kuriftu", location: "Bishoftu" },
  { name: "Harmony Hotel", subdomain: "harmony", location: "Addis Ababa" },
  { name: "Jupiter International", subdomain: "jupiter", location: "Addis Ababa" },
  { name: "Radisson Blu", subdomain: "radisson", location: "Addis Ababa" },
  { name: "Elilly International", subdomain: "elilly", location: "Addis Ababa" },
  { name: "Golden Tulip", subdomain: "golden", location: "Addis Ababa" },
];

const STAFF_ROLES = ["HOTEL_ADMIN", "SALES", "OPERATIONS", "FINANCE"];

async function main() {
  console.log("🚀 Starting High-Scale Seeding...");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("🧹 Cleaning up database...");
    await client.query(`TRUNCATE TABLE 
      "notification", "invite", "payment", "booking_resource", "booking", 
      "resource", "venue_amenity", "venue_image", "venue", "amenity", 
      "customer"
      CASCADE`);
    
    // Non-cascade cleanup to preserve users with accounts
    await client.query(`UPDATE "hotel" SET "ownerId" = NULL`);
    await client.query(`DELETE FROM "hotel"`);
    await client.query(`DELETE FROM "user" WHERE id NOT IN (SELECT "userId" FROM "account")`);

    // 1. Create Super Admin (Upsert)
    console.log("👤 Creating/Updating Super Admin...");
    await client.query(
      `INSERT INTO "user" (id, name, email, role, "emailVerified", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET role = $4, "emailVerified" = $5, "updatedAt" = NOW()`,
      [`u-admin`, "System Admin", "admin@venbook.com", "SUPER_ADMIN", true]
    );

    // 2. Create Hotels and Staff
    const hotelIds: string[] = [];
    const staffIds: string[] = [];

    for (const theme of HOTEL_THEMES) {
      console.log(`🏨 Creating ${theme.name}...`);
      const hotelId = `h-${theme.subdomain}`;
      hotelIds.push(hotelId);

      // Create Hotel
      await client.query(
        `INSERT INTO "hotel" (id, name, subdomain, location, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET name = $2, subdomain = $3, location = $4`,
        [hotelId, theme.name, theme.subdomain, theme.location]
      );

      // Create/Update Owner
      const ownerEmail = `owner@${theme.subdomain}.com`;
      await client.query(
        `INSERT INTO "user" (id, name, email, role, "hotelId", "emailVerified", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (email) DO UPDATE SET role = $4, "hotelId" = $5, "emailVerified" = $6`,
        [`u-owner-${theme.subdomain}`, `${theme.name} Owner`, ownerEmail, "HOTEL_ADMIN", hotelId, true]
      );
      
      const ownerRes = await client.query<{ id: string }>(`SELECT id FROM "user" WHERE email = $1`, [ownerEmail]);
      const ownerId = ownerRes.rows[0]!.id;
      
      await client.query(`UPDATE "hotel" SET "ownerId" = $1 WHERE id = $2`, [ownerId, hotelId]);

      // Create 8+ Staff members (Upsert)
      for (let i = 1; i <= 8; i++) {
        const role = STAFF_ROLES[i % STAFF_ROLES.length];
        const staffEmail = `staff${i}@${theme.subdomain}.com`;
        const staffId = `u-staff-${theme.subdomain}-${i}`;
        
        await client.query(
          `INSERT INTO "user" (id, name, email, role, "hotelId", "emailVerified", "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           ON CONFLICT (email) DO UPDATE SET role = $4, "hotelId" = $5, "emailVerified" = $6`,
          [staffId, `${theme.name} Staff ${i}`, staffEmail, role, hotelId, true]
        );
        
        const staffRes = await client.query<{ id: string }>(`SELECT id FROM "user" WHERE email = $1`, [staffEmail]);
        staffIds.push(staffRes.rows[0]!.id);
      }

      // Create Venues for each hotel
      const venueCount = 3 + Math.floor(Math.random() * 3);
      for (let j = 1; j <= venueCount; j++) {
        const venueId = `v-${theme.subdomain}-${j}`;
        const slug = `${theme.subdomain}-ballroom-${j}`;
        await client.query(
          `INSERT INTO "venue" (id, "hotelId", name, description, "capacityBanquet", "capacityTheater", "basePrice", slug, "isActive", "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
          [venueId, hotelId, `${theme.name} Ballroom ${j}`, "A grand space for events.", 500, 700, 1500 + j * 100, slug, true]
        );
      }
    }

    // 3. Create 10+ Customers
    console.log("👥 Creating Customers...");
    const customerIds: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const customerId = `c-customer-${i}`;
      customerIds.push(customerId);
      const randomHotelId = hotelIds[i % hotelIds.length];
      await client.query(
        `INSERT INTO "customer" (id, "hotelId", "companyName", "tinNumber", type, "contactName", email, phone, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [customerId, randomHotelId, `Corp ${i}`, `TIN${i}000`, "COMPANY", `Contact ${i}`, `client${i}@example.com`, `+2519110000${i.toString().padStart(2, "0")}`]
      );
    }

    // 4. Create 150+ Bookings
    console.log("📅 Generating 150+ Bookings...");
    for (let i = 1; i <= 160; i++) {
        const randomHotelId = hotelIds[i % hotelIds.length]!;
        const randomCustomerId = customerIds[i % customerIds.length]!;
        const randomStaffId = staffIds[i % staffIds.length]!;
        
        // Find a venue for this hotel
        const venues = await client.query<{ id: string }>(`SELECT id FROM "venue" WHERE "hotelId" = $1`, [randomHotelId]);
        const venueId = venues.rows[0]?.id;

        if (!venueId) continue;

        const bookingId = `b-booking-${i}`;
        const bookingNumber = `BK-2026-${i.toString().padStart(4, "0")}`;
        const status = i % 10 === 0 ? "CANCELLED" : i % 5 === 0 ? "TENTATIVE" : i % 8 === 0 ? "EXECUTED" : "CONFIRMED";
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (i % 30));
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 4);

        await client.query(
          `INSERT INTO "booking" (
            id, "bookingNumber", "hotelId", "customerId", "venueId", "createdById", "assignedToId", 
            status, "eventName", "eventDate", "startTime", "endTime", "guestCount", 
            "basePrice", "serviceCharge", "vat", "totalAmount", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())`,
          [
            bookingId, bookingNumber, randomHotelId, randomCustomerId, venueId, randomStaffId, randomStaffId, 
            status, `Event ${i}`, startDate, startDate, endDate, 100 + (i % 50), 
            1500, 150, 225, 1875
          ]
        );

        // 5. Generate Notifications for staff
        if (i % 3 === 0) {
            await client.query(
                `INSERT INTO "notification" (id, "userId", title, message, type, "isRead", "createdAt", "updatedAt") 
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                [`n-notif-${i}`, randomStaffId, "New Booking Received", `A new booking has been created for venue ${venueId}.`, "info", false]
            );
        }
    }

    // 6. Generate Invites
    console.log("📧 Generating Invites...");
    for (let i = 1; i <= 20; i++) {
        const randomHotelId = hotelIds[i % hotelIds.length]!;
        const inviteId = `inv-${i}`;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await client.query(
            `INSERT INTO "invite" (id, email, role, "hotelId", token, "expiresAt", "createdAt", "updatedAt") 
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [inviteId, `new-staff-${i}@example.com`, "SALES", randomHotelId, `token-${i}`, expiresAt]
        );
    }

    await client.query("COMMIT");
    console.log("✅ High-Scale Seeding completed successfully!");
    console.log("🔑 All accounts use Password: password123 (Auth managed separately, ensure Better Auth accounts exist for these emails)");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

void main();
