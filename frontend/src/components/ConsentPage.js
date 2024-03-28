import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/ConsentPage.module.css';

function ConsentPage() {
    let navigate = useNavigate();

    const handleConsent = () => {
        // Step 1: Create a user session ID
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        console.log('Consent given with session ID:', sessionId);

        // Step 2: Submit the user session ID to the backend
        fetch('http://127.0.0.1:5000/consent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                navigate('/instructions');
            })
            .catch((error) => {
                console.error('Error:', error);
            });
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
