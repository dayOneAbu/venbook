import "dotenv/config";
import pg from "pg";
const { Pool } = pg;
import { parse } from "pg-connection-string";

const connectionString = `${process.env.DATABASE_URL}`;
const config = parse(connectionString);
const pool = new Pool({
  user: config.user,
  password: config.password,
  host: config.host ?? "localhost",
  port: Number(config.port) ?? 5432,
  database: config.database ?? "venbook",
  ssl: true,
});

const CITIES = ["Addis Ababa", "Hawassa", "Bishoftu", "Bahir Dar", "Gondar", "Mekelle", "Dire Dawa", "Adama", "Jimma", "Arba Minch"];
const HOTEL_TYPES = ["Resort", "Hotel", "Lodge", "Spa", "International", "Palace", "Plaza", "Grand", "Star", "Suites"];

function generateHotelThemes(count: number) {
  const themes = [];
  for (let i = 1; i <= count; i++) {
    const city = CITIES[i % CITIES.length];
    const type = HOTEL_TYPES[i % HOTEL_TYPES.length];
    const name = `Grand ${city} ${type} ${i}`;
    const subdomain = `hotel-${i}-${city?.toLowerCase().replace(/\s+/g, "")}`;
    themes.push({ name, subdomain, location: city });
  }
  return themes;
}

const HOTEL_THEMES = generateHotelThemes(30);
const STAFF_ROLES = ["HOTEL_ADMIN", "SALES", "OPERATIONS", "FINANCE", "SALES", "OPERATIONS", "SALES", "OPERATIONS", "FINANCE", "SALES"]; // 10 roles

