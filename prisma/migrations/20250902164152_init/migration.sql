/*
  Warnings:

  - The values [VOID] on the enum `InvoiceStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."InvoiceStatus_new" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'CANCELED');
ALTER TABLE "public"."Invoice" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Invoice" ALTER COLUMN "status" TYPE "public"."InvoiceStatus_new" USING ("status"::text::"public"."InvoiceStatus_new");
ALTER TYPE "public"."InvoiceStatus" RENAME TO "InvoiceStatus_old";
ALTER TYPE "public"."InvoiceStatus_new" RENAME TO "InvoiceStatus";
DROP TYPE "public"."InvoiceStatus_old";
ALTER TABLE "public"."Invoice" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;
