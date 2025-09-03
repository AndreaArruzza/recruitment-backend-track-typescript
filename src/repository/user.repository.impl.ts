import { Prisma, PrismaClient, type User } from "@prisma/client";
import type {PageParameter,PageSizeParameter} from "../api/dto";
import type { UserFilter } from "../shared/dto/user.type.dto";
import type { PaginationDto } from "../shared/dto/pagination.dto";
import type { UserRepository } from "./interface/user.repository";


export class UserRepositoryImpl implements UserRepository {
  
  constructor(private  prisma = new PrismaClient()) {}

  private toSkipTake = (page = 1, pageSize = 10) => ({
    skip: Math.max(0, (page - 1) * pageSize),
    take: pageSize,
  });

  private whereCondition = (filter: UserFilter = {}): Prisma.UserWhereInput => {
    const { email, role, isEnabled, q } = filter;
    const where: Prisma.UserWhereInput = {};
    if (email) where.email = { contains: email, mode: "insensitive" };
    if (role) where.role = role;
    if (typeof isEnabled === "boolean") where.isEnabled = isEnabled;
    if (q)
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q } },
      ];
    return where;
  };

  findAll = async (filter: UserFilter, page: PageParameter, pageSize: PageSizeParameter):
   Promise<PaginationDto> => {
    page = page ?? 1;
    pageSize = pageSize ?? 10;
    const where = this.whereCondition(filter);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        ...this.toSkipTake(page, pageSize),
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    const paginatedUsers: PaginationDto = {
      data: users,
      pageSize: pageSize,
      page: page,
      total: total,
    };

    return paginatedUsers;
  }

  findById = async (id: bigint): Promise<User> => {
    return (await this.prisma.user.findUnique({ where: { id } })) as User;
  }

  findByEmailRaw = async(email: string) => {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create = async (data: Partial<Omit<User,"id" | "createdAt" | "updatedAt" | "associations" | "taxProfile">>
  ): Promise<{ id: string }> => {
    const created = await this.prisma.user.create({
      data: data as any,
      select: { id: true },
    });
    return { id: created.id.toString() };
  }

  updateById = async (data: Partial<Omit<User, "associations" | "taxProfile">>
  ): Promise<User> => {
    const id = data.id;
    if (!id) {
      throw new Error("ID is required for update");
    }
    return (await this.prisma.user.update({ where: { id }, data })) as User;
  }

  deleteById = async (id: bigint): Promise<void>  => {
    await this.prisma.user.delete({ where: { id }});
  }
}
