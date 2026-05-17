export type JobListingLifecycle = 'DRAFT' | 'PUBLISHED' | 'DEACTIVATED';

export function lifecycleOf(listing: {
  publishedAt: Date | null;
  isActive: boolean;
}): JobListingLifecycle {
  if (listing.publishedAt === null) {
    return 'DRAFT';
  }
  return listing.isActive ? 'PUBLISHED' : 'DEACTIVATED';
}

export function wasEverPublished(listing: { publishedAt: Date | null }): boolean {
  return listing.publishedAt !== null;
}
