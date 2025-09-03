
import { Invoice, Prisma } from "@prisma/client";
import type {InvoiceFilter, InvoiceCreateRequest, InvoiceUpdateRequest, } from "../../shared/dto/invoice.type.dto";
import {PageParameter, PageSizeParameter, PaginatedInvoices, InvoiceResponse} from "../../api/dto";


export interface InvoiceService {
  getInvoices(page: PageParameter, pageSize: PageSizeParameter, filter: InvoiceFilter): Promise<PaginatedInvoices>;
  getInvoiceById(id: bigint): Promise<InvoiceResponse>;
  createInvoice(dto: InvoiceCreateRequest): Promise<{ id: string}>;
  updateInvoice(id: bigint, dto: InvoiceUpdateRequest): Promise<Invoice>;
  deleteInvoice(id: bigint): Promise<void>;
}
