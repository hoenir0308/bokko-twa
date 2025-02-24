import React from "react";
import {ProgressBar} from "@/components/ui/progress-bar/progress-bar";

export const GoalHeader = React.memo(({title, onClick, completePercent, isTaskOpened}: {title: string, onClick: () => void, completePercent: number, isTaskOpened: boolean}) => {
    return (
        <div onClick={onClick} className="flex hover:bg-gray-100 h-10 items-center w-full justify-between pl-12 pr-6 gap-4">
            <GoalTitle title={title} completePercent={completePercent} />
            <GoalArrow isTaskOpened={isTaskOpened}  />
        </div>
    )
})

const GoalTitle = React.memo(({title, completePercent}: {title: string, completePercent: number}) => {
    return (
        <div className="flex-row relative">
            <span className="absolute -left-10 -top-0.5"><ProgressBar value={completePercent}/></span>
            <h3 className="text-xl font-[500]">
                {title}
            </h3>
        </div>
    )
})

const GoalArrow = React.memo(({isTaskOpened}: { isTaskOpened: boolean }) => (
    <span>
                    <svg className={isTaskOpened ? 'rotate-90' : ''} width="24" height="24" viewBox="0 0 24 24"
                         fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 2.25C6.624 2.25 2.25 6.624 2.25 12C2.25 17.376 6.624 21.75 12 21.75C17.376 21.75 21.75 17.376 21.75 12C21.75 6.624 17.376 2.25 12 2.25ZM12 20.25C7.451 20.25 3.75 16.549 3.75 12C3.75 7.451 7.451 3.75 12 3.75C16.549 3.75 20.25 7.451 20.25 12C20.25 16.549 16.549 20.25 12 20.25ZM15.53 10.469C15.823 10.762 15.823 11.237 15.53 11.53L12.53 14.53C12.384 14.676 12.192 14.75 12 14.75C11.808 14.75 11.616 14.677 11.47 14.53L8.46997 11.53C8.17697 11.237 8.17697 10.762 8.46997 10.469C8.76297 10.176 9.23801 10.176 9.53101 10.469L12.001 12.939L14.471 10.469C14.763 10.177 15.237 10.177 15.53 10.469Z"
                            fill="black"/>
                    </svg>
                </span>
));
