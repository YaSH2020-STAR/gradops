'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function TakedownActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(action);
    const form = new FormData();
    form.set('action', action);
    const res = await fetch(`/api/admin/takedown/${requestId}`, {
      method: 'POST',
      body: form,
    });
    setLoading(null);
    if (res.redirected) window.location.href = res.url;
    else router.refresh();
  }

  return (
    <div className="mt-2 flex gap-2">
      <button
        type="button"
        className="text-sm text-primary hover:underline disabled:opacity-50"
        onClick={() => handleAction('approve')}
        disabled={!!loading}
      >
        {loading === 'approve' ? '...' : 'Approve removal'}
      </button>
      <button
        type="button"
        className="text-sm text-gray3 hover:underline disabled:opacity-50"
        onClick={() => handleAction('reject')}
        disabled={!!loading}
      >
        {loading === 'reject' ? '...' : 'Reject'}
      </button>
    </div>
  );
}
