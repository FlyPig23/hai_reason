import React, {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import income_profiles from '../data/income_with_meta.json';
import recidivism_profiles from '../data/recidivism_with_meta.json';
import income_analysis from '../data/income_analysis.json';
import recidivism_analysis from '../data/recidivism_analysis.json';
import styles from '../assets/ExperimentPage.module.css';
import client_image from '../images/client.png';
import robot_image from '../images/robot.png';

function ExperimentPage({ sessionId, experimentNumber, assignedTask }) {
    const navigate = useNavigate();
    const dialogueHistoryRef = useRef(null);

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
    const [started, setStarted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    // Load a profile at the start or when the task/number changes
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * profiles.length);
        const selectedProfile = profiles[randomIndex];
        // Get the corresponding "index" field from the profile
        if (isIncome) {
            const profileIndex = selectedProfile.index;
            const selectedAnalysis = analysisData.find(data => data.Index === profileIndex);
            setCurrentProfile(selectedProfile);
            setCurrentAnalysis(selectedAnalysis);
        } else {
            const profileIndex = selectedProfile.id;
            const selectedAnalysis = analysisData.find(data => data.id === profileIndex);
            setCurrentProfile(selectedProfile);
            setCurrentAnalysis(selectedAnalysis);
        }
    }, [assignedTask, experimentNumber, profiles, analysisData, isIncome]);

    // Function to select a random feature and analysis not yet shown
    const selectRandomFeatureAndAnalysis = useCallback(() => {
        const unanalyzedFeatures = Object.keys(profileDescriptions).filter(feature => !analyzedFeatures.includes(feature));
        if (unanalyzedFeatures.length === 0) {
            setIsModalOpen(true);
            return;
        }

        const randomFeature = unanalyzedFeatures[Math.floor(Math.random() * unanalyzedFeatures.length)];
        const analysis = currentAnalysis[randomFeature];
        setSelectedFeatureAndAnalysis({ feature: randomFeature, analysis });
        setUserAgreement(null);
    }, [profileDescriptions, analyzedFeatures, currentAnalysis]);

    // Function to close the modal
    const closeModal = () => {
        setIsModalOpen(false);
    };

    const addToDialogueHistory = (message, isUser = true, selectedFeature = null, selectedAnalysis = null) => {
        setDialogueHistory(prev => [...prev, { message, isUser, selectedFeature, selectedAnalysis }]);
        if (isUser) {
            setIterationCount(prev => prev + 1);
        }
    };

    // useEffect(() => {
    //     if (currentProfile && currentAnalysis && analyzedFeatures.length < Object.keys(profileDescriptions).length && started) {
    //         setTimeout(() => {
    //             selectRandomFeatureAndAnalysis();
    //         }, 1000);
    //     }
    // }, [currentProfile, currentAnalysis, analyzedFeatures, selectRandomFeatureAndAnalysis, profileDescriptions, started]);

    useEffect(() => {
        if (selectedFeatureAndAnalysis) {
            const { feature, analysis } = selectedFeatureAndAnalysis;
            const systemMessage = `The ${profileDescriptions[feature]} for this profile is ${currentProfile[feature]}. ${analysis}`;
            addToDialogueHistory(systemMessage, false, feature, analysis);
        }
    }, [selectedFeatureAndAnalysis, currentProfile, profileDescriptions]);

    useEffect(() => {
        if (dialogueHistoryRef.current) {
            dialogueHistoryRef.current.scrollTop = dialogueHistoryRef.current.scrollHeight;
        }
    }, [dialogueHistory]);

    const handleStart = () => {
        setStarted(true);
        const userMessage = 'Let\'s start the analysis.';
        addToDialogueHistory(userMessage, true);
        // Wait for a second before starting the analysis
        setTimeout(() => {
            selectRandomFeatureAndAnalysis();
        }, 500);
    };

    const handleContinue = () => {
        setTimeout(() => {
            selectRandomFeatureAndAnalysis();
        }, 500);
    };

    const handleUserAgreement = (agreement) => {
        setUserAgreement(agreement);
        const userMessage = agreement ? 'I agree with the analysis.' : 'I disagree with the analysis.';
        addToDialogueHistory(userMessage, true);
        setAnalyzedFeatures(prev => [...prev, selectedFeatureAndAnalysis.feature]);
    };

    // Placeholder for submitting the user's prediction
    const submitPrediction = async (prediction) => {
        console.log(`User predicted: ${prediction}`);
        setSelectedPrediction(prediction);

        const payload = {
            sessionId,
            experimentNumber,
            selectedProfileIndex: currentProfile ? (isIncome ? currentProfile.index : currentProfile.id) : null,
            chatHistory: dialogueHistory,
            userPrediction: selectedPrediction,
            chatIterations: iterationCount,
        };

        try {
            // Attempt to upload the experiment data
            const response = await fetch('http://127.0.0.1:5000/experiment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to upload experiment data');
            }

            const responseData = await response.json();
            console.log('Experiment data successfully uploaded:', responseData);

            // Reset component state as necessary before navigation
            setDialogueHistory([]);
            //setMakingPrediction(false);
            setSelectedPrediction(null);
            setCurrentProfile(null);
            setCurrentAnalysis(null);
            setIterationCount(0);
            setSelectedFeatureAndAnalysis(null);
            setUserAgreement(null);
            setAnalyzedFeatures([]);
            setStarted(false);

            // Navigate based on whether the current experiment number is less than the total experiments
            if (experimentNumber < 20) {
                navigate(`/experiment/${experimentNumber + 1}`);
            } else {
                navigate('/thanks');
            }
        } catch (error) {
            console.error('Error during experiment data upload:', error);
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
                                            {currentProfile.model_prediction === 0
                                                ? (
                                                    <span>
                                                        The model predicts that this individual{' '}
                                                        <span style={{ color: 'green', fontWeight: 'bold' }}>does not earn</span>{' '}
                                                        over $50,000 per year.
                                                    </span>
                                                )
                                                : (
                                                    <span>
                                                        The model predicts that this individual{' '}
                                                        <span style={{ color: 'red', fontWeight: 'bold' }}>earns</span>{' '}
                                                        over $50,000 per year.
                                                    </span>
                                                )
                                            }
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3>Model Prediction:</h3>
                                        <div>
                                            {currentProfile.model_prediction === 0
                                                ? (
                                                    <span>
                                                        The model predicts that this individual{' '}
                                                        <span style={{ color: 'green', fontWeight: 'bold' }}>will not</span>{' '}
                                                        recidivate two years after previous charge.
                                                    </span>
                                                    )
                                                : (
                                                    <span>
                                                        The model predicts that this individual{' '}
                                                        <span style={{ color: 'red', fontWeight: 'bold' }}>will</span>{' '}
                                                        recidivate two years after previous charge.
                                                    </span>
                                                )
                                            }
                                        </div>
                                    </>
                                )}
                            </div>
                            {iterationCount >= 4 && (
                                <div className={styles.userPredictionSection}>
                                    <h3>Make your prediction:</h3>
                                    {isIncome ? (
                                        <>
                                            <button
                                                className={`${styles.predictionButton} ${styles.aboveButton} ${selectedPrediction === 'above $50,000' ? styles.selectedButton : ''}`}
                                                onClick={() => setSelectedPrediction('above $50,000')}
                                            >
                                                Above $50,000
                                            </button>
                                            <button
                                                className={`${styles.predictionButton} ${styles.belowButton} ${selectedPrediction === 'below $50,000' ? styles.selectedButton : ''}`}
                                                onClick={() => setSelectedPrediction('below $50,000')}
                                            >
                                                Below $50,000
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className={`${styles.predictionButton} ${styles.willReoffendButton} ${selectedPrediction === 'will reoffend' ? styles.selectedButton : ''}`}
                                                onClick={() => setSelectedPrediction('will reoffend')}
                                            >
                                                Will Reoffend
                                            </button>
                                            <button
                                                className={`${styles.predictionButton} ${styles.willNotReoffendButton} ${selectedPrediction === 'will not reoffend' ? styles.selectedButton : ''}`}
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
                    <div className={styles.dialogueHistory} ref={dialogueHistoryRef}>
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
                        {!started ? (
                            <button className={styles.agreementButton} onClick={handleStart}>
                                Start
                            </button>
                        ) : (
                            <>
                                <button
                                    className={styles.agreementButton}
                                    onClick={() => handleUserAgreement(true)}
                                    disabled={userAgreement !== null}
                                >
                                    Agree
                                </button>
                                <button
                                    className={styles.agreementButton}
                                    onClick={() => handleUserAgreement(false)}
                                    disabled={userAgreement !== null}
                                >
                                    Disagree
                                </button>
                                <button
                                    className={styles.agreementButton}
                                    onClick={handleContinue}
                                    disabled={userAgreement === null}
                                >
                                    Continue
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                className={styles.modal}
                overlayClassName={styles.modalOverlay}
            >
                <div className={styles.modalContent}>
                    <h2>All Features Analyzed</h2>
                    <p>All features have been analyzed. Please make your prediction.</p>
                    <button onClick={closeModal} className={styles.modalCloseButton}>
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default ExperimentPage;
