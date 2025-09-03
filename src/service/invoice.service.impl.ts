import type { InvoiceService } from "./interface/invoice.service";
import { InvoiceRepositoryImpl } from "../repository/invoice.repository.impl";
import { PrismaClient } from "@prisma/client";
import type { Invoice, InvoiceItem} from "@prisma/client";
import {
  InvoiceResponse,
  PageParameter,
  PageSizeParameter,
  PaginatedInvoices,
} from "../api/dto";
import { logger } from "../shared/logger";
import { InvoiceMapper } from "../mapper/invoice.mapper";
import type {
  InvoiceFilter,
  InvoiceCreateRequest,
  InvoiceUpdateRequest,
} from "./../shared/dto/invoice.type.dto";
import {
  BadRequestError,
  NotFoundError,
} from "../error/http-errors";
import { Decimal } from "@prisma/client/runtime/client";

export class InvoiceServiceImpl implements InvoiceService {
  constructor(
    private readonly repository = new InvoiceRepositoryImpl(),
    private prisma = new PrismaClient()
  ) {}

  private log = logger.child({ module: "InvoiceServiceImpl" });

  getInvoices = async (
    page: PageParameter,
    pageSize: PageSizeParameter,
    filter: InvoiceFilter
  ): Promise<PaginatedInvoices> => {
    this.log.debug(
      { page, pageSize, filter },
      "repository findAll (invoices)..."
    );
    const pageResult = await this.repository.findAll(filter, page, pageSize);
    this.log.debug(
      { total: pageResult.total, returned: pageResult.data.length },
      "repository findAll (invoices) OK"
    );

    return {
      ...pageResult,
      data: pageResult.data.map((invoice: Invoice & { InvoiceItem: InvoiceItem[]}) =>
        InvoiceMapper.toInvoiceResponse(invoice)),
    };
  };


  getInvoiceById = async (id: bigint): Promise<InvoiceResponse> => {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      this.log.error({ id }, "Invoice Not Found");
      throw new NotFoundError("Invoice not found", "id => " + id);
    }

    this.log.debug({ id }, "getInvoiceById OK");
    return  InvoiceMapper.toInvoiceResponse(invoice);
  };

  createInvoice = async (
    input: InvoiceCreateRequest
  ): Promise<{ id: string }> => {
    await InvoiceMapper.checkUserExists(
      input.issuerTaxProfileId,
      input.issuerUserId,
      this.prisma
    );

    if (!input.billToCustomerId || !input.billToCustomerTaxProfileId) {
        throw new BadRequestError(
          "Customer and Customer Tax Profile are required"
        );
      }
      await InvoiceMapper.checkCustomerExists(
        input.billToCustomerId,
        input.billToCustomerTaxProfileId,
        this.prisma
    );
    

     const created = await this.repository.create(
      InvoiceMapper.editCreateRequestInvoice(input), input.items as InvoiceItem[]
    );

    this.log.debug({ id: created.id }, "createInvoice OK");
    return created;
  };

  updateInvoice = async (
    id: bigint,
    input: InvoiceUpdateRequest
  ): Promise<Invoice & {InvoiceItem: InvoiceItem[]  }> => {
    
  const currentInvoice = await this.repository.findById(id);
    if (!currentInvoice) { 
      this.log.error("Invoice Not Found, id =" + id  );
      throw new NotFoundError("Invoice not found", "id => " + id.toString() )
    };
    const hasCustomer = input.billToCustomerId != null;
    const hasCustomerTP = input.billToCustomerTaxProfileId != null;

    if (hasCustomer && hasCustomerTP) {
      await InvoiceMapper.checkCustomerExists(
        input.billToCustomerId as bigint,
        input.billToCustomerTaxProfileId as bigint,
        this.prisma
      );
    } else if (hasCustomer != hasCustomerTP) {
      throw new BadRequestError(
        "Both billToCustomerId and billToCustomerTaxProfileId must be provided together"
      );
    }

    const updated = await this.repository.updateById(
      InvoiceMapper.createUpdateDto(id, input)
    );

    const { items, ...rest } = input;
    if (items !== undefined && items.length >= 0) {
      await this.prisma.$transaction([
        this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
        this.prisma.invoiceItem.createMany({
          data: items.map((it) => ({
            invoiceId: id,
            codProduct: it.codProduct.toString(),
            description: it.description,
            quantity: Decimal(it.quantity as any),
            unitPrice: Decimal(it.unitPrice as any),
            taxRate: Decimal(it.taxRate as any),
            lineTotal: Decimal(it.lineTotal as any),
          })),
        }),
      ]);
    }
    return updated;
  };

  deleteInvoice = async (id:  bigint): Promise<void> => {
    const key = typeof id === "string" ? BigInt(id) : id;
    await this.prisma.$transaction([
      this.prisma.invoiceItem.deleteMany({ where: { invoiceId: key } }),
      this.prisma.invoice.delete({ where: { id: key } }),
    ]);
  };
}
