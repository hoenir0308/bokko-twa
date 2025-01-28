import React, {memo, useCallback, useEffect, useState} from 'react';
import {TaskCard} from "@/components/ui/task/task-card";
import ReactDragListView from "react-drag-listview";
import {Task} from "@/lib/types";
import {ApiService, IEditTask} from "@/lib/services/api_service";
import {useInitData} from "@telegram-apps/sdk-react";
import {Button} from "@/components/ui/button";
import {Loader} from "@/components/ui/Loader/Loader";
import {getRuDayByNum} from "@/lib/helpers/getRuDayByNum";
import {TaskFormListLoading} from "@/components/ui/task/skeletons/task-form-list-loading";

interface taskFormListProps {
    goalTitle: string;
    goalId?: string;
    isDragDate: boolean;
    dateDiff: number;
    setParentTasks: React.Dispatch<React.SetStateAction<Task[]>>
    setIsDragDate: React.Dispatch<React.SetStateAction<boolean>>;
    changeIndex: number;
}

export const TaskFormList = memo((props: taskFormListProps) => {
    const { goalTitle, goalId, isDragDate, dateDiff, setIsDragDate, setParentTasks, changeIndex  } = props;
    const initData = useInitData(true);
    const [isTasksLoading, setIsTasksLoading] = useState<boolean>(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [editedTasks, setEditedTasks] = useState<Task[]>([]);
    const [isListChanged, setIsListChanged] = useState<boolean>(false);

    const fetchTasks = async (id: string) => {
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
            if (goalId) {
                setIsTasksLoading(true)
                await ApiService.getTasks(initDataStr, id).then((data) => {
                    setTasks(data);
                    setParentTasks(data);
                    setEditedTasks(data);
                    console.log(editedTasks);
                }).finally(() => setIsTasksLoading(false));
            }
        }
    };

    useEffect(() => {
        if (changeIndex > 0 && goalId) {
            fetchTasks(goalId)
        }
    }, [changeIndex])

    function onDragEnd (fromIndex: number, toIndex: number) {
        const data = [...editedTasks];
        const item = data.splice(fromIndex, 1)[0];
        data.splice(toIndex, 0, item);
        setEditedTasks(data);
        if (data.findIndex((item, index) => item._id !== tasks[index]._id) === -1) {
            setIsListChanged(false)
        } else {
            setIsListChanged(true)
        }
    }

    const fetchEditTasks = async () => {
        if (initData) {
            let res: IEditTask[] = [];
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
            if (tasks.length > 0) {
                tasks.forEach((taskItem, index) => {
                    if (tasks[index]._id !== editedTasks[index]._id) {
                        res.push({
                            task_id: editedTasks[index]._id || '',
                            updates: {
                                ...editedTasks[index], index: index,
                            }
                        })
                    }
                })

                setIsTasksLoading(true);
                await ApiService.editTasks(res, initDataStr).then((data) => {
                    const restTasks = [...editedTasks.filter((editedTask) => data.findIndex((dataItem) => dataItem._id === editedTask._id) === -1)]
                    setEditedTasks([...data, ...restTasks]);
                    setTasks([...data, ...restTasks]);
                    setIsListChanged(false)
                }).finally(() => setIsTasksLoading(false));
            }
        }
    }

    const removeTask = useCallback(() => (id: string) => {
        setTasks(prev => prev.filter((task) => task._id !== id))
    }, [])

    useEffect(() => {
        fetchTasks(goalId!);
    }, [goalId, initData])


    return (
        <>
            {
                (dateDiff > 0) && (
                    <div className="flex justify-start gap-4 pl-6 pr-6 mt-4">
                        <input
                            type="checkbox"
                            className="text-center h-6 border-black border rounded-xl w-6 hover:bg-neutral-500"
                            onChange={() => setIsDragDate((prev) => !prev)}
                            checked={isDragDate}
                        />
                        <h2 className="block text-lg text-black">Изменить дедлайн остальных задач
                            на {dateDiff} {getRuDayByNum(dateDiff)}</h2>
                    </div>
                )
            }
            <div className="pl-6 pr-8">
                <h2 className="block mt-6 text-lg text-black">Задачи к цели <u>{goalTitle ? goalTitle : ''}</u></h2>
                {
                    isTasksLoading ? (
                            <TaskFormListLoading/>
                        ) :
                        editedTasks.length > 0 ?
                            <ReactDragListView nodeSelector='li' handleSelector='svg' onDragEnd={onDragEnd}>
                                <ul className="flex flex-col gap-1 mt-4">
                                    {editedTasks.map((task) => {
                                        return (
                                            <TaskCard task={task} removeTask={removeTask}
                                                      dateDiff={isDragDate ? dateDiff : undefined}/>
                                        )
                                    })}
                                </ul>
                            </ReactDragListView> :
                            <h2 className="text-md text-neutral-600 mt-2">У этой цели ещё нет задач</h2>
                }
                {
                    isListChanged && (
                        <div className="flex justify-between mt-2 gap-4">
                            <Button
                                disabled={isTasksLoading}
                                onClick={fetchEditTasks}
                                variant="secondary"
                                className={`w-full font-semibold text-lg py-2 mt-4 flex-grow-2 text-md ${isTasksLoading ? 'bg-gray-400' : ''}`}
                            >
                                {
                                    isTasksLoading ? <Loader /> : 'Изменить порядок'
                                }
                            </Button>
                            <Button
                                disabled={isTasksLoading}
                                onClick={() => {
                                    setEditedTasks(tasks)
                                    setIsListChanged(false)
                                }}
                                className={`w-full font-semibold text-lg flex-grow-1 py-4 mt-4 text-md ${isTasksLoading ? 'bg-gray-400' : ''}`}
                            >
                                {
                                    isTasksLoading ? <Loader /> : 'Отменить'
                                }
                            </Button>
                        </div>
                    )
                }
            </div>
        </>
    );
});
