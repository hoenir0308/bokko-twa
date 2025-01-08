import React, {memo} from 'react';
import '../timepicker.css';
import Skeleton from "@/components/ui/skeleton/Skeleton";
import {TaskFormListLoading} from "@/components/ui/task/skeletons/task-form-list-loading";

export const TaskFormLoading = memo(() => {
    return (
        <form>
            <Skeleton
                height={30}
                width={'100%'}
                className="font-[500] w-[100%] pl-6 text-lg mb-4 h-10"
            />
            <Skeleton
                className="pl-6 mb-6"
                height={30}
                width="100%"
            />
            <Skeleton
                className="pl-6 mb-6"
                border={12}
                height={120}
                width="100%"
            />
            <Skeleton
                className="pl-6 mb-6"
                border='8'
                height={30}
                width="100%"
            />
            <div className="flex space-x-4 overflow-x-auto pb-4" id="start-picker">
                <Skeleton border={8} width={40} height={50}/>
                <Skeleton border={8} width={40} height={50}/>
                <Skeleton border={8} width={40} height={50}/>
                <Skeleton border={8} width={40} height={50}/>
                <Skeleton border={8} width={40} height={50}/>
                <Skeleton border={8} width={40} height={50}/>
                <Skeleton border={8} width={40} height={50}/>
                <Skeleton border={8} width={35} height={50}/>
            </div>
            <Skeleton width={180} height={30} className="block text-lg text-black mt-6 mb-5 ml-6"/>
            <div className="flex justify-between pl-6 pr-6">
                <Skeleton
                    height={50}
                    width={140}
                    className="text-center h-10 border rounded-xl w-14"
                />
                <div className="flex justify-right">
                    <Skeleton
                        height={50}
                        width={50}
                        className="text-center border rounded-xl w-14"
                    />
                    <span className="font-[700] ml-1 mt-2 mr-1"></span>
                    <Skeleton
                        height={50}
                        width={50}
                        className="text-center border rounded-xl w-14"
                    />
                </div>
            </div>
            <div className="flex gap-8 pl-6 pr-6 mt-6 mb-6">
                <Skeleton height={30} width={35}/>
                <Skeleton height={30} width='100%'/>
            </div>
            <TaskFormListLoading />
            <Skeleton
                width={`100%`}
                height={40}
                border={12}
                className={`mb-4 mt-6`}
            />
            <Skeleton
                width={`100%`}
                border={12}
                height={40}
                className={`w-full font-semibold text-lg py-4 mt-4}`}
            />
        </form>
    );
});
