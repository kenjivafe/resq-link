import * as React from 'react';

export default function AuthLayout({
    children,
    title,
    description,
    ...props
}: {
    children: React.ReactNode;
    title?: string;
    description?: string;
}) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8" {...props}>
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                {title ? (
                    <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{title}</h2>
                ) : null}
                {description ? (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
                ) : null}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-neutral-800 py-8 px-6 shadow rounded-lg sm:px-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
