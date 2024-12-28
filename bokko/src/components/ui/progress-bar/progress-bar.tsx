import { memo } from 'react';
import './progress-bar.css'
import {classNames} from "@/components/dev/classNames/classNames";

interface ProgressBarProps {
    className?: string;
    value?: number;
}

export const ProgressBar = memo(({className, value}: ProgressBarProps) => {
    let color = value === 0 ? '#f0f0f0' : '#ffffff';

    return (
        <div className={classNames('progress-bar', {}, [className])} style={{background: `radial-gradient(closest-side, white 69%, transparent 70%), conic-gradient(#e1855cff ${value}%, ${color} 0)`}}>
            <progress
                value={value ? value : 0}
                max="100"
                className="invisible w-0 h-0"
            />
        </div>
    );
}
)

