import { Link, Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface Incident {
  id: number;
  category: 'medical' | 'fire' | 'police';
  status: 'new' | 'en_route' | 'on_scene' | 'resolved';
  description: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

function StatusBadge({ status }: { status: Incident['status'] }) {
  const color = {
    new: 'bg-gray-200 text-gray-800',
    en_route: 'bg-blue-200 text-blue-800',
    on_scene: 'bg-amber-200 text-amber-800',
    resolved: 'bg-emerald-200 text-emerald-800',
  }[status];
  return <span className={`px-2 py-1 rounded text-xs ${color}`}>{status.replace('_', ' ')}</span>;
}

export default function IncidentsIndex() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    // TODO: replace with API call to /incidents
    setIncidents([
      { id: 1, category: 'medical', status: 'new', description: 'Road accident at Diversion Rd.', latitude: 17.6153, longitude: 121.7270 },
      { id: 2, category: 'fire', status: 'en_route', description: 'Residential fire near Centro 1', latitude: 17.613, longitude: 121.725 },
      { id: 3, category: 'police', status: 'on_scene', description: 'Disturbance reported at Mall', latitude: 17.6101, longitude: 121.731 },
    ]);
  }, []);

  return (
    <AppLayout>
    <div className="p-6">
      <Head title="Incidents" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Incidents</h1>
        <div className="text-sm text-gray-500">MVP demo list</div>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Category</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Description</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-2">{i.id}</td>
                <td className="p-2 capitalize">{i.category}</td>
                <td className="p-2"><StatusBadge status={i.status} /></td>
                <td className="p-2">{i.description}</td>
                <td className="p-2">
                  <Link href={`/console/incidents/${i.id}`} className="text-blue-600 hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </AppLayout>
  );
}
