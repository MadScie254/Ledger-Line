-- Add Allocation Tables to replace JSON appliedTo/billIds

-- PaymentReceived Allocation
CREATE TABLE "PaymentReceivedAllocation" (
    "id"                TEXT          NOT NULL,
    "paymentReceivedId" TEXT          NOT NULL,
    "invoiceId"         TEXT          NOT NULL,
    "amount"            DECIMAL(18,2) NOT NULL,
    CONSTRAINT "PaymentReceivedAllocation_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PaymentReceivedAllocation" ADD CONSTRAINT "PaymentReceivedAllocation_paymentReceivedId_fkey" FOREIGN KEY ("paymentReceivedId") REFERENCES "PaymentReceived"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentReceivedAllocation" ADD CONSTRAINT "PaymentReceivedAllocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- BillPayment Allocation
CREATE TABLE "BillPaymentAllocation" (
    "id"            TEXT          NOT NULL,
    "billPaymentId" TEXT          NOT NULL,
    "billId"        TEXT          NOT NULL,
    "amount"        DECIMAL(18,2) NOT NULL,
    CONSTRAINT "BillPaymentAllocation_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "BillPaymentAllocation" ADD CONSTRAINT "BillPaymentAllocation_billPaymentId_fkey" FOREIGN KEY ("billPaymentId") REFERENCES "BillPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BillPaymentAllocation" ADD CONSTRAINT "BillPaymentAllocation_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop obsolete JSON columns
ALTER TABLE "PaymentReceived" DROP COLUMN "appliedTo";
ALTER TABLE "BillPayment" DROP COLUMN "billIds";
ALTER TABLE "BillPayment" DROP COLUMN "amount";
ALTER TABLE "BillPayment" DROP COLUMN "billId";
