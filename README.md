# Smart Solar Optimizer Boilerplate

A modular Node.js backend for optimizing solar energy usage by integrating real-time inverter data (via MQTT), time-series storage (InfluxDB), and weather forecasts (OpenWeatherMap).

## 🚀 Features
- **MQTT Data Ingestion**: Receives real-time metrics (Voltage, Current, Power) from inverters.
- **Time-Series Storage**: High-frequency data routed to **InfluxDB** for granular analysis.
- **Relational Metadata**: Managed by **PostgreSQL** via **Prisma ORM**.
- **Weather Integration**: Integrates with OpenWeatherMap API with built-in caching (`node-cache`).
- **Smart Logic**: Optimization service that suggests energy actions based on cloud coverage and weather conditions.
- **Modular Architecture**: Separated into Controllers, Services, Handlers, and Config.

---

## 📂 Folder Structure
```text
src/
├── config/             # DB & External Client configs (Prisma, Influx, MQTT)
├── controllers/        # Route handlers (Request/Response logic)
├── handlers/           # Special handlers (MQTT listener)
├── services/           # Business logic (Weather, Optimization, Influx)
├── routes/             # API Route definitions
├── app.js              # Express app setup
└── server.js           # Entry point and initialization
prisma/
└── schema.prisma       # Database schema (PostgreSQL)
```

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL
- InfluxDB 2.x
- MQTT Broker (e.g., Mosquitto)
- OpenWeatherMap API Key

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/solar_db?schema=public"

# MQTT Config
MQTT_BROKER_URL="mqtt://localhost:1883"
MQTT_TOPIC_INVERTER_DATA="solar/inverter/+/metrics"

# InfluxDB Config
INFLUX_URL="http://localhost:8086"
INFLUX_TOKEN="your-influx-token"
INFLUX_ORG="your-org"
INFLUX_BUCKET="solar_metrics"

# Weather API
OPENWEATHER_API_KEY="your-api-key"
CITY_NAME="London"
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run the Project
```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

## 🌓 MQTT Payload Example
The system expects JSON messages on `solar/inverter/{deviceId}/metrics`:
```json
{
  "voltage": 230.5,
  "current": 4.2,
  "power": 968.1
}
```

## 🔋 API Endpoints
- `GET /api/status`: Health check.
- `GET /api/optimize`: Returns optimization suggestions based on current weather.

---

## 🧠 Optimization Logic
Currently, the system uses a heuristic approach:
- **Cloud Coverage > 70%**: Suggests grid charging/load reduction.
- **Cloud Coverage < 20%**: Suggests running heavy appliances (peak solar).
- **Rain/Storms**: Issues weather alerts for potential power drops.
