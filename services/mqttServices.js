//const mqtt = require("mqtt");
import mqtt from "mqtt";
import { sendMessages } from "../utils/mqttService";

const mqttBroker = "mqtt://103.27.206.14:1883";
const mqttTopics = ["R1.JC.05", "R1.JC.06"];

export function initMQTT(client) {
  const mqttClient = mqtt.connect(mqttBroker);

  mqttClient.on("connect", () => {
    console.log("✅ Connected to MQTT broker");
    mqttClient.subscribe(mqttTopics, (err) => {
      if (!err) {
        console.log(`📡 Subscribed to topics: ${mqttTopics.join(", ")}`);
      } else {
        console.error("❌ MQTT subscribe error:", err);
      }
    });
  });

  mqttClient.on("message", (topic, message) => {
    console.log(`📩 MQTT message from [${topic}]: ${message.toString()}`);
    sendMessages(client, topic, message);
  });
}

//module.exports = { initMQTT };
