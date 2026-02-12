import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';

export default function LegacyHomePage() {
  redirect(ROUTES.home);
}
