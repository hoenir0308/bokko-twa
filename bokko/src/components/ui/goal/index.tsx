'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useInitData } from '@telegram-apps/sdk-react';
import { FaCalendarAlt, FaPlus } from 'react-icons/fa';

import { ApiService } from '@/lib/services/api_service';
import type { Goal, Task } from '@/lib/types';
import { Button } from '../button';

const Goals: React.FC = () => {
    const initData = useInitData(true);
    const router = useRouter();

    const [goals, setGoals] = useState<Goal[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

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

    const fetchTasks = useCallback(
        async (goal_id: string) => {
            const initDataStr = createInitDataString();
            if (initDataStr) {
                const data = await ApiService.getTasks(initDataStr, goal_id);
                setTasks(data);
                setSelectedGoal(goals.find((goal) => goal._id === goal_id) || null);
            }
        },
        [createInitDataString, goals]
    );

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
                <div className="flex flex-col gap-28 mt-28">
                    <p className="text-lg text-center">У вас пока нет записанных целей</p>
                    {/*<Button onClick={handleGoalClick} className="text-xl font-semibold w-full h-[50px]">*/}
                    {/*    <FaPlus size={10} /> Добавить цель*/}
                    {/*</Button>*/}
                </div>
            );
        }

        return (
            <ul className="space-y-2">
                {goals.map((goal) => (
                    <GoalItem
                        key={goal._id}
                        goal={goal}
                        selectedGoal={selectedGoal}
                        tasks={tasks}
                        onGoalClick={fetchTasks}
                    />
                ))}
            </ul>
        );
    };

    return (
        <div className="relative flex flex-col gap-4 text-black w-full flex-1 p-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-[500]">Мои цели</h2>
                {goals.length > 0 && (
                    <Button onClick={navigateToCalendar} variant="outline" size="icon">
                        <FaCalendarAlt className="text-primary" />
                    </Button>
                )}
            </div>

            <Button onClick={handleGoalClick} className="text-xl font-semibold w-full h-[50px]">
                <FaPlus size={10} /> Добавить цель
            </Button>

            {renderGoalsList()}
        </div>
    );
};

interface GoalItemProps {
    goal: Goal;
    selectedGoal: Goal | null;
    tasks: Task[];
    onGoalClick: (goalId: string) => void;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal, selectedGoal, tasks, onGoalClick }) => {
    const completedTasks = tasks.filter((task) => task.complite);

    return (
        <li
            className="p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100 transition"
            onClick={() => onGoalClick(goal._id as string)}
        >
            <div className="flex items-center w-full justify-between">
                <div className="flex flex-col">
                    <h3 className="text-md font-medium">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                </div>
                {selectedGoal?._id === goal._id && tasks.length > 0 && (
                    <p>
                        {completedTasks.length}/{tasks.length}
                    </p>
                )}
            </div>

            {selectedGoal?._id === goal._id && <TasksList tasks={tasks} />}
        </li>
    );
};

const TasksList: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    if (tasks.length === 0) {
        return <p className="text-sm text-gray-500">Нет задач для этой цели.</p>;
    }

    return (
        <ul className="mt-2 pl-4 border-l border-gray-400">
            {tasks.map((task) => (
                <li key={task._id} className="p-2 flex items-center border border-gray-300 rounded-md">
                    <input type="checkbox" checked={task.complite} className="mr-2" disabled />
                    <div>
                        <h4 className="text-md font-medium">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default Goals;
