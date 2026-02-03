-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
