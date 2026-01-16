import React, { useState } from 'react';
import PixelCard from '../components/PixelCard';
import PixelButton from '../components/PixelButton';
import PixelInput from '../components/PixelInput';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [userId, setUserId] = useState('');
    // Initialize with a random seed so it has a face immediately
    const [avatarSeed, setAvatarSeed] = useState(Math.random().toString(36).substring(7));
    const navigate = useNavigate();

    const handleStart = () => {
        if (!userId.trim()) return;
        localStorage.setItem('pixel_game_user_id', userId);
        navigate('/game');
    };

    const handleAvatarClick = () => {
        // Generate a random seed
        const randomSeed = Math.random().toString(36).substring(7);
        setAvatarSeed(randomSeed);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            width: '100%'
        }}>
            <h1 style={{
                textShadow: '4px 4px 0px #000',
                fontSize: '3rem',
                color: 'var(--pixel-primary)',
                marginBottom: '40px',
                textAlign: 'center'
            }}>
                PIXEL QUIZ
            </h1>

            <PixelCard title="PLAYER LOGIN">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                        style={{ textAlign: 'center', marginBottom: '10px', width: 'fit-content', margin: '0 auto', cursor: 'pointer' }}
                        onClick={handleAvatarClick}
                        title="Click to randomize avatar"
                    >
                        <img
                            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${avatarSeed}`}
                            alt="avatar"
                            style={{
                                width: '100px',
                                height: '100px',
                                border: '4px solid #000',
                                backgroundColor: '#fff',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                        />
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                            CLICK TO RANDOMIZE
                        </div>
                    </div>

                    <PixelInput
                        placeholder="ENTER YOUR ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />

                    <PixelButton onClick={handleStart} disabled={!userId}>
                        INSERT COIN (START)
                    </PixelButton>
                </div>
            </PixelCard>
        </div>
    );
};

export default Home;
