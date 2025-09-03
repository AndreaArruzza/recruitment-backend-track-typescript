import { UserTaxProfile } from "@prisma/client";
import { SharedMapper } from "./shared.mapper";

export class TaxProfileMapper extends SharedMapper {
  static toTaxProfileResponse = (p: UserTaxProfile) => ({
    type: p.type,
    legalName: p.legalName,
    fiscalCode: p.fiscalCode,
    vatNumber: p.vatNumber ?? null,
    addressLine1: p.addressLine1,
    addressLine2: p.addressLine2 ?? null,
    city: p.city,
    province: p.province ?? null,
    postalCode: p.postalCode,
    countryCode: p.countryCode,
    userId: p.userId,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  });

  static toPaginatedTaxProfiles = (
    data: UserTaxProfile[],
    page: number,
    pageSize: number,
    total: number
  ) => ({
    data: data.map(this.toTaxProfileResponse),
    page,
    pageSize,
    total,
  });
}
