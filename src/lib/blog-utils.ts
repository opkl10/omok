/**
 * Blog utility functions for bloggers
 */

/**
 * Calculate reading time for content
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(content: string): number {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');

  // Count words
  const words = text.trim().split(/\s+/).length;

  // Calculate minutes (minimum 1 minute)
  const minutes = Math.ceil(words / 200);

  return Math.max(1, minutes);
}

/**
 * Generate excerpt from content if not provided
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');

  // Trim and truncate
  const trimmed = text.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  // Cut at word boundary
  const truncated = trimmed.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return 'דקה אחת';
  } else if (minutes === 2) {
    return 'שתי דקות';
  } else {
    return `${minutes} דקות קריאה`;
  }
}

/**
 * Format view count
 */
export function formatViewCount(views: number): string {
  if (views === 0) {
    return 'אין צפיות';
  } else if (views === 1) {
    return 'צפייה אחת';
  } else if (views === 2) {
    return 'שתי צפיות';
  } else if (views < 1000) {
    return `${views} צפיות`;
  } else if (views < 1000000) {
    return `${(views / 1000).toFixed(1)}K צפיות`;
  } else {
    return `${(views / 1000000).toFixed(1)}M צפיות`;
  }
}

/**
 * Generate social sharing URLs
 */
export function getSocialShareUrls(url: string, title: string, description?: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || '');

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
  };
}

/**
 * Strip HTML tags for plain text
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Get related posts by category and tags (to be used in queries)
 */
export function getRelatedPostsQuery(
  currentPostId: string,
  categoryId?: string,
  tagIds?: string[]
) {
  const where: any = {
    id: { not: currentPostId },
    status: 'published',
  };

  // Prefer posts with same category
  if (categoryId) {
    where.categoryId = categoryId;
  }

  return where;
}
