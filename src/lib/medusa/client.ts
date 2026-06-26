const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!;
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!;

export const MEDUSA_REGION_ID = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID!;

export async function medusaFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY,
      ...(options?.headers ?? {}),
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Medusa API error ${res.status}: ${path}`);
  }

  return res.json();
}
