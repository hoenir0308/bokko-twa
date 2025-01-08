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
import "react-datepicker/dist/react-datepicker.css";
import 'react-time-picker/dist/TimePicker.css';
import {TaskForm} from "@/components/ui/task/task-form";
import {Loader2} from "lucide-react";
import {TaskFormLoading} from "@/components/ui/task/skeletons/task-form-loading";

function TaskEdit() {
    const initData = useInitData();
    const params = useSearchParams();
    const router = useRouter();
    const [task, setTask] = useState<Task>();
    const [taskId, setTaskId] = useState<string>('');
    const [goalId, setGoalId] = useState<string>('');
    const [goalTitle, setGoalTitle] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
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
            setIsLoading(true)
            setIsError(false);
            await ApiService.getTask(id, initDataStr).then((data) => {
                setTask(data)
            }).finally(() => setIsLoading(false)).catch(() => setIsError(true))
        }
    };

    useEffect(() => {
        const id1 = params.get('task_id');
        const id2 = params.get('goal_id');
        const title = params.get('goal_title');
        if (id1) {
            setTaskId(id1);
        }
        if (id2) {
            setGoalId(id2);
        }
        if (title) {
            setGoalTitle(title);
        }
    }, [])

    useEffect(() => {
        if (taskId) fetchData(taskId);
    }, [initData, taskId])

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
                        <h2 className="text-lg text-white font-semibold">Редактировать задачу</h2>
                    </div>
                </div>

                    {
                        isLoading ?
                            <TaskFormLoading /> :
                            isError ? (
                                    <div className="w-full flex-col h-full flex justify-center align-middle gap-4 pl-12 pr-12">
                                        <h1 className="text-center font-[700]">
                                            Произошла ошибка при загрузке задачи
                                        </h1>
                                        <Button onClick={() => fetchData(taskId ? taskId : '')}>Повторить попытку</Button>
                                    </div>
                                ) :
                                <div className="w-full p-4 text-black rounded-md shadow-md">
                                    <TaskForm isEdit={true} editTask={task} task_id={taskId} goal_id={goalId}
                                              goalTitle={goalTitle}/>
                                </div>
                    }

                        </div>
                        );
                    }

export default function Task() {
    return (
        <React.Suspense fallback={<Loader2 className="animate-spin" />}>
            <TaskEdit />
        </React.Suspense>
    );
}
