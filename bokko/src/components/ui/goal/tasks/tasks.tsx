import React, {useCallback, useEffect, useState} from "react";
import type {Task} from "@/lib/types";
import {ApiService} from "@/lib/services/api_service";
import {useRouter} from "next/navigation";

export const TasksList: React.FC<{
    isTaskOpened: boolean,
    createInitDataString: () => string,
    id?: string,
    goalTitle: string,
}> = (
    {
        isTaskOpened,
        createInitDataString,
        id,
        goalTitle
    }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isTasksFetched, setIsTasksFetched] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    console.log(tasks);

    const handleStatus = (task_id: string, goal_id: string) => {
        router.push(`/task?goal_id=${goal_id}&task_id=${task_id}&goal_title=${goalTitle}`)
    };

    const handleGant = (goal_id: string) => {
        router.push(`/gant?goal_id=${goal_id}`);
    };

    const handleCreateTask = () => {
        router.push(`/task/create?goal_id=${id}&goal_title=${goalTitle}`);
    };

    const fetchTasks = useCallback(
        async () => {
            const initDataStr = createInitDataString();
            if (initDataStr && id) {
                setIsLoading(true);
                await ApiService.getTasks(initDataStr, id)
                    .finally(() => setIsLoading(false))
                    .then((data: Task[]) => {
                        console.log(data);
                        setTasks(data);
                        setIsTasksFetched(true);
                    });

            }
        },
        [createInitDataString]
    );

    useEffect(() => {
        if (isTaskOpened && !isTasksFetched) {
            fetchTasks();
        }
    }, [isTaskOpened]);

    if (!isTaskOpened) {
        return null;
    }

    if (isLoading) {
        return (<p className='pl-12 font-[500]'>Загрузка задач...</p>);
    }

    if (tasks.length === 0) {
        return (
            <ul className="mt-2 flex flex-col">
                <p className="text-sm text-gray-500 pl-12">Нет задач для этой цели</p>
                <a onClick={handleCreateTask}
                   className={`ml-12 mt-2 text-md font-[500] text-black cursor-pointer text-s hover:underline`}>+
                    Добавить задачу
                </a>
            </ul>
        )
    }

    return (
        <>
            <ul className="mt-2 flex flex-col">
                {tasks.map((task) => (
                    <li key={task._id} className="relative p-1 hover:bg-gray-100 flex justify-between pl-6 pr-6">
                        {
                            task.complite ?
                                <svg className="scale-75 absolute left-3" xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0,0,256,256" width="24px" height="24px" fillRule="nonzero">
                                    <g fill="#fe794c" fillRule="nonzero" stroke="none" strokeWidth="1"
                                       strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10"
                                       strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none"
                                       fontSize="none" textAnchor="none">
                                        <g transform="scale(10.66667,10.66667)">
                                            <path
                                                d="M12,2c-5.523,0 -10,4.477 -10,10c0,5.523 4.477,10 10,10c5.523,0 10,-4.477 10,-10c0,-5.523 -4.477,-10 -10,-10zM17.707,9.707l-7,7c-0.195,0.195 -0.451,0.293 -0.707,0.293c-0.256,0 -0.512,-0.098 -0.707,-0.293l-3,-3c-0.391,-0.391 -0.391,-1.023 0,-1.414c0.391,-0.391 1.023,-0.391 1.414,0l2.293,2.293l6.293,-6.293c0.391,-0.391 1.023,-0.391 1.414,0c0.391,0.391 0.391,1.023 0,1.414z"></path>
                                        </g>
                                    </g>
                                </svg> :
                                <svg className="scale-75 absolute" style={{left: '14px', top: '6px'}} width="20"
                                     height="20" viewBox="0 0 20 20" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="10" fill="#eaeaea"/>
                                </svg>

                        }
                        <p className={`text-md ml-6 font-[${task.complite ? 500 : 300}] text-s`}>{task.title}</p>
                        <a
                            onClick={() => handleStatus(task._id!, id!)}
                            className={`text-md font-[500] text-black cursor-pointer text-s hover:underline`}>подробнее</a>
                    </li>
                ))}
                <a onClick={() => handleGant(id!)}
                   className={`ml-12 mt-2 text-md font-[500] text-black cursor-pointer text-s hover:underline`}>Смотреть
                    диаграмму Ганта →</a>
                <a onClick={handleCreateTask}
                   className={`ml-12 mt-2 text-md font-[500] text-black cursor-pointer text-s hover:underline`}>+ Добавить задачу
                </a>
            </ul>
        </>
    );
};
