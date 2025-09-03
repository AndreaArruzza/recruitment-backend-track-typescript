import { UserTaxProfile, Prisma } from "@prisma/client";

export type TaxProfileListFilter = {
  page?: number;
  pageSize?: number;
  userId?: string;
  type?: string;       // TaxType enum
  isActive?: boolean;  // opzionale, se previsto nello schema
  city?: string;
};

export interface ITaxProfileRepository {
  findAll(filter: TaxProfileListFilter): Promise<{ data: UserTaxProfile[]; total: number }>;
  findById(id: string): Promise<UserTaxProfile>;
  create(dto: Prisma.UserTaxProfileCreateInput): Promise<string>;
  update(id: string, dto: Prisma.UserTaxProfileUpdateInput): Promise<UserTaxProfile>;
  delete(id: string): Promise<void>;
}
