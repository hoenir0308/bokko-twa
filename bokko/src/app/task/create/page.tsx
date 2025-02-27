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
import {Loader2} from "lucide-react";
import {Header} from "@/components/ui/header";

function TaskCreate() {
    const initData = useInitData(true);
    const params = useSearchParams();
    const router = useRouter();
    const [goalId, setGoalId] = useState<string>('');
    const [goalTitle, setGoalTitle] = useState<string>('');

    useEffect(() => {
        const id = params.get('goal_id');
        const title = params.get('goal_title');
        if (title) {
            setGoalTitle(title);
        }
        if (id) {
            setGoalId(id);
        }
    }, [setGoalId, setGoalTitle])

    const handleGoBack = () => {
        router.back();
    };
        return (
            <div className="max-h-max max-w-md mx-auto relative flex flex-col h-screen">
                <Header title={'Добавить задачу'} />
                <div className="w-full p-4 text-black rounded-md shadow-md">
                    <TaskForm isEdit={false} goal_id={goalId} goalTitle={goalTitle}  />
                </div>
            </div>
        );
}

export default function Task() {
    return (
        <React.Suspense fallback={<Loader2 className="animate-spin" />}>
            <TaskCreate />
        </React.Suspense>
    );
}
