'use client';

import RegisterForm from '@/components/register-form';
import Goals from '@/components/ui/goal';
import { ApiService } from '@/lib/services/api_service';
import { User } from '@/lib/types';
import { useInitData } from '@telegram-apps/sdk-react';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {Loader2} from "lucide-react";

export default function Home() {
    const initData = useInitData(true);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isInited, setIsInited] = useState<boolean>(false);

    useEffect(() => {
        if (!initData) return;
        if(!isInited) {
            setIsInited(true)
            const initDataStr = new URLSearchParams({
                query_id: initData.queryId as string,
                auth_date: (initData.authDate.getTime() / 1000).toString(),
                hash: initData.hash,
                user: JSON.stringify({
                    id: initData.user?.id,
                    first_name: initData.user?.firstName,
                    last_name: initData.user?.lastName,
                    username: initData.user?.username,
                    language_code: initData.user?.languageCode,
                    is_premium: initData.user?.isPremium,
                    allows_write_to_pm: initData.user?.allowsWriteToPm,
                }),
            }).toString();

            console.log(initData?.user?.photoUrl);

            const fetchMe = async () => {
                try {
                    const user = await ApiService.me(initDataStr);
                    setUser(user);
                } catch (error) {
                    console.error('Error fetching user:', error);
                } finally {
                    setLoading(false);
                }
            }
            fetchMe();
        }
    }, [initData]);

    if (!user && !loading) {
        return <RegisterForm />;
    }

    return (
        <div className="min-h-screen  flex flex-col items-center">
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Loader2 className="animate-spin"/>
                </div>
            ) : (
                <>
                    <div className="bg-accent w-full flex items-center justify-center py-10">
                    <Image
                            src={initData?.user?.photoUrl ? initData.user.photoUrl : '/images/profile.png'}
                            alt={`${user?.first_name}'s avatar`}
                            width={80}
                            height={80}
                            className="rounded-full mr-4"
                        />
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold mb-2">
                                {user?.first_name} {user?.last_name}
                            </h1>
                            <p className="text-gray-700">Должность: {user?.post}</p>
                        </div>
                    </div>

                    <Goals />
                </>
            )}
        </div>
    );
}
