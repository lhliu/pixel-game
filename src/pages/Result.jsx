import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PixelCard from '../components/PixelCard';
import PixelButton from '../components/PixelButton';
import confetti from 'canvas-confetti';

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result?.data;

    React.useEffect(() => {
        if (result && result.passed) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [result]);

    if (!result) {
        return (
            <div style={{ textAlign: 'center' }}>
                <p>NO DATA</p>
                <PixelButton onClick={() => navigate('/')}>RETURN</PixelButton>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <PixelCard title={result.passed ? "MISSION COMPLETE" : "GAME OVER"}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div style={{ fontSize: '3rem', color: result.passed ? 'green' : 'red' }}>
                        {result.passed ? "YOU WIN!" : "TRY AGAIN"}
                    </div>

                    <div style={{ fontSize: '1.5rem' }}>
                        SCORE: {result.score}
                    </div>

                    <div style={{ fontSize: '1rem', color: '#666' }}>
                        MAX SCORE: {result.maxScore}
                    </div>

                    <PixelButton onClick={() => navigate('/game')}>
                        RETRY
                    </PixelButton>

                    <PixelButton onClick={() => navigate('/')} style={{ marginTop: '10px', fontSize: '1rem' }}>
                        EXIT
                    </PixelButton>

                </div>
            </PixelCard>
        </div>
    );
};

export default Result;
