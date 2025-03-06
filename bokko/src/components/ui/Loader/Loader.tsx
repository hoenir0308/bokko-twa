import './Loader.css';
import React from 'react';

export const Loader = React.memo(({isBlack, isSmall}: {isBlack?: boolean, isSmall?: boolean}) => (
    <div className={`lds-ring ${isBlack ? `black` : ''} ${isSmall ? `small` : ''}`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
));
