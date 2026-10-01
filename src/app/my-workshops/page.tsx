'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyWorkshopsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/workshops');
  }, [router]);

  return null;
}
