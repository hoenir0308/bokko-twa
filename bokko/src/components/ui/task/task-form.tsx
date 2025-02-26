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
import {addDays} from "@/lib/helpers/addDays";
import {getRuDayByNum} from "@/lib/helpers/getRuDayByNum";
import {TaskFormList} from "@/components/ui/task/task-form-list";
import {getRuWeekByNum} from "@/lib/helpers/getRuWeekByNum";
import {Loader} from "@/components/ui/Loader/Loader";

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
                // @ts-ignore
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
                className={`w-full gap-4 font-semibold text-lg py-4 mt-4 ${isLoading ? 'bg-gray-400' : ''}`}
                type="button"
            >
                {
                    isLoading ? <Loader/> : <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_20_2)">
                            <path
                                d="M23.3156 4.96875C23.0625 5.01562 22.6406 5.15625 22.3781 5.2875C22.0875 5.4375 17.5031 9.1875 11.0156 14.6062C-0.440626 24.1594 -0.121876 23.8687 0.0281241 24.4875C0.0656241 24.6094 0.571874 25.2844 1.17187 25.9875C2.07187 27.0562 2.30625 27.2812 2.56875 27.3375C2.74687 27.3656 2.98125 27.3656 3.08437 27.3281C3.1875 27.3 7.93125 23.3906 13.6125 18.6562C19.3031 13.9125 23.9719 10.0312 24 10.0312C24.0281 10.0312 28.6969 13.9125 34.3875 18.6562C40.0688 23.3906 44.8125 27.3 44.9156 27.3281C45.0188 27.3656 45.2531 27.3656 45.4313 27.3375C45.6938 27.2812 45.9281 27.0562 46.8281 25.9875C47.4281 25.2844 47.9344 24.6094 47.9719 24.4875C48.1125 23.9062 48 23.7937 44.5313 20.9062L41.2031 18.1312L41.1563 11.8312L41.1094 5.53125L40.8469 5.27812L40.5938 5.01562L37.5656 4.9875C35.5969 4.96875 34.425 4.9875 34.2094 5.05312C33.5719 5.24062 33.5719 5.25937 33.5438 8.67187L33.5156 11.7375L29.6906 8.55C25.5938 5.12812 25.4719 5.04375 24.3281 4.94062C24.0188 4.9125 23.5594 4.92187 23.3156 4.96875Z"
                                fill="white"/>
                            <path
                                d="M15.3938 19.7063L6.84375 26.7563V34.0688C6.84375 39.1031 6.88125 41.5125 6.94688 41.7656C7.0875 42.2813 7.725 42.8813 8.27813 43.0125C8.57813 43.0969 10.4156 43.125 14.4281 43.125H20.1563V37.4063V31.6875H24H27.8438V37.4063V43.125H33.5719C37.3875 43.125 39.4313 43.0875 39.6938 43.0219C40.2188 42.8906 40.7625 42.4406 40.9781 41.9625C41.1469 41.5969 41.1563 41.175 41.1563 34.1625V26.7563L32.6344 19.7344C27.9563 15.8719 24.0844 12.7031 24.0375 12.6844C23.9906 12.6656 20.1 15.825 15.3938 19.7063Z"
                                fill="white"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_20_2">
                                <rect width="48" height="48" fill="white"/>
                            </clipPath>
                        </defs>
                    </svg>
                }
                {
                    isEdit ? 'Отредактировать задачу' : 'Создать задачу'
                }
            </Button>
            <Button
                variant="secondary"
                disabled={isLoading}
                type="button"
                className={`w-full text-left gap-4 text-wrap h-16 text-lg leading-6 font-semibold py-4 mt-2 ${isLoading ? 'bg-gray-400' : ''}`}
                onClick={() => onSubmit(task_id, true)}
            >
                {
                    isLoading ?
                        <Loader/> :
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="24" width="16" height="64" fill="white"/>
                            <rect x="24" width="16" height="64" fill="white"/>
                            <rect y="24" width="64" height="16" fill="white"/>
                            <rect y="24" width="64" height="16" fill="white"/>
                        </svg>
                }
                {`${isEdit ? 'Отредактировать ' : 'Создать '}  задачу и `}<br />{`начать создание следующей`}
            </Button>
        </form>
    );
});
