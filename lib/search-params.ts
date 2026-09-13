/** Normalize Next.js search param values into a string array. */
export function asStringArray(value?: string | string[] | null): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
