import React from 'react';

const PixelCard = ({ children, title }) => {
    const outerStyle = {
        backgroundColor: '#fff',
        border: '4px solid var(--pixel-shadow)',
        padding: '4px', // Space for inner border
        boxShadow: '8px 8px 0px rgba(0,0,0,0.5)',
        maxWidth: '500px',
        width: '90%',
        position: 'relative'
    };

    const innerStyle = {
        border: '2px solid var(--pixel-shadow)',
        padding: '20px',
        backgroundColor: '#eee',
        color: '#000'
    };

    const titleHeaderStyle = {
        backgroundColor: 'var(--pixel-secondary)',
        color: '#fff',
        padding: '5px 10px',
        display: 'inline-block',
        position: 'absolute',
        top: '-20px',
        left: '50%',
        transform: 'translateX(-50%)',
        border: '4px solid var(--pixel-shadow)',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    };

    return (
        <div style={outerStyle}>
            {title && <div style={titleHeaderStyle}>{title}</div>}
            <div style={innerStyle}>
                {children}
            </div>
        </div>
    );
};

export default PixelCard;
