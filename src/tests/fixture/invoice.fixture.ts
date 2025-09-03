import { Decimal } from "@prisma/client/runtime/library";
import type { InvoiceItemInput} from "../../shared/dto/invoice.type.dto";


export const invoiceItems= () : InvoiceItemInput[] => ([
  { invoiceId: BigInt(234), codProduct: "djdjd", description: "Riga A", quantity: "2", unitPrice: new Decimal (5.00), taxRate: new Decimal (0.22), lineTotal: new Decimal (122.00)},
  { invoiceId: BigInt(235), codProduct: "djddddjd", description: "Riga B", quantity: "1", unitPrice: new Decimal (10.00), taxRate: new Decimal (0.22), lineTotal: new Decimal (12.20)},
]);

export const validCreateDto = (issuerUserId: bigint, issuerTaxProfileId: bigint, withCustomer = true, withItems = true) => {
  const base: any = {
    issueDate: new Date().toISOString(),
    currency: "EUR",
    status: "DRAFT",
    issuerUserId: issuerUserId.toString(),
    issuerTaxProfileId: issuerTaxProfileId.toString(),
    subtotal: "160.00",
    taxTotal: "35.20",
    grandTotal: "195.20",
    invoiceNumber: 123455
  };
  if (withCustomer) {
    base.billToCustomerId = undefined;    
    base.billToCustomerTaxProfileId = undefined;
  }
  if (withItems) base.items = invoiceItems();
  return base;
};