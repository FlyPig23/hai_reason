import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

function InstructionPage() {
    let navigate = useNavigate();

    useEffect(() => {
        // Push a new entry into the history stack
        window.history.pushState(null, null, window.location.pathname);

        // Handle back navigation
        const handleBack = (event) => {
            event.preventDefault();
            alert("You cannot go back during the survey.");
        };

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            alert("You cannot refresh the page during the survey.");
        };

        // Add event listener for popstate
        window.addEventListener('popstate', handleBack);
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup function
        return () => {
            window.removeEventListener('popstate', handleBack);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [navigate]);

    const handleStart = () => {
        navigate('/experiment/1');
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
