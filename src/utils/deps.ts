export function mergeDeps(
  base: Record<string, string>,
  additions: Record<string, string>
): Record<string, string> {
  return { ...base, ...additions }
}
