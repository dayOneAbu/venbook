
import { db } from "~/server/db";

async function main() {
  console.log("Fixing Venues...");
  const updateHotels = await db.hotel.updateMany({
    data: {
        isVerified: true,
        isDeactivated: false,
    }
  });
  console.log(`Updated ${updateHotels.count} hotels to be verified and active.`);

  const updateVenues = await db.venue.updateMany({
    data: {
        isActive: true,
    }
  });

  console.log(`Updated ${updateVenues.count} venues to be active.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
