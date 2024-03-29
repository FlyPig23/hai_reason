import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import styles from '../assets/ConsentPage.module.css';

function ConsentPage({ sessionId }) {
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

    const handleConsent = () => {
        console.log('Consent given with session ID:', sessionId);
        navigate('/instructions');
    };

    return (
        <div>
            <h2>Consent Page</h2>
            <p>Please read and agree to the terms and conditions to proceed.</p>
            {/* More details here */}
            <button onClick={handleConsent}>I Agree</button>
        </div>
    );
}

export default ConsentPage;
