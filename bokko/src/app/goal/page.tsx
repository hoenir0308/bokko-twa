'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ApiService } from '@/lib/services/api_service';
import { Goal } from '@/lib/types';
import { useInitData } from '@telegram-apps/sdk-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa';

export default function Goals() {
    const initData = useInitData(true);
    const router = useRouter();
    const [goal, setGoal] = useState<Goal>({
        title: '',
        description: '',
        deadline: new Date(),
    });
    const [goalId, setGoalId] = useState<string | null>(null); // Изменил тип на null для удобства проверки
    const [goalCreated, setGoalCreated] = useState<boolean>(false); // Для отображения формы/сообщений

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
            const goal_response = await ApiService.createGoal(goal, initDataStr);
            setGoal({ title: '', description: '', deadline: new Date() });
            setGoalId(goal_response._id);
            setGoalCreated(true); // Устанавливаем флаг, что цель создана
        } catch (error) {
            console.error('Failed to create goal:', error);
        }
    };

    const handleGoBack = () => {
        router.back();
    };

    const handleAddTasks = () => {
        router.push(`/task?goal_id=${goalId}`);
    };

    const handleAiHelp = async () => {
        router.push(`/ai?goal_id=${goalId}`);
    };

    return (
        <div className="max-h-max max-w-md mx-auto relative flex flex-col h-screen">
            <div className="bg-secondary">
                <div className="max-w-[97%] flex items-center py-4 mx-auto">
                    <Button onClick={handleGoBack} className="text-lg font-semibold" size="icon" variant="ghost">
                        <FaChevronLeft color="white" />
                    </Button>
                    <h2 className="text-lg text-white font-semibold">Создать цель</h2>
                </div>
            </div>
            <div className="p-4">
                {!goalCreated ? ( // Если цель еще не создана, показываем форму
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <Label className="block mb-1" htmlFor="title">
                                Название:
                            </Label>
                            <Input
                                type="text"
                                id="title"
                                name="title"
                                value={goal.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label className="block mb-1" htmlFor="description">
                                Описание:
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={goal.description}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label className="block mb-1" htmlFor="deadline">
                                Срок выполнения:
                            </Label>
                            <Input
                                type="date"
                                id="deadline"
                                name="deadline"
                                value={goal.deadline.toISOString().substring(0, 10)}
                                onChange={(e) => setGoal({ ...goal, deadline: new Date(e.target.value) })}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <Button type="submit" className="w-full text-lg font-semibold">
                            Создать Цель
                        </Button>
                    </form>
                ) : (
                    <div>
                        <p className="text-center text-green-600 mb-4">Цель успешно создана!</p>
                        <div className="mt-4 flex flex-col space-y-2">
                            <Button onClick={handleAddTasks} className="w-full text-lg font-semibold">
                                Добавить задачи
                            </Button>
                            <Button variant="secondary" onClick={handleAiHelp} className="w-full text-lg font-semibold">
                                Помощь ИИ
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
