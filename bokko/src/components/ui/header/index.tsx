'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {FaChevronLeft} from 'react-icons/fa';
import {FaHome} from 'react-icons/fa';

import { Button } from '../button';

interface HeaderProps {
    title?: string;
}

export const Header = React.memo(({title}: HeaderProps) => {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    const handleHome = () => {
        router.push('/');
    };

    return (
        <header className="bg-secondary">
            <div className="max-w-[97%] justify-between flex items-center mx-auto">
                <div className=" flex items-center py-4 ">
                    <Button onClick={handleGoBack} className="text-lg font-semibold" size="icon" variant="ghost">
                        <FaChevronLeft color="white"/>
                    </Button>
                    <h2 className="text-lg text-white font-semibold">{title}</h2>
                </div>
                <Button onClick={handleHome} className="text-lg font-semibold" size="icon" variant="ghost">
                    <FaHome color="white"/>
                </Button>
            </div>
        </header>
    );
});

