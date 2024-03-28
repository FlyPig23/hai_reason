import React, {useState, useEffect, useMemo, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import income_profiles from '../data/income_with_meta.json';
import recidivism_profiles from '../data/recidivism_with_meta.json';
import income_analysis from '../data/income_analysis.json';
import recidivism_analysis from '../data/recidivism_analysis.json';
import styles from '../assets/ExperimentPage.module.css';
import client_image from '../images/client.png';
import robot_image from '../images/robot.png';

function ExperimentPage({ sessionId, experimentNumber, assignedTask }) {
    const navigate = useNavigate();

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

    const [dialogueHistory, setDialogueHistory] = useState([]);
    //const [makingPrediction, setMakingPrediction] = useState(false);
    const [currentProfile, setCurrentProfile] = useState(null);
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [iterationCount, setIterationCount] = useState(0);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [selectedFeatureAndAnalysis, setSelectedFeatureAndAnalysis] = useState(null);
    const [userAgreement, setUserAgreement] = useState(null);
    const [analyzedFeatures, setAnalyzedFeatures] = useState([]);

    const isIncome = assignedTask === 'income';

    const profiles = isIncome ? income_profiles : recidivism_profiles;
    const analysisData = isIncome ? income_analysis : recidivism_analysis;
    const profileDescriptions = useMemo(() => {
        return isIncome ? {
            'age': 'Age',
            'education.num': 'Years of Education',
            'marital.status': 'Marital Status',
            'occupation': 'Occupation',
            'sex': 'Sex',
            'hours.per.week': 'Hours Worked per Week',
            'workclass': 'Workclass',
        } : {
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
    }, [isIncome]);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * profiles.length);
        const selectedProfile = profiles[randomIndex];
        const selectedAnalysis = analysisData[randomIndex]; // Assuming alignment by index

        setCurrentProfile(selectedProfile);
        setCurrentAnalysis(selectedAnalysis);
    }, [assignedTask, experimentNumber, profiles, analysisData]);

    const selectRandomFeatureAndAnalysis = useCallback(() => {
        const unanalyzedFeatures = Object.keys(profileDescriptions).filter(feature => !analyzedFeatures.includes(feature));
        if (unanalyzedFeatures.length === 0) {
            return;
        }

        const randomFeature = unanalyzedFeatures[Math.floor(Math.random() * unanalyzedFeatures.length)];
        const analysis = currentAnalysis[randomFeature];
        setSelectedFeatureAndAnalysis({ feature: randomFeature, analysis });
        setUserAgreement(null);
    }, [profileDescriptions, analyzedFeatures, currentAnalysis]);

    const addToDialogueHistory = (message, isUser = true, selectedFeature = null, selectedAnalysis = null) => {
        setDialogueHistory(prev => [...prev, { message, isUser, selectedFeature, selectedAnalysis }]);
        if (isUser) {
            setIterationCount(prev => prev + 1);
        }
    };

    useEffect(() => {
        if (currentProfile && currentAnalysis && analyzedFeatures.length < Object.keys(profileDescriptions).length) {
            setTimeout(() => {
                selectRandomFeatureAndAnalysis();
            }, 1000);
        }
    }, [currentProfile, currentAnalysis, analyzedFeatures, selectRandomFeatureAndAnalysis, profileDescriptions]);

    useEffect(() => {
        if (selectedFeatureAndAnalysis) {
            const { feature, analysis } = selectedFeatureAndAnalysis;
            const systemMessage = `The ${profileDescriptions[feature]} for this profile is ${currentProfile[feature]}. ${analysis}`;
            addToDialogueHistory(systemMessage, false, feature, analysis);
        }
    }, [selectedFeatureAndAnalysis, currentProfile, profileDescriptions]);

    const handleUserAgreement = (agreement) => {
        setUserAgreement(agreement);
        const userMessage = agreement ? 'I agree with the analysis.' : 'I disagree with the analysis.';
        addToDialogueHistory(userMessage, true);
        setAnalyzedFeatures(prev => [...prev, selectedFeatureAndAnalysis.feature]);
        if (agreement === null) {
            setTimeout(() => {
                selectRandomFeatureAndAnalysis();
            }, 1000);
        }
    };

    // Placeholder for submitting the user's prediction
    const submitPrediction = (prediction) => {
        console.log(`User predicted: ${prediction}`);
        // Proceed to the next iteration or end the experiment
        if (experimentNumber < 20) {
            setDialogueHistory([]);
            //setMakingPrediction(false);
            setSelectedPrediction(null);
            setCurrentProfile(null);
            setCurrentAnalysis(null);
            setIterationCount(0);
            setSelectedFeatureAndAnalysis(null);
            setUserAgreement(null);
            setAnalyzedFeatures([]);
            // Navigate to the next experiment page
            navigate(`/experiment/${experimentNumber + 1}`);
        } else {
            // End the experiment and navigate to the Thanks page
            navigate('/thanks');
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.taskHeader}>Prediction Task {isIncome ? 'Income' : 'Recidivism'} ({experimentNumber}/20)</h2>
            <div className={styles.profileDialogueContainer}>
                <div className={styles.profileContainer}>
                    {currentProfile && (
                        <>
                            <div className={styles.profileFeatures}>
                                <h3>Profile:</h3>
                                {Object.entries(currentProfile).map(([key, value]) => (
                                    profileDescriptions[key] && (
                                        <div key={key} className={styles.profileFeature}>
                                            <span className={styles.featureLabel}>{profileDescriptions[key]}:</span>
                                            <span className={styles.featureValue}>{value}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                            <div className={styles.modelPrediction}>
                                {isIncome ? (
                                    <>
                                        <h3>Model Prediction:</h3>
                                        <div>
                                            {currentProfile.model_prediction === '0'
                                                ? 'The model predicts that this individual does not earn over $50,000 per year.'
                                                : 'The model predicts that this individual earns over $50,000 per year.'}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>Model Prediction:
                                        </div>
                                        <div>
                                            {currentProfile.model_prediction === '0'
                                                ? 'The model predicts that this individual will not recidivate two years after previous charge.'
                                                : 'The model predicts that this individual will recidivate two years after previous charge.'}
                                        </div>
                                    </>
                                )}
                            </div>
                            {iterationCount >= 3 && (
                                <div className={styles.userPredictionSection}>
                                    <h3>Make your prediction:</h3>
                                    {isIncome ? (
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
                    <div className={styles.agreementButtons}>
                        <button
                            className={styles.agreementButton}
                            onClick={() => handleUserAgreement(true)}
                            disabled={!selectedFeatureAndAnalysis || userAgreement !== null}
                        >
                            Agree
                        </button>
                        <button
                            className={styles.agreementButton}
                            onClick={() => handleUserAgreement(false)}
                            disabled={!selectedFeatureAndAnalysis || userAgreement !== null}
                        >
                            Disagree
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExperimentPage;
