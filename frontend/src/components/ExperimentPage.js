import React, { useState, useEffect } from 'react';
import income_profiles from '../data/income_with_meta.json';
import recidivism_profiles from '../data/recidivism_with_meta.json';
import income_analysis from '../data/income_analysis.json';
import recidivism_analysis from '../data/recidivism_analysis.json';
import styles from '../assets/ExperimentPage.module.css';
import client_image from '../images/client.png';
import robot_image from '../images/robot.png';

function ExperimentPage({ sessionId, experimentNumber }) {
    const [dialogueHistory, setDialogueHistory] = useState([]);
    const [makingPrediction, setMakingPrediction] = useState(false);
    const [currentProfile, setCurrentProfile] = useState(null);
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [iterationCount, setIterationCount] = useState(0);
    const [selectedFeature, setSelectedFeature] = useState('');
    const [selectedPrediction, setSelectedPrediction] = useState(null);

    // Income Profiles Descriptions
    const incomeProfileDescriptions = {
        'age': 'Age',
        'education.num': 'Years of Education',
        'marital.status': 'Marital Status',
        'occupation': 'Occupation',
        'sex': 'Sex',
        'hours.per.week': 'Hours Worked per Week',
        'workclass': 'Workclass',
    }

    // Recidivism Profiles Descriptions
    const recidivismProfileDescriptions = {
        'race': 'Race',
        'sex': 'Sex',
        'age': 'Age',
        'juv_fel_count': 'Juvenile Felony Count',
        'juv_misd_count': 'Juvenile Misdemeanor Count',
        'priors_count': 'Prior Charges Count',
        'charge_degree': 'Charge Degree',
        'compas_decile_score': 'COMPAS Decile Score',
        'c_charge_desc': 'Short Charge Description',
        'mturk_charge_name': 'Simplified Crime Name',
        'full_charge_description': 'Detailed Charge Description'
    };

    const getDescription = (key) => {
        const isIncome = experimentNumber <= 20;
        return isIncome ? incomeProfileDescriptions[key] : recidivismProfileDescriptions[key];
    };

    const loadRandomProfile = () => {
        const isIncome = experimentNumber <= 20;
        const profiles = isIncome ? income_profiles : recidivism_profiles;
        const randomIndex = Math.floor(Math.random() * profiles.length);
        const profile = profiles[randomIndex];

        const profileIndex = isIncome ? profile.index : profile.id;
        const analysisKey = isIncome ? 'Index' : 'id';
        const analysis = isIncome ? income_analysis : recidivism_analysis;
        const relevantAnalysis = analysis.find(a => a[analysisKey] === profileIndex);

        setCurrentProfile(profile);
        setCurrentAnalysis(relevantAnalysis);
    };

    useEffect(() => {
        loadRandomProfile();
    }, [experimentNumber]);

    const addToDialogueHistory = (message, isUser = true) => {
        setDialogueHistory(prev => [...prev, { message, isUser }]);
        if (isUser) {
            setIterationCount(prev => prev + 1);
        }
    };

    // Placeholder for submitting the user's prediction
    const submitPrediction = (prediction) => {
        console.log(`User predicted: ${prediction}`);
        // Proceed to the next iteration or end the experiment
        if (experimentNumber < 40) {
            setDialogueHistory([]);
            setMakingPrediction(false);
            setSelectedPrediction(null);
            // TODO: Load the next profile and model prediction
        } else {
            // TODO: End the experiment, navigate to Thanks Page or show a summary
        }
    };

    const profileDescriptions = experimentNumber <= 20 ? incomeProfileDescriptions : recidivismProfileDescriptions;

    return (
        <div className={styles.container}>
            <h2 className={styles.taskHeader}>Prediction Task {experimentNumber <= 20 ? 'Income' : 'Recidivism'} ({experimentNumber}/40)</h2>
            <div className={styles.profileDialogueContainer}>
                <div className={styles.profileContainer}>
                    {currentProfile && (
                        <>
                            <div className={styles.profileFeatures}>
                                {Object.entries(currentProfile).map(([key, value]) => (
                                    profileDescriptions[key] && (
                                        <div key={key} className={styles.profileFeature}>
                                            <span className={styles.featureLabel}>{getDescription(key)}:</span>
                                            <span className={styles.featureValue}>{value}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                            <div className={styles.modelPrediction}>
                                {`Model Prediction: ${currentProfile.model_prediction}`}
                            </div>
                            {iterationCount >= 3 && (
                                <div className={styles.userPredictionSection}>
                                    <h3>Make your prediction:</h3>
                                    {experimentNumber <= 20 ? (
                                        <>
                                            <button
                                                className={`${styles.predictionButton} ${selectedPrediction === 'above $50,000' ? styles.selectedButton : ''}`}
                                                onClick={() => setSelectedPrediction('above $50,000')}
                                            >
                                                Above $50,000
                                            </button>
                                            <button
                                                className={`${styles.predictionButton} ${selectedPrediction === 'below $50,000' ? styles.selectedButton : ''}`}
                                                onClick={() => setSelectedPrediction('below $50,000')}
                                            >
                                                Below $50,000
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className={`${styles.predictionButton} ${selectedPrediction === 'will reoffend' ? styles.selectedButton : ''}`}
                                                onClick={() => setSelectedPrediction('will reoffend')}
                                            >
                                                Will Reoffend
                                            </button>
                                            <button
                                                className={`${styles.predictionButton} ${selectedPrediction === 'will not reoffend' ? styles.selectedButton : ''}`}
                                                onClick={() => setSelectedPrediction('will not reoffend')}
                                            >
                                                Will Not Reoffend
                                            </button>
                                        </>
                                    )}
                                    <button
                                        className={`${styles.submitButton} ${selectedPrediction ? styles.activeButton : ''}`}
                                        onClick={submitPrediction}
                                        disabled={!selectedPrediction}
                                    >
                                        Submit
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className={styles.dialogueContainer}>
                    <div className={styles.dialogueHistory}>
                        {dialogueHistory.map((msg, index) => (
                            <div key={index} className={msg.isUser ? styles.userMessage : styles.systemMessage}>
                                <img
                                    src={msg.isUser ? client_image : robot_image}
                                    alt={msg.isUser ? 'User' : 'System'}
                                    className={styles.avatar}
                                />
                                <span>{msg.message}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.featureQuestions}>
                        {Object.keys(profileDescriptions).map(key => (
                            <button
                                key={key}
                                className={styles.featureQuestionButton}
                                onClick={() => {
                                    const question = `What does ${getDescription(key)} tell us about the prediction?`;
                                    setSelectedFeature(key);
                                    addToDialogueHistory(question, true);
                                    setTimeout(() => {
                                        const analysis = currentAnalysis[key];
                                        addToDialogueHistory(analysis, false);
                                    }, 1000);
                                }}
                            >
                                {getDescription(key)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExperimentPage;
