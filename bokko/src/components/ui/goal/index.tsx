'use client';

import React, {useState, useEffect, useCallback, useMemo} from 'react';
import { useRouter } from 'next/navigation';
import { useInitData } from '@telegram-apps/sdk-react';
import { FaCalendarAlt, FaPlus } from 'react-icons/fa';

import { ApiService } from '@/lib/services/api_service';
import type { Goal, Task } from '@/lib/types';
import { Button } from '../button';
import {GoalHeader} from "./goal-header/goal-header";
import {TasksList} from "./tasks/tasks";

enum GoalFilter {
    CURRENT_GOALS = 'Текущие цели',
    COMPLETED_GOAlS = 'Завершенные цели',
}

const Goals: React.FC = () => {
    const initData = useInitData(true);
    const router = useRouter();

    const [goals, setGoals] = useState<Goal[]>([]);
    const [currentGoals, setCurrentGoals] = useState<Goal[]>([]);
    const [completedGoals, setCompletedGoals] = useState<Goal[]>([])
    const [filterType, setFilterType] = useState<GoalFilter>(GoalFilter.CURRENT_GOALS);
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

    const createInitDataString = useCallback(() => {
        if (!initData) return '';
        return new URLSearchParams({
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
    }, [initData]);

    const fetchGoals = useCallback(async () => {
        const initDataStr = createInitDataString();
        if (initDataStr) {
            const data = await ApiService.getGoals(initDataStr);
            setGoals(data);
        }
    }, [createInitDataString]);
    console.log(goals);

    useEffect(() => {
        if (initData) {
            fetchGoals();
        }
    }, [initData, fetchGoals]);

    const handleGoalClick = () => {
        router.push('/goal');
    };

    const navigateToCalendar = () => {
        router.push('/calendar');
    };

    const renderGoalsList = () => {
        if (goals.length === 0) {
            return (
                <div className="flex flex-col gap-28 mt-28 ml-8">
                    <p className="text-lg text-center">У вас пока нет записанных целей</p>
                    {/*<Button onClick={handleGoalClick} className="text-xl font-semibold w-full h-[50px]">*/}
                    {/*    <FaPlus size={10} /> Добавить цель*/}
                    {/*</Button>*/}
                </div>
            );
        }

        return (
            <ul className="space-y-2 border-0 list-none bg">
                {goals.map((goal) => (
                    <GoalItem
                        key={goal._id}
                        goal={goal}
                        setSelectedGoalId={setSelectedGoalId}
                        isTaskOpened={selectedGoalId === goal._id}
                        createInitDataString={createInitDataString}
                    />
                ))}
            </ul>
        );
    };

    return (
        <div className="relative flex flex-col gap-4 text-black w-full flex-1 p-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-[600]">Мои цели</h2>
                {goals.length > 0 && (
                    <Button onClick={navigateToCalendar} variant="outline" size="icon" className='w-12 rounded-sm border-2'>
                        <FaCalendarAlt className="text-primary" />
                    </Button>
                )}
            </div>
            <div className='min-h-[300px]'>
                {renderGoalsList()}
            </div>
            <Button onClick={handleGoalClick} className="text-xl font-semibold w-full h-[50px] rounded-3xl">
                <FaPlus size={10} /> Добавить цель
            </Button>
        </div>
    );
};

interface GoalItemProps {
    goal: Goal;
    createInitDataString: () => string;
    isTaskOpened: boolean;
    setSelectedGoalId: (id: string | null) => void;
}

const GoalItem: React.FC<GoalItemProps> = React.memo(({ goal, createInitDataString, isTaskOpened, setSelectedGoalId }) => {
    const onGoalClick = () => {
        if (isTaskOpened) {
            setSelectedGoalId(null);
        } else {
            setSelectedGoalId(goal._id ? goal._id : null)
        }

    }

    return (
        <li
            className="py-4 cursor-pointer transition"
        >
            <GoalHeader onClick={onGoalClick} title={goal.title} isTaskOpened={isTaskOpened}  completePercent={goal.complete ? goal.complete : 0} />
            <TasksList isTaskOpened={isTaskOpened} createInitDataString={createInitDataString} id={goal._id} />
        </li>
    );
});

export default Goals;
