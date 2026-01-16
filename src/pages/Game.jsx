import React, { useState, useEffect } from 'react';
import PixelCard from '../components/PixelCard';
import PixelButton from '../components/PixelButton';
import { getQuestions, submitScore } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Game = () => {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Load game settings from env
    const PASS_THRESHOLD = parseInt(import.meta.env.VITE_PASS_THRESHOLD) || 3;
    const QUESTION_COUNT = parseInt(import.meta.env.VITE_QUESTION_COUNT) || 5;

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                const data = await getQuestions(QUESTION_COUNT);
                setQuestions(data);
                setLoading(false);
            } catch (err) {
                setError('FAILED TO LOAD LEVEL DATA');
                setLoading(false);
            }
        };
        fetchGameData();
    }, [QUESTION_COUNT]);

    const handleAnswer = (optionKey) => {
        // We don't know the answer yet because the API didn't return it (security).
        // Wait, the requirement says "成績計算：將作答結果傳送到 Google Apps Script 計算成績".
        // BUT usually frontend needs immediate feedback. 
        // Re-reading requirements:
        // "題目來源：...不包含解答欄位" -> Frontend doesn't know the answer.
        // "成績計算：將作答結果傳送到 Google Apps Script 計算成績" -> This implies we send ALL answers at the end? 
        // OR we send each answer and get result?
        // Let's assume we collect answers and submit at the end for grading?
        // "成績計算...並記錄到 Google Sheets"

        // Actually, usually a quiz game gives feedback per question.
        // If the sheet doesn't return answers, we can't show "Correct/Wrong" immediately unless we send a request per question.
        // Let's assume for this MVP we collect all answers and submit them at the end to get the final score.

        const updatedQuestions = [...questions];
        updatedQuestions[currentIndex].userAnswer = optionKey;
        setQuestions(updatedQuestions);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            finishGame(updatedQuestions);
        }
    };

    const finishGame = async (finalQuestions) => {
        setLoading(true);
        // Calculate score locally? We can't if we don't have answers.
        // The requirement says "將作答結果傳送到 Google Apps Script 計算成績".
        // So we need to modify the backend to accept an array of answers and return the score.
        // AND the requirement says "成績計算...並記錄". 

        // Wait, if I can't verify locally, the UX is a bit weird (no immediate feedback).
        // Let's adjust the plan: Submit all answers to `submitScore` endpoint.
        // I need to update `api.js` and the backend `Code.gs` logic slightly or just send what I have.

        // Current `Code.gs` expects `{ userId, score, passed ... }`.
        // It seems I assumed frontend calculates score. 
        // IF frontend handles score, I need answers.
        // IF backend handles score, I send answers.

        // User Requirement: "題目來源...（不包含解答欄位）" -> STRICT.
        // User Requirement: "將作答結果傳送到 Google Apps Script 計算成績" -> Backend calculates.

        // So I need to send: { userId, answers: [{id, answer}, ...] }
        // And Backend returns: { score, passed, details... }

        const userId = localStorage.getItem('pixel_game_user_id');
        const answersPayload = finalQuestions.map(q => ({
            id: q.id,
            answer: q.userAnswer
        }));

        try {
            // We need a specific endpoint for grading if `submitScore` was just recording.
            // Let's use `submitScore` but pass answers instead of score.
            // I will update Code.gs locally to handle this logic for the user later or now?
            // For now, let's assume we send answers.

            const result = await submitScore({
                userId,
                answers: answersPayload,
                // We don't send score/passed, backend calculates it.
            });

            navigate('/result', { state: { result } });
        } catch (err) {
            setError('FAILED TO UPLOAD SCORE');
            setLoading(false);
        }
    };

    if (loading) return <div style={{ fontSize: '2rem' }}>LOADING...</div>;
    if (error) return <div style={{ color: 'red', fontSize: '2rem' }}>{error}</div>;

    const currentQ = questions[currentIndex];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ marginBottom: '20px', fontSize: '1.5rem' }}>
                LEVEL {currentIndex + 1} / {questions.length}
            </div>

            <PixelCard title={`QUESTION #${currentQ.id}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>

                    {/* Boss Avatar */}
                    <img
                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentQ.id + 'boss'}`}
                        alt="Boss"
                        style={{
                            width: '120px',
                            height: '120px',
                            border: '4px solid #000',
                            backgroundColor: '#ffcc00'
                        }}
                    />

                    <div style={{ fontSize: '1.2rem', textAlign: 'center', minHeight: '60px' }}>
                        {currentQ.question}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%' }}>
                        {Object.entries(currentQ.options).map(([key, val]) => (
                            val && (
                                <PixelButton key={key} onClick={() => handleAnswer(key)}>
                                    {key}. {val}
                                </PixelButton>
                            )
                        ))}
                    </div>
                </div>
            </PixelCard>
        </div>
    );
};

export default Game;
