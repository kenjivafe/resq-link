import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// NOTE: This is an MVP form that mirrors the current Google Form fields.
// Backend: expect to create a controller to store these fields. For now we post to route('incidents.store').

export default function IncidentCreate() {
  const { data, setData, post, processing, errors } = useForm({
    // Base incident
    category: 'medical' as 'medical' | 'fire' | 'police',
    priority: 3,
    description: '',
    occurred_at: '',
    latitude: '',
    longitude: '',

    // Caller info
    caller_name: '',
    caller_contact: '',

    // Patient
    patient_status: 'CONSCIOUS' as 'CONSCIOUS' | 'UNCONSCIOUS',

    // Responders (checkboxes)
    responders: [] as string[],
    responders_other: '',

    // Times (strings HH:MM)
    proceed_to_scene_time: '',
    touchdown_scene_time: '',
    proceed_to_hospital_time: '',
    touchdown_hospital_time: '',
    touchdown_base_time: '',

    // Comments flow
    proceed_to_comment_section: 'Yes' as 'Yes' | 'No',

    // Extra
    vehicular_reason: '',
    note1: '',
  });

  const toggleResponder = (value: string) => {
    setData('responders', data.responders.includes(value)
      ? data.responders.filter((v) => v !== value)
      : [...data.responders, value]
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/console/incidents', {
      onSuccess: () => {
        window.location.href = '/console/incidents';
      },
    });
  };

  return (
    <AppLayout>
      <Head title="New Incident" />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Create Incident</h1>
            <p className="text-sm text-neutral-500">MVP form mirroring the traditional dispatch Google Form</p>
          </div>
          <Link href="/console/incidents" className="text-sm text-blue-600 hover:underline">Back to list</Link>
        </div>

        <form onSubmit={submit} className="grid gap-6">
          {/* Base incident */}
          <section className="rounded border p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">Incident Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category" 
                  className="border rounded px-3 py-2 bg-white dark:bg-neutral-900" 
                  value={data.category} 
                  onChange={(e) => setData('category', e.target.value as 'medical' | 'fire' | 'police')}
                >
                  <option value="medical">Medical</option>
                  <option value="fire">Fire</option>
                  <option value="police">Police</option>
                </select>
                {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority (1-5)</Label>
                <Input id="priority" type="number" min={1} max={5} value={data.priority} onChange={(e) => setData('priority', Number(e.target.value))} />
                {errors.priority && <p className="text-sm text-red-600">{errors.priority}</p>}
              </div>
              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" className="border rounded px-3 py-2 min-h-[80px] bg-white dark:bg-neutral-900" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="occurred_at">Occurred At</Label>
                <Input id="occurred_at" type="datetime-local" value={data.occurred_at} onChange={(e) => setData('occurred_at', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Location</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Latitude" value={data.latitude} onChange={(e) => setData('latitude', e.target.value)} />
                  <Input placeholder="Longitude" value={data.longitude} onChange={(e) => setData('longitude', e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          {/* Caller */}
          <section className="rounded border p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">Caller Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="caller_name">Caller Name</Label>
                <Input id="caller_name" value={data.caller_name} onChange={(e) => setData('caller_name', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="caller_contact">Caller Contact Info</Label>
                <Input id="caller_contact" value={data.caller_contact} onChange={(e) => setData('caller_contact', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Patient Status */}
          <section className="rounded border p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">Patient Status</h2>
            <div className="flex gap-6">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="patient_status" value="CONSCIOUS" checked={data.patient_status === 'CONSCIOUS'} onChange={() => setData('patient_status', 'CONSCIOUS')} />
                <span>CONSCIOUS</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="patient_status" value="UNCONSCIOUS" checked={data.patient_status === 'UNCONSCIOUS'} onChange={() => setData('patient_status', 'UNCONSCIOUS')} />
                <span>UNCONSCIOUS</span>
              </label>
            </div>
          </section>

          {/* Responders */}
          <section className="rounded border p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">Responders</h2>
            <div className="grid gap-2 md:grid-cols-3">
              {['PNP','TMG','BFP','RESCUE','BARANGAY','TUGUEGARAO CITY COMMAND CENTER','CAGELCO'].map((r) => (
                <label key={r} className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={data.responders.includes(r)} onChange={() => toggleResponder(r)} />
                  <span>{r}</span>
                </label>
              ))}
              <div className="md:col-span-3 grid gap-2">
                <Label htmlFor="responders_other">Other</Label>
                <Input id="responders_other" value={data.responders_other} onChange={(e) => setData('responders_other', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Times */}
          <section className="rounded border p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">Dispatch Timeline</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="proceed_to_scene_time">Proceeding to Scene</Label>
                <Input id="proceed_to_scene_time" type="time" value={data.proceed_to_scene_time} onChange={(e) => setData('proceed_to_scene_time', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="touchdown_scene_time">Touchdown Scene</Label>
                <Input id="touchdown_scene_time" type="time" value={data.touchdown_scene_time} onChange={(e) => setData('touchdown_scene_time', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="proceed_to_hospital_time">Proceeding to Hospital</Label>
                <Input id="proceed_to_hospital_time" type="time" value={data.proceed_to_hospital_time} onChange={(e) => setData('proceed_to_hospital_time', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="touchdown_hospital_time">Touchdown Hospital</Label>
                <Input id="touchdown_hospital_time" type="time" value={data.touchdown_hospital_time} onChange={(e) => setData('touchdown_hospital_time', e.target.value)} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="touchdown_base_time">Touchdown Base</Label>
                <Input id="touchdown_base_time" type="time" value={data.touchdown_base_time} onChange={(e) => setData('touchdown_base_time', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Comment Section routing */}
          <section className="rounded border p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">Proceed to Comment section?</h2>
            <div className="flex gap-6">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="proceed_comment" value="Yes" checked={data.proceed_to_comment_section === 'Yes'} onChange={() => setData('proceed_to_comment_section', 'Yes')} />
                <span>Yes</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="proceed_comment" value="No" checked={data.proceed_to_comment_section === 'No'} onChange={() => setData('proceed_to_comment_section', 'No')} />
                <span>No</span>
              </label>
            </div>
          </section>

          {/* Extras */}
          <section className="rounded border p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">Additional Details</h2>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vehicular_reason">If vehicular accident occurs, reason</Label>
                <Input id="vehicular_reason" placeholder="e.g., Reckless driving, Stray animals, etc. Type NONE if otherwise" value={data.vehicular_reason} onChange={(e) => setData('vehicular_reason', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note1">Note 1</Label>
                <textarea id="note1" className="border rounded px-3 py-2 min-h-[80px] bg-white dark:bg-neutral-900" value={data.note1} onChange={(e) => setData('note1', e.target.value)} />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <Link href="/incidents" className="text-sm text-neutral-600 hover:underline">Cancel</Link>
            <Button type="submit" disabled={processing}>Create Incident</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
