const ModbusRTU = require("modbus-serial");
const vector = {
  // Register 3001: Voltage, 3002: Current, 3003: Power
  getInputRegister: function (addr) {
    if (addr === 3001) return 230 + Math.random() * 5; // Simulating ~230V
    if (addr === 3002) return 10 + Math.random() * 2; // Simulating ~10A
    if (addr === 3003) return 2300 + Math.random() * 100; // Simulating ~2300W
    return 0;
  },
};

const serverTCP = new ModbusRTU.ServerTCP(vector, {
  host: "127.0.0.1",
  port: 8502,
  debug: true,
});

console.log("🌞 Fake Inverter is running on localhost:8502");
