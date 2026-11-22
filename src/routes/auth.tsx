import { createFileRoute } from '@tanstack/react-router';
import { Login } from '@/features/anniversary/Login';
import { pageHead } from '@/features/anniversary/content';
export const Route = createFileRoute('/auth')({
  head: () => pageHead('Our private world', 'Sign in to the memories and moments we share.'),
  component: Login,
});
