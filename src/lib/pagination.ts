export type PaginateOptions = {
  page?: number;
  limit?: number;
}

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function paginate<T, Args extends Record<string, any>>(
  model: { findMany: (args: Args) => Promise<T[]>, count: (args: { where?: any }) => Promise<number> },
  args: Args,
  options: PaginateOptions
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, options.page || 1)
  const limit = Math.max(1, options.limit || 20)
  const skip = (page - 1) * limit

  const [data, total] = await Promise.all([
    model.findMany({ ...args, skip, take: limit }),
    model.count({ where: (args as any).where })
  ])

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}
