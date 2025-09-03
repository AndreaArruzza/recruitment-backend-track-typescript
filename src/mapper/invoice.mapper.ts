import {
  Invoice,
  InvoiceStatus,
  PrismaClient,
  InvoiceItem,
} from "@prisma/client";
import { SharedMapper } from "./shared.mapper";
import type { Request } from "express";
import type { InvoiceResponse } from "../api/dto";
import { NotFoundError, ConflictError } from "../error/http-errors";
import {
  InvoiceFilter,
  InvoiceCreateRequest,
  InvoiceUpdateRequest,
} from "../shared/dto/invoice.type.dto";

export class InvoiceMapper extends SharedMapper {
  static fromInvoiceRequestToFilterDto = (req: Request): InvoiceFilter => {
    const filter: InvoiceFilter = {
      customerId:  req.query.customerId != undefined ? InvoiceMapper.convertId(req.query.customerId as string): undefined,
      status: req.query.status as any | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      invoiceNumber: req.query.invoiceNumber as BigInt | undefined,
      amountMin: req.query.amountMin as string | undefined,
      amountMax: req.query.amountMax as string | undefined,
    };

    return filter;
  };

  static toInvoiceResponse(
    invoice: Invoice & { InvoiceItem: InvoiceItem[] }
  ): InvoiceResponse {
    return {
      idInvoice: invoice.id.toString(),
      invoiceNumber: invoice.invoiceNumber.toString(),
      status: invoice.status as InvoiceStatus,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
      billToCustomerId:
        invoice.billToCustomerId != null
          ? invoice.billToCustomerId.toString()
          : null,
      billToCustomerTaxProfileId:
        invoice.billToCustomerTaxProfileId != null
          ? invoice.billToCustomerTaxProfileId.toString()
          : null,
      shipToCustomerId: invoice.shipToCustomerId
        ? invoice.shipToCustomerId.toString()
        : null,
      shipToCustomerTaxProfileId: invoice.shipToCustomerTaxProfileId
        ? invoice.shipToCustomerTaxProfileId.toString()
        : null,
      currency: invoice.currency,
      subtotal: invoice.subtotal.toString(),
      taxTotal: invoice.taxTotal.toString(),
      grandTotal: invoice.grandTotal.toString(),
      paymentMethod: invoice.paymentMethod,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      items:
        invoice.InvoiceItem?.map((u) => ({
          codProduct: u.codProduct.toString(),
          description: u.description,
          lineTotal: u.lineTotal.toString(),
          invoiceId: u.invoiceId.toString(),
          quantity: u.quantity.toString(),
          taxRate: u.taxRate.toString(),
          unitPrice: u.unitPrice.toString(),
        })) ?? [],
    };
  }

  static toPaginatedInvoices = (
    data: any,
    page: number,
    pageSize: number,
    total: number
  ) => ({
    data: data.map((invoice: Invoice & { InvoiceItem: InvoiceItem[]}) => this.toInvoiceResponse),
    page,
    pageSize,
    total,
  });

  static editCreateRequestInvoice(
    input: InvoiceCreateRequest,
  ): Partial<Invoice> {
    const status: any = input.status ?? InvoiceStatus.DRAFT;
    const now = new Date();
    const issueDate = input.issueDate ? new Date(input.issueDate) : now;
    const dueDate = input.dueDate != null ? new Date(input.dueDate) : undefined;
    const currency = input.currency ?? "EUR";
    const { items, ...rest } = input;

    return {
      ...rest,
      issueDate,
      dueDate,
      currency,
      status,
    };
  }

  static createUpdateDto(
    id: bigint,
    input: InvoiceUpdateRequest
  ): Partial<Invoice> & { id: bigint } {
    const { items, ...rest } = input;
    return { id, ...rest };
  }

  static async checkUserExists(
    taxProfileId: bigint,
    userId: bigint,
    prisma: PrismaClient
  ) {
    const exists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!exists)
      throw new NotFoundError(
        "Issuer user not found",
        `issuerUserId => ${userId.toString()}`
      );
   await this.assertUserTaxProfileExistsForUser(taxProfileId, userId, prisma);
  }

  static async assertUserTaxProfileExistsForUser(
    taxProfileId: bigint,
    userId: bigint,
    prisma: PrismaClient
  ) {
    const tp = await prisma.userTaxProfile.findUnique({
      where: { id: taxProfileId },
      select: { id: true, userId: true },
    });
    if (!tp)
      throw new NotFoundError(
        "Issuer tax profile not found",
        `issuerTaxProfileId => ${taxProfileId}`
      );
    if (tp.userId != userId) {
      throw new ConflictError(
        "Issuer tax profile does not belong to issuer user",
        `issuerTaxProfileId => ${taxProfileId}, issuerUserId => ${userId.toString()}`
      );
    }
  }

  static async checkCustomerExists(
    customerId: bigint,
    customerTaxProfileId: bigint,
    prisma: PrismaClient
  ) {
    const exists = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundError("Customer not found =>", customerId);
      await this.assertCustomerTaxProfileExistsForCustomer(
        customerTaxProfileId,
        customerId,
        prisma
      );
  }

  static async assertCustomerTaxProfileExistsForCustomer(
    customerTaxProfileId: bigint,
    customerId: bigint,
    prisma: PrismaClient
  ) {
    const ctp = await prisma.customerTaxProfile.findUnique({
      where: { id: customerTaxProfileId },
      select: { id: true, customerId: true },
    });
    if (!ctp)
      throw new NotFoundError(
        "Customer tax profile not found",
        customerTaxProfileId
      );
    if (ctp.customerId != customerId) {
      throw new ConflictError(
        "Customer tax profile does not belong to the specified customer",
        customerId.toString()
      );
    }
  }
}
