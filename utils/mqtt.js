const mqtt = require("mqtt");

function initMQTT(broker, topics, callback) {
  const mqttClient = mqtt.connect(broker);

  mqttClient.on("connect", () => {
    console.log("✅ Connected to MQTT broker");
    mqttClient.subscribe(topics, (err) => {
      if (!err) {
        console.log(`📡 Subscribed to topics: ${topics.join(", ")}`);
      } else {
        console.error("❌ MQTT subscribe error:", err);
      }
    });
  });

  mqttClient.on("message", (topic, message) => {
    console.log(`📩 MQTT message from [${topic}]: ${message.toString()}`);
    callback(topic, message);
  });

  return mqttClient;
}

module.exports = { initMQTT };
