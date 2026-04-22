const { writeApi, queryApi, Point } = require("../config/influx");
require("dotenv").config();

/**
 * BETTER EXAMPLE: Solar Energy Monitoring
 * 
 * In InfluxDB:
 * - Measurements = 'solar_power' (The "Table")
 * - Tags = 'inverter_id', 'location' (Metadata to FILTER by - Indexed)
 * - Fields = 'watts', 'voltage', 'current' (Values to CALCULATE - Not Indexed)
 */

const saveSolarMeasurement = async (inverterId, watts, voltage) => {
    console.log(`Writing data for ${inverterId}...`);
    
    // 1. CREATE A POINT
    const point = new Point("solar_power")
        .tag("inverter_id", inverterId)
        .tag("location", "Lahore_Main")
        .floatField("watts", watts)
        .floatField("voltage", voltage);

    // 2. WRITE THE POINT
    writeApi.writePoint(point);
    
    // 3. FLUSH (Necessary to ensure data is sent to server immediately in this script)
    await writeApi.flush();
    console.log("✅ Point saved successfully!");
};

const queryRecentData = async () => {
    console.log("Reading data back from InfluxDB...");

    // Flux Query: Get data from the last 1 hour, filtered by measurement
    const fluxQuery = `
        from(bucket: "${process.env.INFLUX_BUCKET}")
            |> range(start: -1h)
            |> filter(fn: (r) => r._measurement == "solar_power")
    `;

    const results = [];

    return new Promise((resolve, reject) => {
        queryApi.queryRows(fluxQuery, {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                results.push({
                    time: o._time,
                    field: o._field, // '_field' tells you if it's 'watts' or 'voltage'
                    value: o._value,
                    inverter: o.inverter_id
                });
            },
            error(err) {
                reject(err);
            },
            complete() {
                resolve(results);
            },
        });
    });
};

// RUN THE DEMO
async function runDemo() {
    try {
        await saveSolarMeasurement("INV-99", 1500.5, 240.2);
        const data = await queryRecentData();
        console.table(data);
    } catch (e) {
        console.error("❌ Demo Failed:", e.message);
    }
}

// Run if called directly
if (require.main === module) {
    runDemo();
}

module.exports = { saveSolarMeasurement, queryRecentData };
