import {memo, useCallback, useState} from 'react';
import {Task} from "@/lib/types";
import {ApiService} from "@/lib/services/api_service";
import {useInitData} from "@telegram-apps/sdk-react";
import {addDays} from "@/lib/helpers/addDays";
import {Loader} from "lucide-react";

interface TaskCardProps {
  task: Task;
    removeTask: (id: string) => void;
  dateDiff?: number;
}

export const TaskCardLoading = memo(() => {
    return (
        <li className="pt-1 pr-3 pb-1 bg-neutral-500 flex justify-between rounded-md" />
    )
})

export const TaskCard = memo(({task, removeTask, dateDiff = 0}: TaskCardProps) => {
    const initData = useInitData(true);
    const diffDate = addDays(new Date(task.deadline), dateDiff);
    const day = diffDate.getDate();
    const month = diffDate.getMonth();
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const date = {
        day: day < 10 ? '0' + day : day,
        month: month < 10 ? '0' + (month + 1) : month + 1
    }

    const handleDeleteTask = useCallback(async () => {
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
            setIsDeleting(true)
            await ApiService.deleteTask(task._id!, initDataStr).then(() => {
                removeTask(task._id!)
            }).finally(() => setIsDeleting(false))
        }
    }, [initData])

    return (
        <li className="pt-2 pr-3 pb-2 bg-neutral-200 flex justify-between hover:bg-secondary cursor-pointer items-center rounded-sm" key={task._id}>
            <p className="text-black ml-2 truncate">
                {task.title}
            </p>
            <div className="flex justify-end gap-4">
                <p className="text-black">{date.day + '.' + date.month}</p>
                <button type="button" disabled={isDeleting} onClick=    {handleDeleteTask} className="cursor-pointer hover:opacity-50 mt-0.5 scale-150" title="Удалить задачу">
                    {
                        isDeleting ? <Loader/> :
                            <svg className="" width="13" height="13" viewBox="0 0 13 13" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12.125 2.4375H9.90061C9.49686 2.4375 9.13938 2.18 9.01125 1.79625L8.81377 1.20312C8.68564 0.819996 8.32874 0.5625 7.92437 0.5625H5.07498C4.67123 0.5625 4.31375 0.819996 4.18562 1.20312L3.98875 1.79625C3.86062 2.18 3.50314 2.4375 3.09939 2.4375H0.875C0.7025 2.4375 0.5625 2.5775 0.5625 2.75C0.5625 2.9225 0.7025 3.0625 0.875 3.0625H1.83249L2.32127 10.3956C2.39752 11.5406 3.35627 12.4375 4.50377 12.4375H8.49562C9.64312 12.4375 10.6019 11.5406 10.6781 10.3956L11.1669 3.0625H12.125C12.2975 3.0625 12.4375 2.9225 12.4375 2.75C12.4375 2.5775 12.2975 2.4375 12.125 2.4375ZM4.77873 1.40126C4.82123 1.27313 4.94063 1.1875 5.07563 1.1875H7.92502C8.05939 1.1875 8.17877 1.27313 8.22127 1.40126L8.41875 1.99437C8.47313 2.15687 8.55251 2.30562 8.65126 2.4375H4.34874C4.44749 2.30562 4.52752 2.15687 4.58189 1.99437L4.77873 1.40126ZM10.055 10.3537C10.0006 11.1719 9.31561 11.8119 8.49623 11.8119H4.50438C3.68438 11.8119 2.99999 11.1712 2.94562 10.3537L2.45936 3.06187H3.09939C3.16626 3.06187 3.23186 3.05437 3.29749 3.04625C3.32311 3.05312 3.34749 3.06187 3.37561 3.06187H9.62561C9.65311 3.06187 9.67811 3.05312 9.70374 3.04625C9.76873 3.05437 9.83437 3.06187 9.90187 3.06187H10.5419L10.055 10.3537ZM8.0625 5.875V9C8.0625 9.1725 7.9225 9.3125 7.75 9.3125C7.5775 9.3125 7.4375 9.1725 7.4375 9V5.875C7.4375 5.7025 7.5775 5.5625 7.75 5.5625C7.9225 5.5625 8.0625 5.70188 8.0625 5.875ZM5.5625 5.875V9C5.5625 9.1725 5.4225 9.3125 5.25 9.3125C5.0775 9.3125 4.9375 9.1725 4.9375 9V5.875C4.9375 5.7025 5.0775 5.5625 5.25 5.5625C5.4225 5.5625 5.5625 5.70188 5.5625 5.875Z"
                                    fill="black"/>
                            </svg>
                    }
                </button>
                <svg className="cursor-pointer hover:opacity-50 mt-0.5" width="14" height="20" viewBox="0 0 14 23"
                     fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="2.94737" cy="2.94737" r="2.5" fill="black"/>
                    <circle cx="2.94737" cy="11.0526" r="2.5" fill="black"/>
                    <circle cx="2.94737" cy="19.1578" r="2.5" fill="black"/>
                    <circle cx="11.0528" cy="19.1578" r="2.5" fill="black"/>
                    <circle cx="11.0528" cy="2.94737" r="2.5" fill="black"/>
                    <circle cx="11.0528" cy="11.0526" r="2.5" fill="black"/>
                </svg>
            </div>
        </li>
    );
});
