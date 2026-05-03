#include <ArduinoJson.h>
#include "DHT.h"
#include <WiFi.h>
extern "C" {
#include "freertos/FreeRTOS.h"
#include "freertos/timers.h"
}
#include <AsyncMqttClient.h>

// --- TÀI KHOẢN MQTT ---
#define MQTT_USER "truong"
#define MQTT_PASS "12345678"

// --- CẤU HÌNH CẢM BIẾN ---
#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);
#define LDRPIN 35

// --- CẤU HÌNH LED ---
#define LED_TEMP 18
#define LED_HUMI 19
#define LED_LIGHT 21
const int ledArr[] = { 18, 19, 21 };
const int ledCount = sizeof(ledArr) / sizeof(ledArr[0]);

// --- BIẾN TRẠNG THÁI LED ---
bool isBlinkAll = false;
bool isBlinkEach = false;
bool ledStatus = false;
int ledIndex = 0;
unsigned long lastBlinkTime = 0;
const int blinkInterval = 700;
const int blinkIntervalForEach = 600;

AsyncMqttClient mqttClient;
TimerHandle_t mqttReconnectTimer;
TimerHandle_t wifiReconnectTimer;

// --- CẤU HÌNH WIFI & MQTT ---
// #define WIFI_SSID "GVanh"
// #define WIFI_PASSWORD "vanh2004"
// #define MQTT_HOST IPAddress(10, 138, 157, 253)

#define WIFI_SSID "TP-Link_BB7C"
#define WIFI_PASSWORD "64291215"
#define MQTT_HOST IPAddress(192, 168, 1, 105)

#define MQTT_PORT 1884

#define ROOM_ID "bedroom01"
#define MQTT_PUB_DATA "esp32/" ROOM_ID "/sensor_data"
#define MQTT_TOPIC_DEVICES "esp32/" ROOM_ID "/device_control"
#define MQTT_PUB_STATUS "esp32/" ROOM_ID "/status"

// --- HÀM KẾT NỐI ---
void connectToWifi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void connectToMqtt() {
  Serial.println("Connecting to MQTT...");
  mqttClient.connect();
}

void WiFiEvent(WiFiEvent_t event) {
  switch (event) {
    case ARDUINO_EVENT_WIFI_STA_GOT_IP:
      Serial.println("WiFi connected. IP: " + WiFi.localIP().toString());
      connectToMqtt();
      break;
    case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
      Serial.println("WiFi lost connection");
      xTimerStop(mqttReconnectTimer, 0);
      xTimerStart(wifiReconnectTimer, 0);
      break;
  }
}

void onMqttConnect(bool sessionPresent) {
  Serial.println("Connected to MQTT.");
  mqttClient.subscribe(MQTT_TOPIC_DEVICES, 0);
}

void onMqttDisconnect(AsyncMqttClientDisconnectReason reason) {
  Serial.println("Disconnected from MQTT.");
  if (WiFi.isConnected()) xTimerStart(mqttReconnectTimer, 0);
}

// --- CÁC HÀM ĐIỀU KHIỂN LED ---
void allOn() {
  for (int i = 0; i < ledCount; i++) digitalWrite(ledArr[i], HIGH);
}
void allOff() {
  for (int i = 0; i < ledCount; i++) digitalWrite(ledArr[i], LOW);
}

void blinkAll() {
  if (millis() - lastBlinkTime >= blinkInterval) {
    lastBlinkTime = millis();
    ledStatus = !ledStatus;
    if (ledStatus) allOn();
    else allOff();
  }
}

void blinkEach() {
  if (millis() - lastBlinkTime >= blinkIntervalForEach) {
    lastBlinkTime = millis();
    allOff();
    digitalWrite(ledArr[ledIndex], HIGH);
    ledIndex = (ledIndex + 1) % ledCount;
  }
}

