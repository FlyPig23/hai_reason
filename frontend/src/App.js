import React, { useState, useEffect } from 'react';
import './App.css';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import ConsentPage from "./components/ConsentPage";
import InstructionPage from "./components/InstructionPage";
import ExperimentPage from "./components/ExperimentPage";
import ThanksPage from "./components/ThanksPage";

function App() {
    const [sessionId, setSessionId] = useState(() => sessionStorage.getItem('sessionId') || '');
    const [assignedTask, setAssignedTask] = useState(() => sessionStorage.getItem('assignedTask') || '');

    useEffect(() => {
        // Generate a session ID when the app is first loaded
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        // Randomly assign a task to the user
        const tasks = ['income', 'recidivism'];
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)];

        // Store session ID and assigned task in state and web session storage
        setSessionId(newSessionId);
        setAssignedTask(randomTask);
        sessionStorage.setItem('sessionId', newSessionId);
        sessionStorage.setItem('assignedTask', randomTask);

        // Upload session ID and assigned task to backend
        fetch('http://127.0.0.1:5000/session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId: newSessionId, assignedTask: randomTask }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, []);

    const experimentRoutes = [];
    for (let i = 1; i <= 20; i++) {
        experimentRoutes.push(
            <Route
                key={i}
                path={`/experiment/${i}`}
                element={<ExperimentPage sessionId={sessionId} experimentNumber={i} assignedTask={assignedTask} />}
            />
        );
    }

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Navigate replace to="/consent" />} />
                    <Route path="/consent" element={<ConsentPage sessionId={sessionId} />} />
                    <Route path="/instructions" element={<InstructionPage sessionId={sessionId} />} />
                    {experimentRoutes}
                    <Route path="/thanks" element={<ThanksPage sessionId={sessionId} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
