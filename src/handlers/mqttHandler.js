const mqtt = require('mqtt');
const { saveInverterMetrics } = require('../services/influxService');
require('dotenv').config();

const brokerUrl = process.env.MQTT_BROKER_URL;
const topic = process.env.MQTT_TOPIC_INVERTER_DATA;

const initMQTT = () => {
    const client = mqtt.connect(brokerUrl);

    client.on('connect', () => {
        console.log('Connected to MQTT Broker');
        client.subscribe(topic, (err) => {
            if (!err) {
                console.log(`Subscribed to ${topic}`);
            }
        });
    });

    client.on('message', (topic, message) => {
        // Topic format: solar/inverter/DEVICE_ID/metrics
        const topicParts = topic.split('/');
        const deviceId = topicParts[2] || 'unknown';

        try {
            const data = JSON.parse(message.toString());
            console.log(`Received data from ${deviceId}:`, data);

            // Use influxService to save data
            saveInverterMetrics(deviceId, data);
            console.log('Metrics saved to InfluxDB');

        } catch (error) {
            console.error('Error processing MQTT message:', error.message);
        }
    });

    client.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
            console.error('❌ MQTT Connection Refused! Is your local broker (Mosquitto) running?');
            console.error('👉 TIP: To test without a local broker, change MQTT_BROKER_URL in .env to "mqtt://broker.hivemq.com"');
        } else {
            console.error('MQTT error:', err);
        }
    });

    return client;
};

module.exports = { initMQTT };
