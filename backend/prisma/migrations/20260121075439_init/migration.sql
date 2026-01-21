-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");
