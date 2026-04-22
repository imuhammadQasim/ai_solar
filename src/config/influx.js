const { InfluxDB, Point } = require("@influxdata/influxdb-client");
require("dotenv").config();

const url = process.env.INFLUX_URL;
const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG;
const bucket = process.env.INFLUX_BUCKET;

const influxClient = new InfluxDB({ url, token });
const writeApi = influxClient.getWriteApi(org, bucket);
const queryApi = influxClient.getQueryApi(org);

process.on("exit", () => {
  writeApi.close();
});

module.exports = { writeApi, queryApi, Point };
