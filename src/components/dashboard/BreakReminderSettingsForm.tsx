'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type Settings = {
  id: string;
  enabled: boolean;
  intervalMinutes: number;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  message: string | null;
  idleThresholdMinutes: number;
  snoozeMinutesDefault: number;
} | null;

type State = {
  lastNotifiedAt: Date | null;
  snoozedUntil: Date | null;
  pausedUntil: Date | null;
} | null;

const DEFAULT_MESSAGE =
  'Time for a quick break — stretch, water, eyes off screen for 20 seconds.';

export function BreakReminderSettingsForm({
  userId,
  settings,
  state,
}: {
  userId: string;
  settings: Settings;
  state: State;
}) {
  const [enabled, setEnabled] = useState(settings?.enabled ?? false);
  const [intervalMinutes, setIntervalMinutes] = useState(
    String(settings?.intervalMinutes ?? 45)
  );
  const [quietStart, setQuietStart] = useState(
    settings?.quietHoursStart != null ? String(settings.quietHoursStart) : '22'
  );
  const [quietEnd, setQuietEnd] = useState(
    settings?.quietHoursEnd != null ? String(settings.quietHoursEnd) : '8'
  );
  const [message, setMessage] = useState(settings?.message ?? DEFAULT_MESSAGE);
  const [idleThreshold, setIdleThreshold] = useState(
    String(settings?.idleThresholdMinutes ?? 5)
  );
  const [snoozeDefault, setSnoozeDefault] = useState(
    String(settings?.snoozeMinutesDefault ?? 10)
  );
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setDone(false);
    const res = await fetch('/api/wellbeing/break-reminder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enabled,
        intervalMinutes: Math.max(15, Math.min(120, Number(intervalMinutes) || 45)),
        quietHoursStart: Number(quietStart),
        quietHoursEnd: Number(quietEnd),
        message: message || DEFAULT_MESSAGE,
        idleThresholdMinutes: Math.max(1, Math.min(30, Number(idleThreshold) || 5)),
        snoozeMinutesDefault: Math.max(5, Math.min(60, Number(snoozeDefault) || 10)),
      }),
    });
    setSaving(false);
    if (res.ok) setDone(true);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-stroke bg-dark p-4">
        <Label htmlFor="enabled" className="text-light cursor-pointer">
          Enable break reminders
        </Label>
        <Switch
          id="enabled"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>
      <div>
        <Label className="text-gray2">Interval (minutes)</Label>
        <select
          className="mt-1 w-full rounded-lg border border-stroke bg-dark px-3 py-2 text-sm text-light"
          value={intervalMinutes}
          onChange={(e) => setIntervalMinutes(e.target.value)}
        >
          <option value="30">30</option>
          <option value="45">45</option>
          <option value="60">60</option>
          <option value="90">90</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray2">Quiet hours start (hour 0–23)</Label>
          <Input
            type="number"
            min={0}
            max={23}
            value={quietStart}
            onChange={(e) => setQuietStart(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-gray2">Quiet hours end (hour 0–23)</Label>
          <Input
            type="number"
            min={0}
            max={23}
            value={quietEnd}
            onChange={(e) => setQuietEnd(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label className="text-gray2">Reminder message</Label>
        <textarea
          className="mt-1 w-full rounded-lg border border-stroke bg-dark px-3 py-2 text-sm text-light min-h-[80px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div>
        <Label className="text-gray2">Idle threshold (minutes) — reset timer when inactive</Label>
        <Input
          type="number"
          min={1}
          max={30}
          value={idleThreshold}
          onChange={(e) => setIdleThreshold(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-gray2">Default snooze (minutes)</Label>
        <select
          className="mt-1 w-full rounded-lg border border-stroke bg-dark px-3 py-2 text-sm text-light"
          value={snoozeDefault}
          onChange={(e) => setSnoozeDefault(e.target.value)}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
        </select>
      </div>
      {done && <p className="text-sm text-primary">Settings saved.</p>}
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save settings'}
      </Button>
    </form>
  );
}
