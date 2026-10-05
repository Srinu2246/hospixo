import { Skeleton } from '@/components/ui/skeleton';

export default function OrganizationCreateLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.5rem',
        maxWidth: '56rem',
      }}
    >
      <Skeleton style={{ height: '2rem', width: '18rem' }} />
      <Skeleton style={{ height: '1rem', width: '20rem' }} />
      <Skeleton style={{ height: '3rem', width: '100%' }} />
      <Skeleton style={{ height: '16rem', width: '100%' }} />
    </div>
  );
}
