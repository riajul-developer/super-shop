export async function calculatePagination(
  page?: string,
  limit?: string,
  prisma?: any,
) {
  const pageNum = Number(page);
  const limitNum = Number(limit);

  const validPage = Number.isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
  const validLimit = Number.isNaN(limitNum) || limitNum < 1 ? 10 : limitNum;
  const skip = (validPage - 1) * validLimit;

  const total = prisma ? await prisma.count() : 0;

  return { validPage, validLimit, skip, total };
}

export function paginateData(
  page: number,
  limit: number,
  total: number,
  baseUrl: string,
) {
  const totalPages = Math.ceil(total / limit);
  const nextPage = page < totalPages ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  const pageRange = 10;
  const startPage = Math.max(1, page - Math.floor(pageRange / 2));
  const endPage = Math.min(totalPages, startPage + pageRange - 1);

  const pageLinks = [];
  for (let i = startPage; i <= endPage; i++) {
    pageLinks.push({
      page: i,
      url: `${baseUrl}?page=${i}&limit=${limit}`,
      active: i === page,
    });
  }

  return {
    total,
    perPage: limit,
    currentPage: page,
    totalPages,
    nextPage,
    prevPage,
    links: {
      first: `${baseUrl}?page=1&limit=${limit}`,
      last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
      prev: prevPage ? `${baseUrl}?page=${prevPage}&limit=${limit}` : null,
      next: nextPage ? `${baseUrl}?page=${nextPage}&limit=${limit}` : null,
      pages: pageLinks,
    },
  };
}


