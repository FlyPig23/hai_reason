import React from 'react';
import { useNavigate } from 'react-router-dom';

function InstructionPage() {
    let navigate = useNavigate();

    const handleStart = () => {
        navigate('/experiment');
    };

    return (
        <div>
            <h2>Instructions</h2>
            <p>Here are the instructions...</p>
            <button onClick={handleStart}>Start</button>
        </div>
    );
}

export default InstructionPage;
