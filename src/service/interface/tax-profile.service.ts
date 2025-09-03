import { UserTaxProfile, Prisma } from "@prisma/client";

export interface TaxProfileService {
  getTaxProfiles(filter: any): Promise<{ data: UserTaxProfile[]; total: number; page: number; pageSize: number }>;
  getTaxProfileById(id: string): Promise<UserTaxProfile>;
  createTaxProfile(dto: Prisma.UserTaxProfileCreateInput): Promise<string>;
  updateTaxProfile(id: string, dto: Prisma.UserTaxProfileUpdateInput): Promise<UserTaxProfile>;
  deleteTaxProfile(id: string): Promise<void>;
}
