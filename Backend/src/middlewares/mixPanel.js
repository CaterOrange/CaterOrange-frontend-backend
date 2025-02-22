const Mixpanel = require('mixpanel');

// Initialize Mixpanel
const mixpanel = Mixpanel.init('cb19042cf789f9c44e059bd4be6f2c5d');

const trackEvent = (event, properties = {}) => {
    try {
        mixpanel.track(event, {
            ...properties,
            timestamp: new Date().toISOString(), // Ensures ISO format
            environment: process.env.NODE_ENV || 'development' // Fallback value
        });
    } catch (error) {
        console.error('Mixpanel tracking error:', error);
    }
};


module.exports = trackEvent;