async function main() {
  console.log("🚀 Starting Massive Seeding (30 Hotels, 300 Staff, 30+ Customers)...");
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
    // Ideally we would keep existing users but for massive seed clean state is safer to avoid conflicts
    // But let's try to keep accounts if possible, or just wipe for this massive test
    // User requested "seed", usually implies adding to or resetting. Let's reset non-admin users to ensure clean state.
    // Keeping Super Admin is good practice.
    await client.query(`DELETE FROM "user" WHERE role != 'SUPER_ADMIN'`);

    // 1. Create Super Admin (Upsert) - ensure it exists
    console.log("👤 Ensuring Super Admin...");
    await client.query(
      `INSERT INTO "user" (id, name, email, role, "emailVerified", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET role = $4, "emailVerified" = $5, "updatedAt" = NOW()`,
      [`u-admin`, "System Admin", "admin@venbook.com", "SUPER_ADMIN", true]
    );

    // Ensure account for super admin
    const adminHash = "119483710dd9905835d41691c2de1b59:eaefd909f006976f5632e70c95c486706b66a947ef5690ccca5023ece7380e039a42bc9ee4902ec50a88d15bf3f0e053641b0091a5e4d8acb9e4020ed65152c0";
    await client.query(
      `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [`acc-u-admin`, "admin@venbook.com", "credential", `u-admin`, adminHash]
    );

    // 2. Create Hotels and Staff
    const hotelIds: string[] = [];
    const staffIds: string[] = [];

    let hotelCount = 0;
    for (const theme of HOTEL_THEMES) {
      hotelCount++;
      console.log(`🏨 Creating Hotel ${hotelCount}/${HOTEL_THEMES.length}: ${theme.name}...`);
      const hotelId = `h-${theme.subdomain}`;
      hotelIds.push(hotelId);

      // Create Hotel
      await client.query(
        `INSERT INTO "hotel" (id, name, subdomain, location, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET name = $2, subdomain = $3, location = $4`,
        [hotelId, theme.name, theme.subdomain, theme.location]
      );

      // Create Owner
      const ownerEmail = `owner@${theme.subdomain}.com`;
      await client.query(
        `INSERT INTO "user" (id, name, email, role, "hotelId", "emailVerified", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (email) DO UPDATE SET role = $4, "hotelId" = $5, "emailVerified" = $6`,
        [`u-owner-${theme.subdomain}`, `${theme.name} Owner`, ownerEmail, "HOTEL_ADMIN", hotelId, true]
      );
      
      // Create Owner Account
      await client.query(
        `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [`acc-u-owner-${theme.subdomain}`, ownerEmail, "credential", `u-owner-${theme.subdomain}`, adminHash]
      );
      
      const ownerRes = await client.query<{ id: string }>(`SELECT id FROM "user" WHERE email = $1`, [ownerEmail]);
      const ownerId = ownerRes.rows[0]!.id;
      
      await client.query(`UPDATE "hotel" SET "ownerId" = $1 WHERE id = $2`, [ownerId, hotelId]);

      // Create 10 Staff members
      for (let i = 1; i <= 10; i++) {
        const role = STAFF_ROLES[(i - 1) % STAFF_ROLES.length];
        const staffEmail = `staff${i}@${theme.subdomain}.com`;
        const staffId = `u-staff-${theme.subdomain}-${i}`;
        
        await client.query(
          `INSERT INTO "user" (id, name, email, role, "hotelId", "emailVerified", "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           ON CONFLICT (email) DO UPDATE SET role = $4, "hotelId" = $5, "emailVerified" = $6`,
          [staffId, `${theme.name} Staff ${i}`, staffEmail, role, hotelId, true]
        );
        
        // Create Staff Account
        await client.query(
          `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING`,
          [`acc-${staffId}`, staffEmail, "credential", staffId, adminHash]
        );
        
        const staffRes = await client.query<{ id: string }>(`SELECT id FROM "user" WHERE email = $1`, [staffEmail]);
        staffIds.push(staffRes.rows[0]!.id);
      }

      // Create 7-15 Venues per Hotel
      const venueCount = 7 + Math.floor(Math.random() * 9); // 7 to 15
      for (let j = 1; j <= venueCount; j++) {
        const venueId = `v-${theme.subdomain}-${j}`;
        const slug = `${theme.subdomain}-venue-${j}`;
        const capacity = 100 + Math.floor(Math.random() * 900);
        const price = 5000 + Math.floor(Math.random() * 45000);
        
        await client.query(
          `INSERT INTO "venue" (id, "hotelId", name, description, "capacityBanquet", "capacityTheater", "basePrice", slug, "isActive", "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
          [venueId, hotelId, `${theme.name} Venue ${j}`, "A premium space for events.", capacity, capacity + 200, price, slug, true]
        );
        
        // Add random images (placeholders)
        await client.query(
           `INSERT INTO "venue_image" (id, url, "venueId", "order") VALUES ($1, $2, $3, $4)`,
           [`img-${venueId}-1`, "/images/hero-ballroom.png", venueId, 0]
        );
      }
    }

    // 3. Create 30 Customers
    console.log("👥 Creating 30 Customers...");
    const customerIds: string[] = [];
    for (let i = 1; i <= 30; i++) {
      const customerId = `c-customer-${i}`;
      customerIds.push(customerId);
      const randomHotelId = hotelIds[i % hotelIds.length];
      await client.query(
        `INSERT INTO "customer" (id, "hotelId", "companyName", "tinNumber", type, "contactName", email, phone, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [customerId, randomHotelId, `Corp ${i}`, `TIN${i}000`, "COMPANY", `Contact ${i}`, `client${i}@example.com`, `+2519110000${i.toString().padStart(2, "0")}`]
      );
      
      // Also create a USER account for this customer so they can log in
      const customerUserEmail = `client${i}@example.com`;
      await client.query(
          `INSERT INTO "user" (id, name, email, role, "emailVerified", "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           ON CONFLICT (email) DO NOTHING`,
          [`u-customer-${i}`, `Contact ${i}`, customerUserEmail, "CUSTOMER", true]
      );

      // Create Customer Account
      await client.query(
        `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [`acc-u-customer-${i}`, customerUserEmail, "credential", `u-customer-${i}`, adminHash]
      );
    }

    // 4. Generate Varied Bookings (Some confirmed, some pending, etc.)
    console.log("📅 Generating Varied Bookings...");
    // Let's generate a substantial amount of bookings distributed across venues
    // Aim for ~5 bookings per hotel on average, maybe more
    for (let i = 1; i <= 300; i++) {
        const randomHotelId = hotelIds[i % hotelIds.length]!;
        const randomCustomerId = customerIds[i % customerIds.length]!;
        const randomStaffId = staffIds[i % staffIds.length]!; // Creator
        
        // Find a venue for this hotel
        const venues = await client.query<{ id: string }>(`SELECT id FROM "venue" WHERE "hotelId" = $1 ORDER BY RANDOM() LIMIT 1`, [randomHotelId]);
        const venueId = venues.rows[0]?.id;

        if (!venueId) continue;

        const bookingId = `b-booking-${i}`;
        const bookingNumber = `BK-2026-${i.toString().padStart(4, "0")}`;
        
        // Varied Status
        const statuses = ["INQUIRY", "TENTATIVE", "CONFIRMED", "EXECUTED", "COMPLETED", "CANCELLED"];
        const status = statuses[i % statuses.length];
        
        const startDate = new Date();
        const offsetDay = (i % 60) - 10; // Some in past, mostly in future
        startDate.setDate(startDate.getDate() + offsetDay);
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
            status, `Event ${i} - ${status}`, startDate, startDate, endDate, 50 + (i % 200), 
            5000, 500, 750, 6250
          ]
        );
    }

    // 5. Generate Amenities
    console.log("🛠️ Generating Amenities...");
    const amenityNames = ["WiFi", "Projector", "Sound System", "Catering", "Parking", "AC", "Stage", "Flipchart"];
    const amenityIds: string[] = [];
    for (const name of amenityNames) {
        const id = `amenity-${name.toLowerCase().replace(/\s+/g, "-")}`;
        await client.query(`INSERT INTO "amenity" (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [id, name]);
        amenityIds.push(id);
    }

    // Link Amenities to Venues
    const venuesRes = await client.query<{ id: string }>(`SELECT id FROM "venue"`);
    for (const venue of venuesRes.rows) {
        // Randomly assign 2-5 amenities per venue
        const shuffled = [...amenityIds].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 2 + Math.floor(Math.random() * 4));
        for (const amenityId of selected) {
            await client.query(
                `INSERT INTO "venue_amenity" ("venueId", "amenityId") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [venue.id, amenityId]
            );
        }
    }

    // 6. Generate Resources per Hotel
    console.log("📦 Generating Resources...");
    for (const hotelId of hotelIds) {
        const resources = [
            { name: "Extra Chairs", qty: 200 },
            { name: "Wireless Mic", qty: 4 },
            { name: "Laptop", qty: 2 },
            { name: "Coffee Machine", qty: 1 }
        ];
        for (const res of resources) {
            await client.query(
                `INSERT INTO "resource" (id, "hotelId", name, quantity) VALUES ($1, $2, $3, $4)`,
                [`res-${hotelId}-${res.name.toLowerCase().replace(/\s+/g, "-")}`, hotelId, res.name, res.qty]
            );
        }
    }

    // 7. Generate Payments and Booking Resources
    console.log("💰 Generating Payments and linking Resources to Bookings...");
    const bookingsRes = await client.query<{ id: string, status: string, "totalAmount": number, "hotelId": string }>(
        `SELECT id, status, "totalAmount", "hotelId" FROM "booking"`
    );
    for (const booking of bookingsRes.rows) {
        // Only pay for Confirmed/Executed/Completed
        if (["CONFIRMED", "EXECUTED", "COMPLETED"].includes(booking.status)) {
            const paymentId = `p-pay-${booking.id}`;
            const methods = ["CASH", "BANK_TRANSFER", "TELEBIRR", "MPESA"];
            const method = methods[Math.floor(Math.random() * methods.length)];
            await client.query(
                `INSERT INTO "payment" (id, "bookingId", amount, method, "createdAt", "updatedAt") 
                 VALUES ($1, $2, $3, $4, NOW(), NOW())`,
                [paymentId, booking.id, booking.totalAmount, method]
            );
        }

        // Assign some resources to bookings
        const hotelResources = await client.query<{ id: string }>(
            `SELECT id FROM "resource" WHERE "hotelId" = $1 LIMIT 2`, [booking.hotelId]
        );
        for (const hRes of hotelResources.rows) {
            await client.query(
                `INSERT INTO "booking_resource" ("bookingId", "resourceId", quantity) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
                [booking.id, hRes.id, 1 + Math.floor(Math.random() * 5)]
            );
        }
    }

    // 8. Generate Notifications and Audit Logs
    console.log("🔔 Generating Notifications and Audit Logs...");
    for (const hotelId of hotelIds) {
        const hotelStaff = await client.query<{ id: string }>(
            `SELECT id FROM "user" WHERE "hotelId" = $1 LIMIT 5`, [hotelId]
        );
        for (const staff of hotelStaff.rows) {
            // Notifications
            await client.query(
                `INSERT INTO "notification" (id, "userId", title, message, type, "createdAt", "updatedAt") 
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
                [`notif-${staff.id}-${Date.now()}`, staff.id, "New Booking Received", "A new booking has been created for your venue.", "info"]
            );

            // Audit Logs
            await client.query(
                `INSERT INTO "audit_log" (id, "actorId", "hotelId", action, resource, details, "createdAt") 
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [`audit-${staff.id}-${Date.now()}`, staff.id, hotelId, "CREATE_BOOKING", "booking", "Staff created a new booking manually.",]
            );
        }
    }

    await client.query("COMMIT");
    console.log("✅ Massive Seeding completed successfully!");
    console.log("🔑 Staff Emails: staff[1-10]@[subdomain].com");
    console.log("🔑 Owner Emails: owner@[subdomain].com");
    console.log("🔑 Customer Emails: client[1-30]@example.com");
    console.log("🔑 Password: password123 (for all)");
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
