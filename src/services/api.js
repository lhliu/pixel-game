// import axios from 'axios'; // Removed axios import

// Get URL from environment variable
const API_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;

// const apiClient = axios.create({ // Removed apiClient
//     baseURL: API_URL,
//     headers: {
//         'Content-Type': 'text/plain;charset=utf-8',
//     },
// });

export const getQuestions = async (count = 5) => {
    try {
        if (!API_URL || API_URL.includes('YOUR_SCRIPT_ID')) {
            throw new Error("Invalid API URL");
        }

        // Use fetch instead of axios for better GAS redirect handling
        const url = `${API_URL}?action=getQuestions&count=${count}`;
        const response = await fetch(url, {
            method: "GET",
            // mode: 'cors', // Default is cors
            // credentials: 'omit', // Default
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            return data.data;
        }
        throw new Error(data.message || 'Failed to fetch questions');
    } catch (error) {
        console.warn('API Error:', error);

        // Fallback to Mock Data
        console.info("⚠️ Falling back to MOCK DATA due to API error or configuration.");
        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            question: `(MOCK) This is question #${i + 1}?`,
            options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' }
        }));
    }
};

export const submitScore = async (data) => {
    // data: { userId, score, passed, totalQuestions }
    // Post to GAS requires slightly trickier handling sometimes to avoid CORS preflight failing if not text/plain
    // We used 'text/plain' content-type in axios create, passing JSON string as body.
    try {
        // GAS doPost requires a specific setup.
        // Usually sending text/plain payload avoids preflight.
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: 'submitScore',
                ...data
            }),
            headers: {
                "Content-Type": "text/plain;charset=utf-8" // Important for GAS to avoid OPTIONS request
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            return result;
        }
        throw new Error(result.message || 'Failed to submit score');
    } catch (error) {
        console.error('Submit Error:', error);
        if (!API_URL || API_URL.includes('YOUR_SCRIPT_ID')) return { success: true };
        throw error;
    }
};
