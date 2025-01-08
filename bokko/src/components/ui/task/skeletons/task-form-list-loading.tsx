import React, {memo} from 'react';
import '../timepicker.css';
import Skeleton from "@/components/ui/skeleton/Skeleton";

export const TaskFormListLoading = memo(() => {
    return (
            <div className="flex flex-col gap-1 pl-6 pr-6">
                <Skeleton height={30} width='100%' />
                <Skeleton height={30} width='100%' />
                <Skeleton height={30} width='100%' />
                <Skeleton height={30} width='100%' />
            </div>
    );
});
