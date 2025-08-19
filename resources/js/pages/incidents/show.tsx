import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import MapView from '../../components/map/MapView';
import AppLayout from '@/layouts/app-layout';

interface Incident {
  id: number;
  category: 'medical' | 'fire' | 'police';
  status: 'new' | 'en_route' | 'on_scene' | 'resolved';
  priority: number;
  description: string;
  occurred_at: string;
  latitude: number;
  longitude: number;
  caller_name: string;
  caller_contact: string;
  patient_status: 'CONSCIOUS' | 'UNCONSCIOUS';
  responders: string[];
  responders_other: string;
  proceed_to_scene_time: string;
  touchdown_scene_time: string;
  proceed_to_hospital_time: string;
  touchdown_hospital_time: string;
  touchdown_base_time: string;
  vehicular_reason: string;
  note1: string;
  created_at: string;
  updated_at: string;
}

export default function IncidentShow() {
  const { props } = usePage<{ id: number }>();
  const id = props.id;
  const [incident, setIncident] = useState<Incident | null>(null);
  const [assignedResponder, setAssignedResponder] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    // TODO: Replace with actual API call
    // fetch(`/api/incidents/${id}`).then(res => res.json()).then(data => setIncident(data));
    
    // Mock data for now
    setIncident({
      id,
      category: 'medical',
      status: 'en_route',
      priority: 3,
      description: 'Road accident at Diversion Rd.',
      occurred_at: new Date().toISOString(),
      latitude: 17.6138,
      longitude: 121.7270,
      caller_name: 'John Doe',
      caller_contact: '09123456789',
      patient_status: 'CONSCIOUS',
      responders: ['ambulance', 'police'],
      responders_other: '',
      proceed_to_scene_time: '14:30',
      touchdown_scene_time: '14:45',
      proceed_to_hospital_time: '15:15',
      touchdown_hospital_time: '15:30',
      touchdown_base_time: '16:00',
      vehicular_reason: 'Collision with motorcycle',
      note1: 'Patient stable, transported to hospital',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border rounded">
                <div className="text-sm text-gray-500">Category</div>
                <div className="capitalize font-medium">{incident.category}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-sm text-gray-500">Priority</div>
                <div className="font-medium">{incident.priority} (1-5)</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-medium">{incident.status.replace('_', ' ')}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-sm text-gray-500">Occurred At</div>
                <div>{new Date(incident.occurred_at).toLocaleString()}</div>
              </div>
              <div className="p-3 border rounded md:col-span-2">
                <div className="text-sm text-gray-500">Description</div>
                <div className="whitespace-pre-line">{incident.description}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-sm text-gray-500">Caller Name</div>
                <div>{incident.caller_name}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-sm text-gray-500">Caller Contact</div>
                <div>{incident.caller_contact}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-sm text-gray-500">Patient Status</div>
                <div>{incident.patient_status}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-sm text-gray-500">Responders</div>
                <div className="flex flex-wrap gap-1">
                  {[...incident.responders, ...(incident.responders_other ? [incident.responders_other] : [])].map((r, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 border rounded overflow-hidden">
              <div className="p-3 border-b">
                <div className="text-sm text-gray-500">Incident Location</div>
                <div className="text-sm">{incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}</div>
              </div>
              <div className="h-64 w-full">
                <MapView lat={incident.latitude} lng={incident.longitude} popup={`Incident #${incident.id}`} />
              </div>
            </div>
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

            <div className="p-4 border rounded space-y-4">
              <div>
                <h2 className="font-semibold mb-2">Timeline</h2>
                <div className="space-y-2 text-sm">
                  {incident.proceed_to_scene_time && (
                    <div className="flex justify-between">
                      <span>Proceed to scene:</span>
                      <span className="font-medium">{incident.proceed_to_scene_time}</span>
                    </div>
                  )}
                  {incident.touchdown_scene_time && (
                    <div className="flex justify-between">
                      <span>Arrived at scene:</span>
                      <span className="font-medium">{incident.touchdown_scene_time}</span>
                    </div>
                  )}
                  {incident.proceed_to_hospital_time && (
                    <div className="flex justify-between">
                      <span>Proceed to hospital:</span>
                      <span className="font-medium">{incident.proceed_to_hospital_time}</span>
                    </div>
                  )}
                  {incident.touchdown_hospital_time && (
                    <div className="flex justify-between">
                      <span>Arrived at hospital:</span>
                      <span className="font-medium">{incident.touchdown_hospital_time}</span>
                    </div>
                  )}
                  {incident.touchdown_base_time && (
                    <div className="flex justify-between">
                      <span>Returned to base:</span>
                      <span className="font-medium">{incident.touchdown_base_time}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="font-semibold mb-2">Status Update</h2>
                <div className="flex gap-2 flex-wrap">
                  {['en_route','on_scene','resolved'].map((s) => (
                    <button 
                      key={s}
                      className={`px-3 py-1 rounded text-sm border ${
                        incident.status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={() => alert(`TODO: POST /incidents/${id}/status -> ${s}`)}
                    >
                      {s.replace('_',' ')}
                    </button>
                  ))}
                </div>
              </div>
              
              {incident.vehicular_reason && (
                <div>
                  <h2 className="font-semibold mb-2">Vehicular Incident Details</h2>
                  <div className="text-sm">{incident.vehicular_reason}</div>
                </div>
              )}
              
              {incident.note1 && (
                <div>
                  <h2 className="font-semibold mb-2">Notes</h2>
                  <div className="text-sm whitespace-pre-line">{incident.note1}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </AppLayout>
  );
}
