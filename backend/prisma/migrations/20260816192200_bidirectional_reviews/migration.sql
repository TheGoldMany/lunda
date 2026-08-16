-- DropIndex
DROP INDEX "Review_bookingId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_reviewerId_key" ON "Review"("bookingId", "reviewerId");
