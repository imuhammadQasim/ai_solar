const app = require("./app");
const { initMQTT } = require("./handlers/mqttHandler");
require("dotenv").config();
const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU();

const PORT = process.env.PORT || 3000;
// Initialize MQTT client
const mqttClient = initMQTT();

async function connectAndRead() {
  await client.connectTCP("127.0.0.1", { port: 8502 });
  client.setID(1);

  setInterval(async () => {
    try {
      // Read 3 registers starting from 3001
      const data = await client.readInputRegisters(3001, 3);
      const [voltage, current, power] = data.data;

      // 1. Send this to your MQTT Broker
      const payload = {
        voltage: voltage,
        current: current,
        power: power,
        timestamp: new Date().toISOString()
      };
      
      const topic = "solar/inverter/INV001/metrics";
      mqttClient.publish(topic, JSON.stringify(payload));
      console.log(`[MQTT] Published to ${topic}`);

      // 2. Save this to InfluxDB (Optionally direct, but we use MQTT path)
      // saveInverterMetrics("INV001", payload); 
    } catch (e) {
      console.log("Error reading from inverter:", e.message);
    }
  }, 5000); // Read every 5 seconds
}

connectAndRead();

app.listen(PORT, () => {
  console.log(`Solar Optimizer Server running on port ${PORT}`);
  console.log("MQTT Client initialized and listening for data...");
});
