export function getStorageLimit(planType: string): number {
  const limits: Record<string, number> = {
    'free': parseInt(process.env.NEXT_PUBLIC_FREE_STORAGE_LIMIT || '300000'),
    'beta_access': parseInt(process.env.NEXT_PUBLIC_FREE_STORAGE_LIMIT || '300000'),
    'pro_plan': parseInt(process.env.NEXT_PUBLIC_PRO_STORAGE_LIMIT || '10000000'),
    'premium': parseInt(process.env.NEXT_PUBLIC_PRO_STORAGE_LIMIT || '10000000'),
  };
  
  return limits[planType] || limits['free'];
}

export function formatCharacterCount(count: number): string {
  if (count >= 1000) {
    return `${Math.floor(count / 1000)}k`;
  }
  return count.toString();
}

export function getCharacterLimit(planType: string): number {
  // Approximate: 1 character ≈ 2 bytes on average
  return Math.floor(getStorageLimit(planType) / 2);
}
