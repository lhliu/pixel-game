import React from 'react';

const PixelButton = ({ onClick, children, className = '', disabled = false }) => {
    const style = {
        backgroundColor: 'var(--pixel-primary)',
        color: '#000',
        border: '4px solid #fff',
        borderRightColor: '#666',
        borderBottomColor: '#666',
        padding: '10px 20px',
        fontSize: '1.2rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        boxShadow: '4px 4px 0px var(--pixel-shadow)',
        transition: 'transform 0.1s',
        opacity: disabled ? 0.6 : 1,
        imageRendering: 'pixelated'
    };

    const handleMouseDown = (e) => {
        if (!disabled) {
            e.target.style.transform = 'translate(4px, 4px)';
            e.target.style.boxShadow = 'none';
            if (e.target.style.borderRightColor) e.target.style.borderRightColor = '#fff'; // mimic press
        }
    };

    const handleMouseUp = (e) => {
        if (!disabled) {
            e.target.style.transform = 'none';
            e.target.style.boxShadow = '4px 4px 0px var(--pixel-shadow)';
            e.target.style.borderRightColor = '#666';
        }
    };

    return (
        <button
            className={className}
            onClick={onClick}
            style={style}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default PixelButton;
