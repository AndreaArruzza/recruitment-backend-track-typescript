import { Invoice, InvoiceItem } from "@prisma/client";
import type {PageParameter,PageSizeParameter,CreatedId} from "../../api/dto";
import type { InvoiceFilter } from "../../shared/dto/invoice.type.dto";
import type { PaginationDto } from "../../shared/dto/pagination.dto";

export interface InvoiceRepository {
  findAll(filter: InvoiceFilter,
      page: PageParameter,
      pageSize: PageSizeParameter): Promise<PaginationDto>;
  findById(id: bigint): Promise<Invoice & { InvoiceItem: InvoiceItem[] } | null>;
  create(data: Partial<Omit<Invoice, "id" | "createdAt" | "updatedAt">>, items: InvoiceItem[]): Promise<CreatedId>;
  updateById(data: Partial<Invoice> & { id: bigint }): Promise<Invoice>;
  deleteById(id: bigint): Promise<void>;
}