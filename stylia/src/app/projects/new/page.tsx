import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { NewProjectWizard } from '@/components/NewProjectWizard';

export const dynamic = 'force-dynamic';

export default function NewProjectPage() {
  const user = getCurrentUser();
  if (!user) redirect('/login');
  return <NewProjectWizard defaultUnit={user.unit} />;
}
