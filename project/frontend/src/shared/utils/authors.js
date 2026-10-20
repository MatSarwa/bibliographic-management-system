// Authors are stored as { fullName } or { firstName, lastName } objects (edit form, DOI lookup),
// but older data may hold plain strings – every place that shows, searches or sorts
// authors goes through these helpers.

export function authorName(author) {
  if (!author) return '';
  if (typeof author === 'string') return author.trim();
  return (author.fullName || author.name || `${author.firstName || ''} ${author.lastName || ''}`).trim();
}

// List of author names for an item, from metadata.authors or legacy top-level fields.
export function itemAuthorNames(item) {
  const list = item?.metadata?.authors?.length ? item.metadata.authors : item?.authors;
  if (Array.isArray(list) && list.length) return list.map(authorName).filter(Boolean);
  return item?.author ? [item.author] : [];
}

export function formatAuthors(item, fallback = '') {
  return itemAuthorNames(item).join(', ') || fallback;
}
