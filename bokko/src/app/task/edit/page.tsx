'use client';


import { ApiService } from '@/lib/services/api_service';
import type { Task, Goal } from '@/lib/types';
import { useInitData } from '@telegram-apps/sdk-react';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FaChevronLeft } from 'react-icons/fa';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import "react-datepicker/dist/react-datepicker.css";
import 'react-time-picker/dist/TimePicker.css';
import {TaskForm} from "@/components/ui/task/task-form";

function TaskContent() {
    const initData = useInitData();
    const params = useSearchParams();
    const router = useRouter();
    const [task, setTask] = useState<Task>();
    const [taskId, setTaskId] = useState<string>('');
    const [goalId, setGoalId] = useState<string>('');
    const [goals, setGoals] = useState<Goal[]>();
    const fetchData = async (id: string) => {
        console.log('fetch');
        if (initData) {
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
            await ApiService.getTask(id, initDataStr).then((data) => {
                setTask(data)
            })
            await ApiService.getTasks(initDataStr, goalId).then((data) => {
                setGoals(data);
            });
        }
    };

    useEffect(() => {
        const id1 = params.get('task_id');
        const id2 = params.get('goal_id');
        if (id1) {
            setTaskId(id1);
        }
        if (id2) {
            setGoalId(id2);
        }
    }, [])

    useEffect(() => {
        if (taskId) fetchData(taskId);
    }, [initData, taskId])

    const handleGoBack = () => {
        router.back();
    };

    if (task) {
        return (
            <div className="max-h-max max-w-md mx-auto relative flex flex-col h-screen">
                <div className="bg-secondary">
                    <div className="max-w-[97%] flex items-center py-4 mx-auto">
                        <Button onClick={handleGoBack} className="text-lg font-semibold" size="icon" variant="ghost">
                            <FaChevronLeft color="white" />
                        </Button>
                        <h2 className="text-lg text-white font-semibold">Добавить задачу</h2>
                    </div>
                </div>
                <div className="w-full p-4 text-black rounded-md shadow-md">
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
                        <TaskForm isEdit={true} editTask={task} task_id={taskId} goal_id={goalId} />
                    )}
                </div>
            </div>
        );
    }
}

export default function Task() {
    return (
        <React.Suspense fallback={<div>loading...</div>}>
            <TaskContent />
        </React.Suspense>
    );
}
