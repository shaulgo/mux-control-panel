'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';

type Settings = {
  enabled: boolean;
  allowedDomains: string[];
  allowNoReferrer: boolean;
  allowNoUserAgent: boolean;
  allowHighRiskUserAgent: boolean;
};

export default function SettingsPage(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [domains, setDomains] = useState<string>('');
  const [allowNoReferrer, setAllowNoReferrer] = useState(false);
  const [allowNoUserAgent, setAllowNoUserAgent] = useState(true);
  const [allowHighRiskUserAgent, setAllowHighRiskUserAgent] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/settings/playback-restriction');
        if (res.ok) {
          const payload = (await res.json()) as {
            ok: boolean;
            data?: Settings;
          };
          if (payload.ok && payload.data) {
            const s = payload.data;
            setEnabled(Boolean(s.enabled));
            setDomains(
              Array.isArray(s.allowedDomains) ? s.allowedDomains.join(', ') : ''
            );
            setAllowNoReferrer(Boolean(s.allowNoReferrer));
            setAllowNoUserAgent(Boolean(s.allowNoUserAgent));
            setAllowHighRiskUserAgent(Boolean(s.allowHighRiskUserAgent));
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async (): Promise<void> => {
    setSaving(true);
    try {
      const allowedDomains = domains
        .split(',')
        .map(d => d.trim())
        .filter(Boolean);
      const res = await fetch('/api/settings/playback-restriction', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          allowedDomains,
          allowNoReferrer,
          allowNoUserAgent,
          allowHighRiskUserAgent,
        }),
      });
      if (!res.ok) {
        alert('Failed to save settings');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Playback Restrictions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enabled">
                Restrict playback to specific domains
              </Label>
              <p className="text-muted-foreground text-sm">
                Enforce domain-based playback for new assets. Wildcards like
                *.example.com are supported.
              </p>
            </div>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domains">
                  Allowed domains (comma separated)
                </Label>
                <Input
                  id="domains"
                  value={domains}
                  onChange={e => setDomains(e.target.value)}
                  placeholder="*.example.com, foo.com"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowNoReferrer">
                    Allow requests without Referer
                  </Label>
                  <p className="text-muted-foreground text-sm">
                    Needed for native apps and some devices that don’t send a
                    Referer header.
                  </p>
                </div>
                <Switch
                  id="allowNoReferrer"
                  checked={allowNoReferrer}
                  onCheckedChange={setAllowNoReferrer}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowNoUserAgent">
                    Allow requests without User-Agent
                  </Label>
                </div>
                <Switch
                  id="allowNoUserAgent"
                  checked={allowNoUserAgent}
                  onCheckedChange={setAllowNoUserAgent}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowHighRiskUserAgent">
                    Allow high-risk user agents
                  </Label>
                </div>
                <Switch
                  id="allowHighRiskUserAgent"
                  checked={allowHighRiskUserAgent}
                  onCheckedChange={setAllowHighRiskUserAgent}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button disabled={loading || saving} onClick={onSave}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
