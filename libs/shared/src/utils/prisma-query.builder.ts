import { PaginationQueryDto } from '../dto/pagination-query.dto';

export interface PrismaQueryParams {
  where?: Record<string, unknown>;
  take?: number;
  skip?: number;
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
}

export function buildPrismaQuery(
  query: PaginationQueryDto,
  searchFields: string[] = [],
  extraFilters: Record<string, unknown> = {},
): PrismaQueryParams {
  const { page = 1, limit = 10, search, sortBy, sortOrder = 'desc' } = query;

  const prismaQuery: PrismaQueryParams = {
    take: limit,
    skip: (page - 1) * limit,
  };

  // 1. Handle Search
  const whereConditions: Record<string, unknown>[] = [];

  if (search && searchFields.length > 0) {
    whereConditions.push({
      OR: searchFields.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      })),
    });
  }

  // 2. Handle Extra Filters
  if (Object.keys(extraFilters).length > 0) {
    whereConditions.push(extraFilters);
  }

  if (whereConditions.length > 0) {
    prismaQuery.where = whereConditions.length === 1 ? whereConditions[0] : { AND: whereConditions };
  }

  // 3. Handle Sorting
  if (sortBy) {
    prismaQuery.orderBy = { [sortBy]: sortOrder };
  } else {
    // Default fallback sorting if needed, or leave it to the service
  }

  return prismaQuery;
}

export function getPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
