/*
  Warnings:

  - Made the column `codProduct` on table `InvoiceItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."InvoiceItem" ALTER COLUMN "codProduct" SET NOT NULL;
