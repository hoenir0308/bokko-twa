import { CSSProperties, memo } from 'react';
// @ts-ignore
import './Skeleton.css';

interface SkeletonProps {
    className?: string;
    height?: string | number;
    width?: string | number;
    border?: string | number;
}

export const Skeleton = memo((props: SkeletonProps) => {
    const {
        className,
        border,
        height,
        width,
    } = props;

    const styles: CSSProperties = {
        width,
        height,
        borderRadius: border,
    };

    return (
        <div className={`Skeleton ${className}`} style={styles} />
    );
});
export default Skeleton;
