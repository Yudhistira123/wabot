// services/mqttServices.js
//const mqtt = require("mqtt");
import mqtt from "mqtt";
import { sendMessages } from "../utils/mqttService.js";

const mqttBroker = "mqtt://103.27.206.14:1883";
const mqttTopics = ["R1.JC.05", "R1.JC.06"];

let mqttClient; // keep global ref so we can publish outside init

export function initMQTT(client) {
  mqttClient = mqtt.connect(mqttBroker);

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

/**
 * Helper function so you can publish from anywhere
 */
export function publishMessage(topic, msg) {
  if (mqttClient && mqttClient.connected) {
    mqttClient.publish(topic, msg);
    console.log(`📤 MQTT published to [${topic}]: ${msg}`);
  } else {
    console.error("❌ MQTT not connected, cannot publish");
  }
}
