import './Loader.css';
import React from 'react';

export const Loader = React.memo(() => (
    <div className="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
));
