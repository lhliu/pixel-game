import React from 'react';

const PixelInput = ({ value, onChange, placeholder }) => {
    const style = {
        backgroundColor: '#fff',
        color: '#000',
        border: '4px solid var(--pixel-shadow)',
        padding: '10px',
        fontSize: '1.2rem',
        width: '100%',
        boxSizing: 'border-box',
        outline: 'none',
        boxShadow: 'inset 4px 4px 0px #ccc'
    };

    return (
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={style}
        />
    );
};

export default PixelInput;
