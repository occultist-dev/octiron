

let counter = 0;

/**
 * Generates a unique key.
 */
export function key(): string {
  const key = `oct-${counter.toString().padStart(8, '0')}`;
  counter++;

  return key;
}
