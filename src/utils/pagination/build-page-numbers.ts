export function buildPageNumbers(
  currentPage: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);
  for (const offset of [-1, 1, -2, 2]) {
    const page = currentPage + offset;
    if (page > 1 && page < totalPages) pages.add(page);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | 'ellipsis'> = [];
  for (const [index, page] of sorted.entries()) {
    if (index > 0 && page - sorted[index - 1]! > 1) {
      result.push('ellipsis');
    }
    result.push(page);
  }
  return result;
}
