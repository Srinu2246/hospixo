import { redirect } from 'next/navigation';

/** Legacy path — Cash Counter lives at /management/cash-counter. */
export default function BranchManagerCashRegistersRedirectPage() {
  redirect('/branch-manager/management/cash-counter');
}
