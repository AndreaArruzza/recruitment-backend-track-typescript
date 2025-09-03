import type { User } from "@prisma/client"

export type PaginationDto<T = any> = { 
  data: T[], 
  total: number,
  page: number,
  pageSize: number
}
