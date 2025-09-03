import {
  Prisma,
  PrismaClient,
  type Invoice,
  InvoiceItem
} from "@prisma/client";
import type { PageParameter, PageSizeParameter } from "../api/dto";
import type { PaginationDto } from "../shared/dto/pagination.dto";
import type { InvoiceFilter } from "../shared/dto/invoice.type.dto";
import type { InvoiceRepository } from "./interface/invoice.repository";
import { InvoiceMapper } from "../mapper/invoice.mapper";
import { Decimal } from "@prisma/client/runtime/client";


export class InvoiceRepositoryImpl implements InvoiceRepository {
  constructor(private prisma = new PrismaClient()) {}

  // pagination helpers
  private toSkipTake = (page = 1, pageSize = 10) => ({
    skip: Math.max(0, (page - 1) * pageSize),
    take: pageSize,
  });

  private whereCondition(filter: InvoiceFilter = {}): Prisma.InvoiceWhereInput {
    const where: Prisma.InvoiceWhereInput = {};
    const or: Prisma.InvoiceWhereInput[] = [];

    if (filter.customerId !== undefined && filter.customerId !== null) {
      const cid =
        typeof filter.customerId === "bigint"
          ? filter.customerId
          : InvoiceMapper.parseBigInt(filter.customerId as any);
      if (cid !== undefined) {
        or.push({ billToCustomerId: cid }, { shipToCustomerId: cid });
      }
    }

    if (or.length) where.OR = or;

    // status
    if (filter.status) where.status = filter.status as any;

    // date range su issueDate
    const gte = InvoiceMapper.parseDate(filter.dateFrom);
    const lte = InvoiceMapper.parseDate(filter.dateTo);
    if (gte || lte) {
      where.issueDate = {};
      if (gte) (where.issueDate as Prisma.DateTimeFilter).gte = gte;
      if (lte) (where.issueDate as Prisma.DateTimeFilter).lte = lte;
    }

    // invoiceNumber (exact match: il campo in DB è BigInt)
    if (filter.invoiceNumber !== undefined && filter.invoiceNumber !== null) {
      const invNum =
        typeof filter.invoiceNumber === "bigint"
          ? filter.invoiceNumber
          : InvoiceMapper.parseBigInt(filter.invoiceNumber as any);
      if (invNum !== undefined) {
        where.invoiceNumber = invNum;
      }
    }

    // range su grandTotal (Decimal)
    const min = InvoiceMapper.parseDecimal(filter.amountMin as any);
    const max = InvoiceMapper.parseDecimal(filter.amountMax as any);
    if (min || max) {
      where.grandTotal = {};
      if (min) (where.grandTotal as Prisma.DecimalFilter).gte = min;
      if (max) (where.grandTotal as Prisma.DecimalFilter).lte = max;
    }

    return where;
  }

  // --- queries -----------------------------------------------------
  findAll = async (
    filter: InvoiceFilter,
    page: PageParameter,
    pageSize: PageSizeParameter
  ): Promise<PaginationDto<Invoice & { InvoiceItem: InvoiceItem[] }>> => {
    const p = page ?? 1;
    const ps = pageSize ?? 20;
    const where = this.whereCondition(filter);

    const [rows, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        ...this.toSkipTake(p, ps),
        orderBy: { issueDate: "desc" },
        include: {
          InvoiceItem: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: rows,
      page: p,
      pageSize: ps,
      total,
    };
  };

  findById = async (
    id: bigint
  ): Promise<(Invoice & { InvoiceItem: InvoiceItem[] }) | null> => {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        InvoiceItem: true,
      },
    });
  };

  create = async (
    data: Partial<Omit<Invoice, "id" | "createdAt" | "updatedAt">>,
    items: InvoiceItem[]
  ): Promise<{ id: string }> => {
    const created = await this.prisma.invoice.create({
      data: data as any,
      select: { id: true },
    });

    if (items != undefined && items.length >= 0) {
      await this.prisma.$transaction([
        this.prisma.invoiceItem.createMany({
          data: items.map((it) => ({
            invoiceId: BigInt(created.id),
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
    return { id: created.id.toString() };
  };

  updateById = async (
    data: Partial<Invoice> & { id: bigint }
  ): Promise<Invoice & { InvoiceItem: InvoiceItem[] }> => {
    const { id, ...rest } = data;
    return this.prisma.invoice.update({
      where: { id },
      data: rest as any,
      include: {
        InvoiceItem: true,
      },
    });
  };

  deleteById = async (id: bigint): Promise<void> => {
    await this.prisma.invoice.delete({ where: { id } });
  };
}
