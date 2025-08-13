import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MapView from '@/components/map/MapView';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* KPIs */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardDescription>Total Incidents (24h)</CardDescription>
                            <CardTitle className="text-3xl">28</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Active Responses</CardDescription>
                            <CardTitle className="text-3xl">7</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Avg. Response Time</CardDescription>
                            <CardTitle className="text-3xl">4m 12s</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Resources Deployed</CardDescription>
                            <CardTitle className="text-3xl">19</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Map + Recent incidents */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>City Map</CardTitle>
                            <CardDescription>Live incident overview</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MapView lat={17.6131} lng={121.7276} zoom={13} height={420} popup="Tuguegarao City" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Incidents</CardTitle>
                            <CardDescription>Last 10 reported</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-neutral-500 dark:text-neutral-400">
                                            <th className="px-2 py-1 text-left font-medium">Time</th>
                                            <th className="px-2 py-1 text-left font-medium">Type</th>
                                            <th className="px-2 py-1 text-left font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                        {[
                                            { t: '14:02', type: 'Fire', s: 'Responding' },
                                            { t: '13:55', type: 'Medical', s: 'Queued' },
                                            { t: '13:44', type: 'Traffic', s: 'Cleared' },
                                            { t: '13:31', type: 'Rescue', s: 'En route' },
                                            { t: '13:20', type: 'Flood', s: 'Monitoring' },
                                        ].map((row, i) => (
                                            <tr key={i}>
                                                <td className="px-2 py-2 whitespace-nowrap">{row.t}</td>
                                                <td className="px-2 py-2 whitespace-nowrap">{row.type}</td>
                                                <td className="px-2 py-2 whitespace-nowrap">
                                                    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                        {row.s}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Fallback canvas if needed later */}
                <div className="relative hidden min-h-[40vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
