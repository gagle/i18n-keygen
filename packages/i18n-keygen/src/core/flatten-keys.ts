export function flattenKeys(obj: Record<string, unknown>, prefix: string): ReadonlyArray<string> {
  const keys: Array<string> = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}
