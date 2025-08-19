import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';
import AppLayout from '@/layouts/app-layout';

interface Incident {
  id: number;
  category: 'medical' | 'fire' | 'police';
  priority: number;
  description: string;
  caller_name: string;
  caller_contact: string;
  patient_status: 'CONSCIOUS' | 'UNCONSCIOUS';
  occurred_at: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

function CategoryBadge({ category }: { category: Incident['category'] }) {
  const colors = {
    medical: 'bg-blue-100 text-blue-800',
    fire: 'bg-red-100 text-red-800',
    police: 'bg-yellow-100 text-yellow-800',
  };
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[category]}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}

interface Props extends PageProps {
  incidents: Incident[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function IncidentsIndex({ incidents, pagination }: Props) {

  return (
    <AppLayout>
    <div className="p-6">
      <Head title="Incidents" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Incidents</h1>
        <Link 
          href="/console/incidents/create" 
          className="inline-flex items-center rounded bg-[#b4ce93] px-4 py-2 text-sm font-medium text-neutral-900 hover:brightness-95"
        >
          New Incident
        </Link>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Category</th>
              <th className="text-left p-2">Priority</th>
              <th className="text-left p-2">Caller</th>
              <th className="text-left p-2">Description</th>
              <th className="text-left p-2">Occurred At</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((i) => (
              <tr key={i.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{i.id}</td>
                <td className="p-2">
                  <CategoryBadge category={i.category} />
                </td>
                <td className="p-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-sm font-medium">
                    {i.priority}
                  </span>
                </td>
                <td className="p-2">
                  <div className="font-medium">{i.caller_name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{i.caller_contact || 'No contact'}</div>
                </td>
                <td className="p-2 max-w-xs truncate" title={i.description}>
                  {i.description || 'No description'}
                </td>
                <td className="p-2 whitespace-nowrap">
                  {new Date(i.occurred_at).toLocaleString()}
                </td>
                <td className="p-2">
                  <Link 
                    href={`/console/incidents/${i.id}`} 
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex space-x-1">
            <Link
              href={`/console/incidents?page=${pagination.current_page - 1}`}
              as="button"
              className={`px-3 py-1 border rounded ${
                pagination.current_page === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              disabled={pagination.current_page === 1}
              preserveScroll
            >
              Previous
            </Link>
            <Link
              href={`/console/incidents?page=${pagination.current_page + 1}`}
              as="button"
              className={`px-3 py-1 border rounded ${
                pagination.current_page === pagination.last_page
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              disabled={pagination.current_page === pagination.last_page}
              preserveScroll
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
