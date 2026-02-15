
import { db } from "~/server/db";

async function main() {
  console.log("Checking Venues...");
  const venues = await db.venue.findMany({
    include: {
      hotel: true,
    }
  });

  console.log(`Total Venues: ${venues.length}`);

  for (const venue of venues) {
    console.log(`Venue: ${venue.name} (ID: ${venue.id})`);
    console.log(`  - isActive: ${venue.isActive}`);
    console.log(`  - Hotel: ${venue.hotel.name} (ID: ${venue.hotel.id})`);
    console.log(`  - Hotel isVerified: ${venue.hotel.isVerified}`);
    console.log(`  - Hotel isDeactivated: ${venue.hotel.isDeactivated}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
