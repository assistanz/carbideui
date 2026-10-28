export type NgccAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type NgccAvatarShape = 'circle' | 'square';

/** Diameter in px for each size. */
export const NGCC_AVATAR_SIZES: Record<NgccAvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

/** "Ada Lovelace" -> "AL", "ada" -> "A", "" -> "". */
export function ngccInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => Array.from(p)[0]);
  if (!parts.length) return '';
  const letters = parts.length === 1 ? parts : [parts[0], parts[parts.length - 1]];
  return letters.join('').toUpperCase();
}
