import { createFileRoute } from '@tanstack/react-router';
import { Login } from '@/features/anniversary/Login';
import { pageHead } from '@/features/anniversary/content';
export const Route = createFileRoute('/')({
  head: () =>
    pageHead('Always, Us', 'Seven years. A lifetime to go. A private home for our story.'),
  component: Login,
});
