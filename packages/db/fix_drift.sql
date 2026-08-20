-- DropForeignKey
ALTER TABLE "BillPayment" DROP CONSTRAINT "BillPayment_paymentAccountId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentReceived" DROP CONSTRAINT "PaymentReceived_depositAccountId_fkey";

-- AlterTable
ALTER TABLE "Bill" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "emails" DROP DEFAULT,
ALTER COLUMN "phones" DROP DEFAULT,
ALTER COLUMN "tags" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PaymentReceived" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SavedReport" ALTER COLUMN "recipients" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "emails" DROP DEFAULT,
ALTER COLUMN "phones" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

