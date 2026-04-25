import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';

export default async function RootPage() {
  redirect(ROUTES.app);
}
