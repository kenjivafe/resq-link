import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-[#f9faf9] dark:bg-neutral-950 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-3xl text-center">
                    <div className="flex items-center justify-center mb-6">
                        <img src="/images/logo.png" alt="RESQ-LINK" className="h-10 w-auto object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        RESQ-LINK Emergency Command Center
                    </h1>
                    <p className="mt-3 text-neutral-600 dark:text-neutral-300">
                        Coordinate incidents, responders, and live updates in real time. Built with Laravel, Inertia, React, and Leaflet.
                    </p>

                    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        {auth.user ? (
                            <>
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center justify-center rounded-md bg-[#b4ce93] px-5 py-2.5 text-sm font-medium text-neutral-900 shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b4ce93]"
                                >
                                    Open Console
                                </Link>
                                <Link
                                    href="/console/incidents"
                                    className="inline-flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                >
                                    Incidents
                                </Link>
                                <Link href="/console/feed" className="text-sm font-medium text-neutral-700 hover:underline dark:text-neutral-300">
                                    Live Feed
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center justify-center rounded-md bg-[#b4ce93] px-5 py-2.5 text-sm font-medium text-neutral-900 shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b4ce93]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                >
                                    Register
                                </Link>
                                <Link href="/console/incidents" className="text-sm font-medium text-neutral-700 hover:underline dark:text-neutral-300">
                                    View Incidents
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="mt-10 text-xs text-neutral-500 dark:text-neutral-400">
                        Tuguegarao City Command Center · v0.1 MVP
                    </div>
                </div>
            </div>
        </>
    );
}
