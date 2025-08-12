import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import MapView from '../../components/map/MapView';
import AppLayout from '@/layouts/app-layout';

interface Incident {
  id: number;
  category: 'medical' | 'fire' | 'police';
  status: 'new' | 'en_route' | 'on_scene' | 'resolved';
  description: string;
  latitude: number;
  longitude: number;
  created_at?: string;
}

export default function IncidentShow() {
  const { props } = usePage<{ id: number }>();
  const id = props.id;
  const [incident, setIncident] = useState<Incident | null>(null);
  const [assignedResponder, setAssignedResponder] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    // TODO: fetch(`/incidents/${id}`)
    setIncident({
      id,
      category: 'medical',
      status: 'en_route',
      description: 'Road accident at Diversion Rd.',
      latitude: 17.6153,
      longitude: 121.727,
    });
    // TODO: fetch assignment
    setAssignedResponder({ id: 101, name: 'Ambulance A1' });
  }, [id]);

  const title = useMemo(() => (incident ? `Incident #${incident.id}` : 'Incident'), [incident]);

  return (
    <AppLayout>
    <div className="p-6 space-y-4">
      <Head title={title} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-gray-500">MVP demo detail view</p>
        </div>
        <Link href="/console/incidents" className="text-blue-600 hover:underline text-sm">Back to list</Link>
      </div>

      {incident && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-3">
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">Category</div>
              <div className="capitalize font-medium">{incident.category}</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">Status</div>
              <div className="font-medium">{incident.status.replace('_', ' ')}</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">Description</div>
              <div>{incident.description}</div>
            </div>
            <MapView lat={incident.latitude} lng={incident.longitude} popup={`Incident #${incident.id}`} />
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded">
              <h2 className="font-semibold mb-2">Assignment</h2>
              {assignedResponder ? (
                <div className="space-y-2">
                  <div className="text-sm">Assigned to</div>
                  <div className="font-medium">{assignedResponder.name}</div>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">Reassign</button>
                </div>
              ) : (
                <button className="px-3 py-2 bg-emerald-600 text-white rounded w-full">Assign Nearest</button>
              )}
            </div>

            <div className="p-4 border rounded">
              <h2 className="font-semibold mb-2">Status Update</h2>
              <div className="flex gap-2 flex-wrap">
                {['en_route','on_scene','resolved'].map((s) => (
                  <button key={s}
                          className="px-3 py-1 bg-gray-100 rounded text-sm border"
                          onClick={() => alert(`TODO: POST /incidents/${id}/status -> ${s}`)}>
                    {s.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </AppLayout>
  );
}
