-- CreateTable
CREATE TABLE "UserVerification" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" INTEGER NOT NULL,

    CONSTRAINT "UserVerification_pkey" PRIMARY KEY ("id")
);
