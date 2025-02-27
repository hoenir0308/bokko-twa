'use client';

import CalendarComponent from '@/components/ui/calendar';

export default function Calendar() {
    const curDate = new Date();

    return (
        <div className="bg-gray-100">
            <CalendarComponent curDate={curDate} />
        </div>
    );
}
