/*

import { TaxProfileService } from "./interface/tax-profile.service";
import { TaxProfileRepository } from "../repository/tax-profile.repository.impl";
import { UserTaxProfile } from "@prisma/client";

export class TaxProfileService implements ITaxProfileService {
  constructor(private repo: TaxProfileRepository) {}

  async getTaxProfiles(filter: any): Promise<{ data: UserTaxProfile[]; total: number; page: number; pageSize: number }> {
    // Normalizza pagination con default coerenti allo spec
    const page = Math.max(1, Number(filter.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(filter.pageSize ?? 20)));
    const { data, total } = await this.repo.findAll({ ...filter, page, pageSize });
    return { data, total, page, pageSize };
  }

  getTaxProfileById(id: string) {
    return this.repo.findById(id);
  }

  createTaxProfile(dto: any) {
    return this.repo.create(dto);
  }

  updateTaxProfile(id: string, dto: any) {
    return this.repo.update(id, dto);
  }

  deleteTaxProfile(id: string) {
    return this.repo.delete(id);
  }
}
*/