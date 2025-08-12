import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface FeedPayload {
  id: number;
  note: string;
  [key: string]: unknown;
}

interface FeedEvent {
  id: string;
  type: string;
  time: string;
  payload: FeedPayload;
}

export default function LiveFeedPage() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // TODO: replace with Echo presence/private channels
    timerRef.current = window.setInterval(() => {
      const fake: FeedEvent = {
        id: Math.random().toString(36).slice(2),
        type: ['incident.created','incident.updated','assignment.created','responder.location.updated'][Math.floor(Math.random()*4)],
        time: new Date().toLocaleTimeString(),
        payload: { id: Math.floor(Math.random()*100), note: 'demo' },
      };
      setEvents((prev) => [fake, ...prev].slice(0, 50));
    }, 3000);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, []);

  return (
    <AppLayout>
    <div className="p-6 space-y-4">
      <Head title="Live Feed" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Live Feed</h1>
          <p className="text-sm text-gray-500">Realtime incident and responder updates (demo)</p>
        </div>
        <Link href="/console/incidents" className="text-blue-600 hover:underline text-sm">Incidents</Link>
      </div>

      <div className="border rounded divide-y">
        {events.length === 0 && (
          <div className="p-4 text-sm text-gray-500">Waiting for events...</div>
        )}
        {events.map((e) => (
          <div key={e.id} className="p-3 flex items-start gap-3">
            <div className="text-xs text-gray-500 w-24">{e.time}</div>
            <div className="flex-1">
              <div className="font-medium text-sm">{e.type}</div>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(e.payload, null, 2)}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
    </AppLayout>
  );
}
