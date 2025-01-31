'use client';

import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useEffect, useState } from 'react';
import { ApiService } from '@/lib/services/api_service';
import type { Goal } from '@/lib/types';
import { useInitData } from '@telegram-apps/sdk-react';
import { useRouter } from 'next/navigation';
import { FaChevronLeft } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Loader2 } from 'lucide-react';

export default function GanttComponent() {
    const initData = useInitData(true);
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [open, setOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [initDataBlyat, setInitDataBlyat] = useState<any>(null);


    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
    const fetchTasks  =   async (goalId: string | null, initData : string) => {
        await ApiService.getTasks(initData, goalId).then((data]) => {
            setTasks(
                data.map((task: any) => ({
                    id: task._id!,
                    name: task.title,
                    start: new Date(task.create_date || task.deadline),
                    end: new Date(task.end_date || task.deadline),
                    progress: task.complite ? 100 : 0,
                    type: 'task',
                }))
            );
        }).finally(() => {
            setLoading(false);
        });

    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
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
            setInitDataBlyat(initDataStr);
            try {
                await ApiService.getGoals(initDataStr).then((data: Goal[]) => {
                    setGoals(data);
                    fetchTasks( data[0]._id!, initDataStr);

                });

            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [initData]);

    const handleGoalChange = (value: string) => {
        fetchTasks(value, initDataBlyat);
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
                    <h2 className="text-lg text-white font-semibold">Диаграмма Ганта</h2>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="animate-spin" />
                </div>
            ) : (
                <div className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                        {goals && goals.length > 0 && (
                            <Select onValueChange={handleGoalChange} defaultValue={goals[0]._id}>
                                <SelectTrigger id="goalSelect" className="mt-1 w-fit border-none">
                                    <SelectValue placeholder="-- Выберите цель --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {goals.map((goal) => (
                                        <SelectItem key={goal._id} value={goal._id!}>
                                            {goal.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="overflow-x-auto flex flex-col h-full">
                        {tasks.length > 0 ? (
                            loading ? (
                                <div>Загрузка данных...</div>
                            ) : (
                                <Gantt
                                    tasks={tasks}
                                    viewMode={ViewMode.Day}
                                    columnWidth={windowWidth < 768 ? 60 : 80} // адаптивная ширина колонок
                                    listCellWidth={''} // скрываем список задач
                                    ganttHeight={windowWidth < 768 ? 300 : 500} // адаптивная высота
                                    headerHeight={60} // адаптивная высота заголовка
                                    rowHeight={60}
                                    barCornerRadius={20}
                                    barFill={80}
                                    onClick={(task) => {
                                        setSelectedTask(task);
                                        setOpen(true);
                                        console.log(task);
                                    }}
                                    barBackgroundColor="#bcdffc"
                                    locale="ru"
                                />
                            )
                        ) : (
                            <></>
                        )}
                        <Drawer
                            open={open}
                            onOpenChange={(open) => {
                                setOpen(open);
                                setSelectedTask(null);
                            }}
                        >
                            <DrawerContent>
                                <DrawerHeader>
                                    <DrawerTitle>{selectedTask?.name}</DrawerTitle>
                                    <DrawerDescription>
                                        От {selectedTask?.start.toLocaleDateString()} до{' '}
                                        {selectedTask?.end.toLocaleDateString()}
                                    </DrawerDescription>
                                </DrawerHeader>

                                <div className="flex items-center gap-4 p-4">
                                    <p className="whitespace-nowrap">Ваш прогресс:</p>
                                    <div className="w-full h-2 bg-none rounded-full">
                                        <div
                                            className="h-2 bg-primary rounded-full"
                                            style={{ width: `${selectedTask?.progress}%` }}
                                        />
                                    </div>
                                    {selectedTask?.progress}%
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </div>
            )}
        </div>
    );
}
