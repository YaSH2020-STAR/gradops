'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ReportJobButton({ jobId }: { jobId: string }) {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/takedown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, requesterEmail: email, reason }),
    });
    if (res.ok) {
      setSent(true);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray3">
          Request removal
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark border-stroke text-light">
        <DialogHeader>
          <DialogTitle>Request removal</DialogTitle>
        </DialogHeader>
        {sent ? (
          <p className="text-sm text-gray2">Request received. We will review it shortly.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Your email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <textarea
                id="reason"
                className="w-full rounded-lg border border-stroke bg-darkBg px-3 py-2 text-sm text-light min-h-[80px]"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Submit</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
