'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ApiService } from '@/lib/services/api_service';
import { Goal } from '@/lib/types';
import { useInitData } from '@telegram-apps/sdk-react';
import {useRouter} from 'next/navigation';
import React, {useState} from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import {Loader} from "@/components/ui/Loader/Loader";
import {Header} from "@/components/ui/header";

export default function Goals() {
    const initData = useInitData(true);
    const router = useRouter();
    const [goal, setGoal] = useState<Goal>({
        title: '',
        description: '',
        deadline: new Date(),
    });
    const [isGoalLoading, setIsGoalLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setGoal((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!initData) return;

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
            setIsGoalLoading(true);
            await ApiService.createGoal(goal, initDataStr).then((goal_response) => {
                setGoal({ title: '', description: '', deadline: new Date() });
                router.push(`/task/create?goal_id=${goal_response._id}&goal_title=${goal.title}`);
            }).finally(() => setIsGoalLoading(false));

        } catch (error) {
            console.error('Failed to create goal:', error);
        }
    };

    const handleGoBack = () => {
        router.back();
    };

    // const handleAddTasks = () => {
    //     router.push(`/task/create?goal_id=${goalId}&goal_title=${goal.title}`);
    // };
    //
    // const handleAiHelp = async () => {
    //     router.push(`/ai?goal_id=${goalId}`);
    // };

    return (
        <div className="max-h-max max-w-md mx-auto relative flex flex-col h-screen">
            <Header title={'Создать цель'} />
            <div className="p-4">
                <form onSubmit={handleCreate} className="space-y-4">
                    <input
                        placeholder={'Название цели*'}
                        type="text"
                        id="title"
                        name="title"
                        value={goal.title}
                        onChange={handleChange}
                        className="font-[500] border-0 border-b-black border-b w-[100%] pl-6 text-lg"
                        required
                    />
                    <Label htmlFor="description">
                        <p className="block mb-1 ml-6 mt-4 text-lg text-neutral-400">Описание цели</p>
                    </Label>
                    <Textarea
                        id="description"
                        name="description"
                        className="pl-6"
                        value={goal.description}
                        onChange={handleChange}
                        required
                    />
                    <Button type="submit"
                            className={`w-full text-lg font-semibold ${isGoalLoading ? 'bg-gray-400' : ''}`}
                            disabled={isGoalLoading}>
                        {
                            isGoalLoading ? <Loader/> : 'Создать цель'
                        }
                    </Button>
                </form>
            </div>
        </div>
    );
}
