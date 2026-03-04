'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { UserRole } from '@prisma/client';

export function SaveJobButton({ jobId }: { jobId: string }) {
  const { data: session, status } = useSession();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || (session?.user as { role?: string })?.role !== UserRole.JOB_SEEKER) return;
    fetch(`/api/jobs/save/check?jobId=${jobId}`)
      .then((r) => r.json())
      .then((data) => setSaved(data?.saved === true))
      .catch(() => {});
  }, [jobId, session, status]);

  async function toggle() {
    if (status !== 'authenticated' || (session?.user as { role?: string })?.role !== UserRole.JOB_SEEKER) return;
    setLoading(true);
    if (saved) {
      await fetch(`/api/jobs/save?jobId=${jobId}`, { method: 'DELETE' });
      setSaved(false);
    } else {
      await fetch('/api/jobs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      setSaved(true);
    }
    setLoading(false);
  }

  if (status !== 'authenticated' || (session?.user as { role?: string })?.role !== UserRole.JOB_SEEKER) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="gap-2"
    >
      {saved ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          Save job
        </>
      )}
    </Button>
  );
}
