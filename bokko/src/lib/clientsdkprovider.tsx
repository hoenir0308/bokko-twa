'use client';

import { Root } from '@/components/dev/root';
import { SDKProvider } from '@telegram-apps/sdk-react';

export const ClientSdkProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SDKProvider acceptCustomStyles debug>
            <Root>{children}</Root>
        </SDKProvider>
    );
};
