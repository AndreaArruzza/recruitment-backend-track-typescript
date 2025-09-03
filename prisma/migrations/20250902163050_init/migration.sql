-- DropIndex
DROP INDEX "public"."InvoiceItem_invoice_id_key";

-- AlterTable
ALTER TABLE "public"."Invoice" ALTER COLUMN "due_date" DROP NOT NULL,
ALTER COLUMN "billToCustomerId" DROP NOT NULL,
ALTER COLUMN "billToCustomerTaxProfileId" DROP NOT NULL;