// --- XỬ LÝ LỆNH ĐẾN (PHẢN HỒI NGAY) ---
void onMqttMessage(char* topic, char* payload, AsyncMqttClientMessageProperties properties, size_t len, size_t index, size_t total) {
  char message[len + 1];
  memcpy(message, payload, len);
  message[len] = '\0';

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);

  bool commandSuccess = false;
  // Lấy dữ liệu để phản hồi (Echo)
  const char* device = doc["device"] | "unknown";
  const char* state = doc["state"] | "unknown";

  if (!error && doc["state"]) {
    const char* st = doc["state"];

    if (strcmp(st, "ALL_ON") == 0) {
      isBlinkEach = false;
      isBlinkAll = false;
      allOn();
      commandSuccess = true;
    } else if (strcmp(st, "ALL_OFF") == 0) {
      isBlinkEach = false;
      isBlinkAll = false;
      allOff();
      commandSuccess = true;
    } else if (strcmp(st, "BLINK_ALL") == 0) {
      allOff();
      isBlinkEach = false;
      isBlinkAll = true;
      ledStatus = false;
      commandSuccess = true;
    } else if (strcmp(st, "BLINK_EACH") == 0) {
      ledIndex = 0;
      allOff();
      isBlinkEach = true;
      isBlinkAll = false;
      commandSuccess = true;
    } else if (doc["device"]) {
      const char* dev = doc["device"];
      if (strcmp(dev, "light") == 0) {
        digitalWrite(LED_LIGHT, strcmp(st, "ON") == 0 ? HIGH : LOW);
        commandSuccess = true;
      } else if (strcmp(dev, "fan") == 0) {
        digitalWrite(LED_HUMI, strcmp(st, "ON") == 0 ? HIGH : LOW);
        commandSuccess = true;
      } else if (strcmp(dev, "air_purifier") == 0) {
        digitalWrite(LED_TEMP, strcmp(st, "ON") == 0 ? HIGH : LOW);
        commandSuccess = true;
      }
    }
  }

  // GỬI PHẢN HỒI NGAY LẬP TỨC
  StaticJsonDocument<256> responseDoc;
  responseDoc["device"] = device;
  responseDoc["state"] = state;
  responseDoc["status"] = commandSuccess ? "success" : "false";

  char responseBuffer[256];
  serializeJson(responseDoc, responseBuffer);

  if (mqttClient.connected()) {
    mqttClient.publish(MQTT_PUB_STATUS, 0, false, responseBuffer);
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(LED_TEMP, OUTPUT);
  pinMode(LED_HUMI, OUTPUT);
  pinMode(LED_LIGHT, OUTPUT);

  mqttReconnectTimer = xTimerCreate("mqttTimer", pdMS_TO_TICKS(2000), pdFALSE, (void*)0, (TimerCallbackFunction_t)connectToMqtt);
  wifiReconnectTimer = xTimerCreate("wifiTimer", pdMS_TO_TICKS(2000), pdFALSE, (void*)0, (TimerCallbackFunction_t)connectToWifi);

  WiFi.onEvent(WiFiEvent);
  mqttClient.onConnect(onMqttConnect);
  mqttClient.onDisconnect(onMqttDisconnect);
  mqttClient.onMessage(onMqttMessage);

  mqttClient.setCredentials(MQTT_USER, MQTT_PASS);
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);

  connectToWifi();
}

unsigned long lastSensorRead = 0;
const unsigned long sensorInterval = 2000;

// Thêm các hằng số tính toán Lux
const float GAMMA = 0.7;
const float RL10 = 50;

void loop() {
  // Thực hiện chớp LED nếu đang ở chế độ Blink
  if (isBlinkEach) blinkEach();
  if (isBlinkAll) blinkAll();

  // Đọc và gửi cảm biến định kỳ
  if (millis() - lastSensorRead >= sensorInterval) {
    lastSensorRead = millis();
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    // --- TÍNH TOÁN LUX ---
    int analogValue = analogRead(LDRPIN);
    float voltage = analogValue / 4095.0 * 3.3;
    float resistance = 2000 * voltage / (1 - voltage / 3.3);
    float lux = pow(RL10 * 1e3 * pow(10, GAMMA) / resistance, (1 / GAMMA));
    if (!isnan(h) && !isnan(t)) {
      // Sử dụng StaticJsonDocument để đóng gói dữ liệu
      StaticJsonDocument<256> doc;
      doc["room_id"] = ROOM_ID;
      doc["temp"] = serialized(String(t, 1));      // Định dạng 1 chữ số thập phân
      doc["humidity"] = serialized(String(h, 1));  // Định dạng 1 chữ số thập phân
      doc["light_lux"] = (int)lux;                 // Ép kiểu về số nguyên cho gọn khi lưu DB

      char msg[256];
      serializeJson(doc, msg);

      if (mqttClient.connected()) {
        mqttClient.publish(MQTT_PUB_DATA, 0, false, msg);
        Serial.print("Đã gửi: ");
        Serial.println(msg);
      }
    }
  }
}