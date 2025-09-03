/*

import { PrismaClient, Prisma, UserTaxProfile } from "@prisma/client";
import { ITaxProfileRepository, TaxProfileListFilter } from "./interface/tax-profile.repository";
// Se hai un NotFoundError custom come per User:
import { NotFoundError } from "../error/http-errors"; // aggiorna il path in base al tuo progetto

const prisma = new PrismaClient();

export class TaxProfileRepository implements ITaxProfileRepository {
  private toWhere(filter: TaxProfileListFilter): Prisma.UserTaxProfileWhereInput {
    const where: Prisma.UserTaxProfileWhereInput = {};

    if (filter.userId) where.userId = filter.userId;
    if (filter.type) where.type = filter.type as any; // cast a enum del client
    if (typeof filter.isActive === "boolean") (where as any).isActive = filter.isActive; // se esiste su schema
    if (filter.city) where.city = { contains: filter.city, mode: "insensitive" };

    return where;
  }

  async findAll(filter: TaxProfileListFilter) {
    const page = Math.max(1, Number(filter.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(filter.pageSize ?? 20)));
    const where = this.toWhere(filter);

    const [data, total] = await prisma.$transaction([
      prisma.userTaxProfile.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.userTaxProfile.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<UserTaxProfile> {
    const found = await prisma.userTaxProfile.findUnique({ where: { id } });
    if (!found) throw new NotFoundError("UserTaxProfile not found");
    return found;
  }

  async create(dto: Prisma.UserTaxProfileCreateInput): Promise<string> {
    const created = await prisma.userTaxProfile.create({ data: dto });
    return created.id;
  }

  update(id: string, dto: Prisma.UserTaxProfileUpdateInput): Promise<UserTaxProfile> {
    return prisma.userTaxProfile.update({ where: { id }, data: dto });
  }

  async delete(id: string): Promise<void> {
    await prisma.userTaxProfile.delete({ where: { id } });
  }
}
*/