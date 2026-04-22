const mqtt = require('mqtt');
require('dotenv').config();

// Use the broker URL from .env or a public one for testing
const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com';
const topic = 'solar/inverter/INV-001/metrics';

console.log(`🚀 Starting Inverter Simulator...`);
console.log(`📡 Connecting to: ${brokerUrl}`);

const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
    console.log('✅ Connected to Broker');
    
    // Simulate sending data every 5 seconds
    setInterval(() => {
        const payload = {
            voltage: (230 + Math.random() * 10).toFixed(2),
            current: (5 + Math.random() * 2).toFixed(2),
            power: (1200 + Math.random() * 300).toFixed(2),
            timestamp: new Date().toISOString()
        };

        client.publish(topic, JSON.stringify(payload));
        console.log(`📤 Published Data to ${topic}:`, payload);
    }, 5000);
});

client.on('error', (err) => {
    console.error('❌ MQTT Error:', err.message);
    if (err.code === 'ECONNREFUSED') {
        console.error('👉 TIP: It looks like your local MQTT broker (Mosquitto) is not running.');
        console.error('👉 Try changing MQTT_BROKER_URL in .env to "mqtt://broker.hivemq.com" to test online.');
    }
});
