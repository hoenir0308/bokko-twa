'use client';

import { ApiService } from '@/lib/services/api_service';
import type { Task, Goal } from '@/lib/types';
import { useInitData } from '@telegram-apps/sdk-react';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FaChevronLeft } from 'react-icons/fa';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

function TaskContent() {
    const initData = useInitData(true);
    const params = useSearchParams();
    const router = useRouter();
    const [task, setTask] = useState<Task>({
        title: '',
        description: '',
        deadline: new Date(),
        complite: false,
    });
    const [goalId, setGoalId] = useState<string>('');
    const [goals, setGoals] = useState<Goal[]>();
    const [createAnother, setCreateAnother] = useState<boolean>(false);

    useEffect(() => {
        const goal = params.get('goal_id');

        const fetchData = async () => {
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

            const data = await ApiService.getGoals(initDataStr);
            setGoals(data);
        };

        if (goal) setGoalId(goal);
        else {
            fetchData();
        }
    }, [initData]);

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

        await ApiService.createTask(goalId, task, initDataStr);
        if (createAnother) {
            setTask({ title: '', description: '', deadline: new Date(), complite: false });
        } else {
            router.back();
        }
    };

    const handleGoBack = () => {
        router.back();
    };

    return (
        <div className="max-h-max max-w-md mx-auto relative flex flex-col h-screen">
            <div className="bg-secondary">
                <div className="max-w-[97%] flex items-center py-4 mx-auto">
                    <Button onClick={handleGoBack} className="text-lg font-semibold" size="icon" variant="ghost">
                        <FaChevronLeft color="white" />
                    </Button>
                    <h2 className="text-lg text-white font-semibold">Мой календарь</h2>
                </div>
            </div>

            <div className="w-full p-4 bg-gray-100 text-black rounded-md shadow-md">
                {!goalId && goals && goals.length > 0 ? (
                    <div>
                        <Label htmlFor="goalSelect" className="text-sm font-medium text-gray-700">
                            Выберите цель:
                        </Label>
                        <Select onValueChange={(value) => setGoalId(value)} defaultValue="">
                            <SelectTrigger id="goalSelect" className="mt-1 w-full">
                                <SelectValue defaultValue={goals[0]._id} />
                            </SelectTrigger>
                            <SelectContent>
                                {goals.map((goal) => {
                                    if (goal._id && goal._id !== '') {
                                        return (
                                            <SelectItem key={goal._id} value={goal._id}>
                                                {goal.title}
                                            </SelectItem>
                                        );
                                    }
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                ) : (
                    <form onSubmit={handleCreate}>
                        <div className="mb-4">
                            <Label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Название задачи:
                            </Label>
                            <Input
                                id="title"
                                type="text"
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none"
                                value={task.title}
                                onChange={(e) => setTask({ ...task, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <Label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Описание задачи:
                            </Label>
                            <textarea
                                id="description"
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none"
                                value={task.description}
                                onChange={(e) => setTask({ ...task, description: e.target.value })}
                            />
                        </div>

                        <div className="mb-4">
                            <Label htmlFor="deadline">Дедлайн:</Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={dayjs(task.deadline).format('YYYY-MM-DD')}
                                onChange={(e) => setTask({ ...task, deadline: new Date(e.target.value) })}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="createAnother" className="inline-flex items-center">
                                <Input
                                    id="createAnother"
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4"
                                    checked={createAnother}
                                    onChange={() => setCreateAnother(!createAnother)}
                                />
                                <span className="ml-2">Создать еще одну задачу</span>
                            </label>
                        </div>

                        <Button className="w-full font-semibold text-lg py-4" type="submit">
                            Создать задачу
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function Task() {
    return (
        <React.Suspense fallback={<div>loading...</div>}>
            <TaskContent />
        </React.Suspense>
    );
}
