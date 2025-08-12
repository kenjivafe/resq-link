import { useState } from 'react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const [imgError, setImgError] = useState(false);

    return (
        <div className="flex items-center justify-start overflow-hidden">
            {/* Prefer brand PNG if available; allow rectangular aspect */}
            <img
                src="/images/logo.png"
                alt="RESQ-LINK"
                className="h-6 w-auto object-contain"
                onError={(e) => {
                    setImgError(true);
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                }}
            />
            {/* Fallback icon only if image fails */}
            {!imgError ? null : (
                <AppLogoIcon className="h-6 w-6 fill-current text-sidebar-primary" />
            )}
        </div>
    );
}
