import type { InvoiceStatus, PaymentMethod } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";


export type InvoiceFilter = {
   customerId? : BigInt,
   status? : InvoiceStatus,
   dateFrom?: string,
   dateTo?: string ,
   invoiceNumber?: BigInt,
   amountMin?: string,
   amountMax?: string,
};

export type InvoiceCreateRequest = {
  status: InvoiceStatus | null;
  invoiceNumber: bigint;
  issueDate?: Date;
  dueDate?: Date | null;
  issuerUserId: bigint;
  issuerTaxProfileId: bigint;
  billToCustomerId?: bigint;
  billToCustomerTaxProfileId?: bigint;
  shipToCustomerId?: bigint | null;
  shipToCustomerTaxProfileId?: bigint | null;
  currency: string;
  subtotal: Decimal;
  taxTotal: Decimal;
  grandTotal: Decimal;
  paymentMethod?: PaymentMethod;
  items?: InvoiceItemInput[];
};


export type InvoiceUpdateRequest = {
  issueDate: Date;
  dueDate: Date | undefined;
  currency: string;
  paymentMethod: PaymentMethod | undefined;

  billToCustomerId?: bigint ;
  billToCustomerTaxProfileId?: bigint;
  shipToCustomerId?: bigint | null;
  shipToCustomerTaxProfileId?: bigint | null;

  subtotal: Decimal;
  taxTotal: Decimal;
  grandTotal: Decimal;

  items?: InvoiceItemInput[]; 
};


export type InvoicePatchRequest = Partial<InvoiceUpdateRequest> & {
  finalize?: boolean;
  markPaid?: {
    paymentMethod: PaymentMethod;
    paidAt?: string; 
    amount?: string; 
  };
};


export type InvoiceItemInput = {
  invoiceId: BigInt;
  description: string;
  quantity: Decimal | string | number;
  unitPrice:Decimal | string | number;
  taxRate?: Decimal | string | number | null;
  codProduct:  String;
  lineTotal:   Decimal;
};

