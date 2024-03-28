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
    const [sessionId, setSessionId] = useState('');

    useEffect(() => {
        // Generate a session ID when the app is first loaded
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        setSessionId(newSessionId);
    }, []);

    const experimentRoutes = [];
    for (let i = 1; i <= 40; i++) {
        experimentRoutes.push(
            <Route
                key={i}
                path={`/experiment/${i}`}
                element={<ExperimentPage sessionId={sessionId} experimentNumber={i} />}
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
