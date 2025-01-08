import React, {memo, MutableRefObject, useEffect, useRef, useState} from 'react';
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import {Button} from "@/components/ui/button";
import {useInitData} from "@telegram-apps/sdk-react";
import {useRouter} from "next/navigation";
import type {Task} from "@/lib/types";
import {ApiService, IEditTask} from "@/lib/services/api_service";
import './timepicker.css';
import {Loader} from "@/components/ui/Loader/Loader";
import {addDays} from "@/lib/helpers/addDays";
import {getRuDayByNum} from "@/lib/helpers/getRuDayByNum";
import {TaskFormList} from "@/components/ui/task/task-form-list";
import {getRuWeekByNum} from "@/lib/helpers/getRuWeekByNum";

interface Props {
  editTask?: Task;
  isEdit: boolean;
  goal_id: string;
  task_id?: string;
  goalTitle?: string;
}

export const TaskForm = memo((props:  Props) => {
    const { editTask, isEdit, goal_id, task_id, goalTitle = '' } = props;
    const initData = useInitData(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDragDate, setIsDragDate] = useState<boolean>(false);
        const [tasks, setTasks] = useState<Task[]>([]);
    const router = useRouter();
    const [dateDiff, setDateDiff] = useState<number>(0);
    const minutesRef = useRef() as MutableRefObject<HTMLInputElement>;
    const hoursRef = useRef() as MutableRefObject<HTMLInputElement>;
    const [minutes, setMinutes] = useState<string>('');
    const [hours, setHours] = useState<string>('');
    const [days, setDays] = useState<any>([]);
    const [startDate, setStartDate] = useState<Date>(editTask?.end_date ? editTask.end_date : new Date);
    const [changeIndex, setChangeIndex] = useState<number>(0);
    const [pushValue, setPushValue] = useState<string>('0');

    console.log(task_id, goal_id, isEdit)

    const generateDays = () => {
        const days = [];
        for (let i = 0; i < 30; i++) {
            days.push(dayjs(new Date()).add(i, 'day').toDate());
        }
        return days;
    };
    const [task, setTask] = useState<Task>(editTask ? { ...editTask, deadline: new Date(editTask.deadline) } : {
        title: '',
        description: '',
        deadline: new Date(),
        end_date: new Date(),
        complite: false,
        index: tasks.length
    });

    const handleHoursChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const num = Number(e.target.value);
        if (num < 24 && num >= 0) {
            if (e.target.value.length >= 2) minutesRef.current.focus();
            setHours(e.target.value);
        }

        //<--- focus second input
    }

    const onSubmit = async (id?: string, isNext?: boolean) => {
        console.log(initData, id)
        if (!initData) return;

        task.deadline.setMinutes(Number(minutes === '' ? 0 : minutes))
        task.deadline.setHours(Number(hours === '' ? 0 : hours));
        task.deadline.setMilliseconds(0);

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
        if (isEdit) {
            if (!id) return;
            await ApiService.editTasks([{
                task_id: id,
                updates: {...task, end_date: startDate, deadline: new Date(task.deadline), create_date: new Date(task.create_date)},
            }], initDataStr).then(async () => {
                await onFulfilledTask(initDataStr, isNext, editTask?._id)
            }).finally(() => setIsLoading(false));
        } else {
            if (goal_id) {
                await ApiService.createTask(goal_id, task, initDataStr).then(async (newTask) => {
                    await onFulfilledTask(initDataStr, isNext, newTask._id)
                }).finally(() => setIsLoading(false));
            }
        }
    }

    const onFulfilledTask = async (str: string, isNext?: boolean, new_task_id?: string) => {
        console.log(isNext);
        if (isDragDate) {
            const res: IEditTask[] = tasks.map((resTask) => {
                const editTask: IEditTask = {
                    task_id: resTask._id!,
                    updates: {
                        ...resTask,
                        deadline: addDays(new Date(resTask.deadline), dateDiff),
                    }
                };
                return editTask;
            })
            await ApiService.editTasks(res, str).then(() => {
                if (isNext) {
                    setTask({
                        title: '',
                        description: '',
                        deadline: new Date(),
                        end_date: new Date(),
                        complite: false,
                        index: tasks.length
                    })
                    setChangeIndex(prev => prev + 1)
                    router.push(`/task/create?goal_title=${goalTitle}&goal_id=${goal_id}`)
                }
                router.push(`/task?goal_title=${goalTitle}&goal_id=${goal_id}&task_id=${new_task_id}`)
            })
        } else {
            if (isNext) {
                setTask({
                    title: '',
                    description: '',
                    deadline: new Date(),
                    end_date: new Date(),
                    complite: false,
                    index: tasks.length
                })
                setChangeIndex(prev => prev + 1)
                router.push(`/task/create?goal_title=${goalTitle}&goal_id=${goal_id}`)
            } else {
                router.push(`/task?goal_title=${goalTitle}&goal_id=${goal_id}&task_id=${new_task_id}`)
            }
        }
    }

    const onBackspace = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && minutes.length === 0) {
            hoursRef.current.focus();
        }
    }

    const handleMinutesChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const num = Number(e.target.value);
        if (num < 60 && num >= 0) {
            setMinutes(e.target.value);
        }
        //<--- focus second input
    }

    useEffect(() => {
        setDays(generateDays());
        if (editTask) {
            const m = new Date(editTask.deadline).getMinutes()
            const h = new Date(editTask.deadline).getHours()
            setMinutes(m < 10 ? '0' + m.toString() : m.toString())
            setHours(h < 10 ? '0' + h.toString() : h.toString())
        }
    }, [])

    useEffect(() => {
        setDateDiff(Math.round((new Date(task?.deadline).getTime() - (editTask ? new Date(editTask.deadline).getTime() : new Date().getTime())) / (1000*60*60*24)) % 7)
        console.log(((new Date(task?.deadline).getTime() - (editTask ? new Date(editTask.deadline).getTime() : new Date().getTime()))));
        console.log(task?.deadline.getTime());
    }, [task.deadline])


    useEffect(() => {
        if (!isEdit) {
            setTask({...task, index: tasks.length})
        }
    }, [tasks])

        return (
            <form>
                <input
                    placeholder={'Название задачи*'}
                    type="text"
                    id="title"
                    name="title"
                    value={task.title}
                    onChange={(e) => setTask({...task, title: e.target.value})}
                    className="font-[500] border-0 border-b-black border-b w-[100%] pl-6 text-lg mb-4"
                    required
                />
                <Label htmlFor="description">
                    <p className="block mb-1 ml-6 text-lg text-neutral-400">Описание задачи</p>
                </Label>
                <Textarea
                    id="description"
                    name="description"
                    className="pl-6 mb-6"
                    value={task.description}
                    onChange={(e) => setTask({...task, description: e.target.value})}
                    required
                />
                <Label htmlFor="start-picker">
                    <p className="block mb-3 ml-6 text-lg text-black">Назначить день выполнения</p>
                </Label>
                <div className="flex space-x-4 overflow-x-auto pb-4" id="start-picker">
                    {days.map((day: Date, index: number) => (
                        <div
                            key={index}
                            className={`p-2 cursor-pointer text-center rounded-md ${
                                dayjs(day).isSame(startDate, 'day') ? 'bg-primary hover:bg-primary/90' : 'bg-gray-100'
                            }`}
                            onClick={() => setStartDate(day)}
                        >
                            <div>{dayjs(day).locale('ru').format('D')}</div>
                            <div>{dayjs(day).locale('ru').format('dd').toUpperCase()}</div>
                        </div>
                    ))}
                </div>
                <Label htmlFor="deadline-picker">
                    <p className="block text-lg text-black mt-6 mb-3 ml-6">Назначить дедлайн</p>
                </Label>
                <div className="flex justify-between">
                    <DatePicker
                        className="ml-6 h-10 border-black border rounded-xl text-center w-32"
                        id="deadline-picker"
                        placeholderText="Дата"
                        selected={task.deadline}
                        onChange={(date) => setTask({...task, deadline: date ? date : new Date()})}
                    />
                    <div className="flex justify-right">
                        <input
                            maxLength={2}
                            type="number"
                            placeholder={'--'}
                            className="text-center h-10 border-black border rounded-xl w-14"
                            onChange={(e) => handleHoursChange(e)}
                            value={hours}
                            ref={hoursRef}
                        />
                        <span className="font-[700] ml-1 mt-2 mr-1">:</span>
                        <input
                            maxLength={2}
                            type="number"
                            placeholder={'--'}
                            onKeyDown={(e) => onBackspace(e)}
                            className="text-center mr-6 h-10 border-black border rounded-xl w-14"
                            ref={minutesRef}
                            onChange={(e) => handleMinutesChange(e)}
                            value={minutes}
                        />
                    </div>
                </div>
                <TaskFormList goalTitle={goalTitle} goalId={goal_id} dateDiff={dateDiff} isDragDate={isDragDate}
                              setIsDragDate={setIsDragDate} setParentTasks={setTasks} changeIndex={changeIndex}/>
                <div className="flex justify-center pl-6 pr-6 items-center mt-4 gap-4">
                    <input placeholder={'--'} type="checkbox" className="border-black rounded-md w-5 h-5"
                           defaultValue={1}/>
                    <p>
                        Добавить пуш-уведомление
                    </p>
                </div>
                <div className="flex justify-left pl-6 pr-6 items-center mt-4 gap-2">
                    <p>
                    Напомнить за
                    </p>
                    <input placeholder={'--'} onChange={(e) => setPushValue(e.target.value)} type="number" className="border-black border rounded-sm text-center w-12 h-6"
                           value={pushValue}/>
                    <select className="border-black text-center border rounded-sm w-24 h-6">
                        <option>
                            {getRuDayByNum(Number(pushValue))}
                        </option>
                        <option>
                            {getRuWeekByNum(Number(pushValue))}
                        </option>
                    </select>
                </div>
                <Button
                    disabled={isLoading}
                    onClick={() => onSubmit(task_id)}
                    className={`w-full font-semibold text-lg py-4 mt-4 ${isLoading ? 'bg-gray-400' : ''}`}
                    type="button"
                >
                    {
                        isLoading ? <Loader/> : (isEdit ? 'Начать достижение цели' : 'Создать задачу')
                    }
                </Button>
                <Button
                    variant="secondary"
                    disabled={isLoading}
                    type="button"
                    className={`w-full font-semibold text-lg py-4 mt-2 ${isLoading ? 'bg-gray-400' : ''}`}
                    onClick={() => onSubmit(task_id, true)}
                >
                    {
                        isLoading ? <Loader/> : 'Создать следующую задачу'
                    }
                </Button>
            </form>
        );
});
