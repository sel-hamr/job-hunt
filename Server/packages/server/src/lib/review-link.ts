export function reviewLink(
  dashboardUrl: string,
  type?: string,
  id?: number,
): string {
  const url = new URL("/review", dashboardUrl);
  if (type) url.searchParams.set("type", type);
  if (id !== undefined) url.searchParams.set("id", String(id));
  return url.toString();
}
