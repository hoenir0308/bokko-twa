'use client';


import { ApiService } from '@/lib/services/api_service';
import type { Task, Goal } from '@/lib/types';
import { useInitData } from '@telegram-apps/sdk-react';
import { useSearchParams } from 'next/navigation';
import React, {MutableRefObject, useCallback, useRef} from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FaChevronLeft } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";
import '../../components/ui/task/timepicker.css'
import 'react-time-picker/dist/TimePicker.css';
import {Loader} from "@/components/ui/Loader/Loader";

function TaskContent() {
    const initData = useInitData();
    const params = useSearchParams();
    const router = useRouter();
    const [task, setTask] = useState<Task | null>(null);
    const [taskId, setTaskId] = useState<string>('');
    const [goalId, setGoalId] = useState<string>('');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [deadline, setDeadline] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

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
        if (initData && taskId !== '') {
            getTask(taskId);
        } else {
            setError('Не удалось получить задачу, обновите страницу')
        }

    }, [initData, taskId])

    const getTask = async (id: string) => {
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
            setIsLoading(true);
            setError(null);
            console.log(id);
            await ApiService.getTask(id, initDataStr).then((data) => {
                console.log(new Date(data.deadline));
                setDeadline(new Date(data.deadline));
                // @ts-ignore
                setEndDate(new Date(data.end_date))
                setTask(data);
            }).catch(() => {
                setError('Не удалось получить задачу, обновите страницу')
            }).finally(() => {
                setIsLoading(false);
            });
        };
    };

    const handleEdit = () => {
        router.push(`/task/edit?task_id=${taskId}&goal_id=${goalId}`);
    };

    const handleGoBack = () => {
        router.back();
    };

    const handleStart = () => {
        router.push('/')
    }

    const handleConfirmTask = async () => {
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

        await ApiService.confurmTask(taskId, initDataStr).finally(() => {
            setIsLoading(false);
        });
    };

    if (error) {
        return (
            <div className="max-h-max max-w-md mx-auto relative flex flex-col h-screen">
            <div className="w-full p-4 text-black rounded-md shadow-md">
                    <h2>{error}</h2>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="max-h-max max-w-md mx-auto relative flex flex-col h-screen">
            <div className="w-full p-4 text-black rounded-md shadow-md">
                    <h2>Загрузка...</h2>
                </div>
            </div>
        )
    }

    if (!task) return null;

    return (
        <div className="max-h-max max-w-md mx-auto relative flex flex-col h-screen">
            <div className="bg-secondary">
            <div className="max-w-[97%] flex items-center py-4 mx-auto">
                    <Button onClick={handleGoBack} className="text-lg font-semibold" size="icon" variant="ghost">
                        <FaChevronLeft color="white" />
                    </Button>
                    <h2 className="text-lg text-white font-semibold">{task.title}</h2>
                </div>
            </div>
            <div className="w-full p-4 text-black rounded-md shadow-md">
                <div className="p-2">
                    <h4 className="ml-4 text-neutral-400">Описание задачи</h4>
                    <p className="border-black border p-2 min-h-10 rounded-xl mb-4 text-sm">
                        {task.description}
                    </p>
                    <div className="grid grid-cols-2">
                        <p className="text-sm mb-2">День выполнения</p>
                        <p className="text-sm mb-2">{endDate ? `${endDate.getDate()}.${endDate.getMonth()}`: "Не задан"}</p>
                        <p className="text-sm">Дедлайн</p>
                        <p className="text-sm">{deadline ? `${deadline.getDate()}.${deadline.getMonth()} - ${deadline.getHours()}:${deadline.getMinutes()}` : "Не задан"}</p>
                        {/*<p>Отношения к целям:</p>*/}
                        {/*<div className="flex flex-col gap-2">*/}
                        {/*    {*/}

                        {/*    }*/}
                        {/*</div>*/}
                    </div>
                    {
                        task.complite ? <h2 className="text-center mt-20 text-lime-700">Задача выполнена</h2> : (
                            <>
                                <Button onClick={handleEdit} className="mt-20 mb-3 w-full text-lg font-medium">
                                    Редактировать
                                </Button>
                            <Button onClick={handleStart} className="mt-20 mb-3 w-full text-lg font-medium">
                                Перейти к выполненению
                            </Button>
                        <Button variant="secondary" onClick={handleConfirmTask} className="w-full text-lg font-medium">
                    {
                        isLoading ? <Loader /> : "Отметить выполненной"
                    }
                </Button>
                            </>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default function Task() {
    return (
        <React.Suspense fallback={<div>loading...</div>}>
            <TaskContent/>
        </React.Suspense>
    );
}
