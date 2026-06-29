/** Short unique-ish id for cart lines and orders (runtime only). */
export function makeId(prefix = ""): string {
  return (
    prefix +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 7)
  );
}
