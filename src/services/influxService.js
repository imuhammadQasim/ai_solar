const { writeApi, queryApi, Point } = require("../config/influx");

const saveInverterMetrics = (deviceId, metrics) => {
  try {
    const point = new Point("inverter_metrics")
      .tag("deviceId", deviceId)
      .floatField("voltage", metrics.voltage || 0)
      .floatField("current", metrics.current || 0)
      .floatField("power", metrics.power || 0);

    writeApi.writePoint(point);
    // Flush is async, we don't want to await it here to avoid blocking
    writeApi.flush().catch(err => {
      console.error("❌ InfluxDB Flush Error:", err.message);
    });
  } catch (err) {
    console.error("❌ InfluxDB Write Error:", err.message);
  }
};

const getLatestInverterData = async (deviceId = 'INV001') => {
  const query = `
    from(bucket: "${process.env.INFLUX_BUCKET}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "inverter_metrics")
      |> filter(fn: (r) => r.deviceId == "${deviceId}")
      |> last()
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  `;

  return new Promise((resolve, reject) => {
    const results = [];
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        results.push(tableMeta.toObject(row));
      },
      error(err) {
        reject(err);
      },
      complete() {
        resolve(results.length > 0 ? results[0] : null);
      },
    });
  });
};

module.exports = { saveInverterMetrics, getLatestInverterData };


