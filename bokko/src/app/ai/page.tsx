'use client';

import { Button } from '@/components/ui/button';
import { ApiService } from '@/lib/services/api_service';
import { useInitData } from '@telegram-apps/sdk-react';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import {Header} from "@/components/ui/header"; // Поддержка Markdown

function AiContent() {
    const initData = useInitData(true);
    const params = useSearchParams();
    const router = useRouter();
    const [text, setText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const goal_id = params.get('goal_id');

    useEffect(() => {
        const fetchData = async () => {
            if (!initData || !goal_id) return;

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

            try {
                const data = await ApiService.askGoal(goal_id, initDataStr);
                setText(data.detail);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [initData, params]);

    const handleGoTask = (goal_id: string) => {
        router.push(`/task/edit?goal_id=${goal_id}`);
    };

    const handleGoBack = () => {
        router.back();
    };

    return (
        <div className="max-h-max max-w-md mx-auto relative flex flex-col h-screen">
            <Header title={'Помощь с ИИ'} />
            <div className="p-4 w-full">
                {loading ? (
                    <div className="flex justify-center items-center h-screen">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-xl font-semibold mb-4">Результат Помощи ИИ</h2>
                        <div className="bg-white p-4 shadow-md rounded-lg max-h-[75vh] overflow-auto">
                            <ReactMarkdown className="whitespace-pre-wrap">
                                {text && text.length > 0 ? text : 'Нет результатов'}
                            </ReactMarkdown>
                        </div>
                        <div className="mt-4 flex flex-col space-y-2">
                            <Button
                                onClick={handleGoTask.bind(null, goal_id || '')}
                                className="w-full text-lg font-semibold"
                            >
                                Перейти к задачам
                            </Button>
                            <Button onClick={handleGoBack} variant="secondary" className="w-full text-lg font-semibold">
                                Назад
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Ai() {
    return (
        <React.Suspense fallback={<Loader2 className="animate-spin" />}>
            <AiContent />
        </React.Suspense>
    );
}
