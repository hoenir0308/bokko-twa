'use client';

import { ApiService } from '@/lib/services/api_service';
import type { Task } from '@/lib/types';
import { useInitData } from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import 'dayjs/locale/ru';
import { Button } from '../button';
import { FaChevronLeft } from 'react-icons/fa';

interface CalendarProps {
    curDate: Date;
}

const CalendarComponent: React.FC<CalendarProps> = ({ curDate }) => {
    const initData = useInitData(true);
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [date, setDate] = useState<Date>(curDate);

    const generateDays = () => {
        const days = [];
        for (let i = 0; i < 30; i++) {
            days.push(dayjs(curDate).add(i, 'day').toDate());
        }
        return days;
    };

    const days = generateDays();

    useEffect(() => {
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

        const fetchData = async () => {
            const isoDate = dayjs(date).toISOString();
            const data = await ApiService.getTasks(initDataStr, null, isoDate);
            setTasks(data);
        };

        fetchData();
    }, [initData, date]);

    const handleConfirmTask = async (task_id: string) => {
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

        await ApiService.confurmTask(task_id, initDataStr);
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== task_id));
    };

    const handleTaskClick = () => {
        router.push('/task');
    };

    const handleGantClick = () => {
        router.push('/gant');
    };

    const handleGoBack = () => {
        router.back();
    };

    return (
        <div className="max-h-max max-w-md mx-auto relative flex flex-col h-screen">
            <div className="mb-4 bg-secondary">
                <div className="max-w-[97%] flex items-center py-4 mx-auto">
                    <Button onClick={handleGoBack} className="text-lg font-semibold" size="icon" variant="ghost">
                        <FaChevronLeft color="white" />
                    </Button>
                    <h2 className="text-lg text-white font-semibold">Мой календарь</h2>
                </div>
            </div>

            <div className="p-4 flex flex-col justify-between h-full">
                <div>
                    <div className="flex space-x-4 overflow-x-auto pb-4">
                        {days.map((day, index) => (
                            <div
                                key={index}
                                className={`p-2 cursor-pointer text-center rounded-md ${
                                    dayjs(day).isSame(date, 'day') ? 'bg-gray-300' : 'bg-gray-100'
                                }`}
                                onClick={() => setDate(day)}
                            >
                                <div>{dayjs(day).locale('ru').format('D')}</div>
                                <div>{dayjs(day).locale('ru').format('dd').toUpperCase()}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4">
                        <h3 className="text-md font-bold mb-2">
                            Задачи на {dayjs(date).locale('ru').format('D MMMM YYYY')}:
                        </h3>
                        {tasks.length === 0 ? (
                            <div className="text-center text-gray-500">
                                У вас нет задач на день
                                <br />
                                Можно отдыхать!
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {tasks.map((task) => (
                                    <li
                                        key={task._id}
                                        className="bg-gray-100 p-2 rounded-md shadow-sm flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="font-semibold">{task.title}</p>
                                            <p className="text-gray-600">{task.description}</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="ml-4"
                                            checked={task.complite}
                                            onChange={() => handleConfirmTask(task?._id || '')}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="space-y-2 w-full">
                    <Button onClick={handleTaskClick} className="w-full font-semibold text-lg">
                        + Добавить задачу
                    </Button>
                    <Button onClick={handleGantClick} className="font-semibold w-full text-lg" variant="secondary">
                        Диаграмма Ганта
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CalendarComponent;
