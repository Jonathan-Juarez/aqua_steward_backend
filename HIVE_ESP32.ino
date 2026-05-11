#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

// --- Credenciales y Configuración ---
const char* ssid = "ULV-ESTUDIANTES";
const char* password = "3STUDI4NT3S";

const char* mqtt_server = "8ec97f4f3bc645adbf9cc4d7dfa81a6a.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_username = "Jonathan";
const char* mqtt_password = "IDSJJJV2005a";

// Tópico MQTT.
const char* name_topic = "AquaStewardTopic";

// Pines Ultrasónico.
const int trigPin = 5;
const int echoPin = 18;
// Pines - Sensores de calidad.
const int phPin = 34;
const int turbidezPin = 35;

// Certificado HiveMQ.
static const char* root_ca PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5
ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur
TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC
jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc
oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq
4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA
mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d
emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=
-----END CERTIFICATE-----
)EOF";

WiFiClientSecure espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;

void setup_wifi() {
  delay(10);
  Serial.print("\nConectando a ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado. IP: ");
  Serial.println(WiFi.localIP());
}


// Devolución de llamada MQTT.
void callback(char* topic, byte* payload, unsigned int length) {
  if (strcmp(topic, name_topic) == 0) {
    String mensaje = "";
    for (int i = 0; i < length; i++) {
      mensaje += (char)payload[i];
    }
    Serial.print("Comando recibido en AquaSteward: ");
    Serial.println(mensaje);
  }
}

// Reconexión MQTT.
void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando a MQTT...");
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);

    if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("Conectado");
      client.subscribe(name_topic);
    } else {
      Serial.print("Falló, rc=");
      Serial.print(client.state());
      Serial.println(" reintentando en 5s");
      delay(5000);
    }
  }
}

// Sensor ultrasónico.
float readDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH);
  if (duration == 0) return -1.0;
  return duration * 0.034 / 2;
}

// Lectura ADC promedio.
float leerADCPromedio(int pin) {
  const int numMuestras = 50;
  long sumaADC = 0;
  for (int i = 0; i < numMuestras; i++) {
    sumaADC += analogRead(pin);
    delay(5);
  }
  return (float)sumaADC / numMuestras;
}

void setup() {
  pinMode(echoPin, INPUT);
  pinMode(trigPin, OUTPUT);
  pinMode(turbidezPin, INPUT);
  pinMode(phPin, INPUT);

  Serial.begin(115200);
  setup_wifi();

  // Configuración de certificado seguro.
  espClient.setCACert(root_ca);
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();

  if (now - lastMsg > 10000) {  
    lastMsg = now;

    String ip = WiFi.localIP().toString();
    // Tópico dinámico (aquasteward/IP/[sensor]) para el backend.
    String topicBase = "aquasteward/" + ip;

    // Publicación de distancia.
    float distance = readDistance();
    if (distance == -1.0) {
      Serial.println("Error: Sensor no detecta eco.");
    } else {
      String topicDistancia = topicBase + "/distancia";
      client.publish(topicDistancia.c_str(), String(distance).c_str(), true);

      Serial.print("Distancia: ");
      Serial.print(distance);
      Serial.println(" cm");

    //       Serial.println("Publicando:");
    // Serial.println(topicDistancia);
    }
    // Publicación de turbidez (ADC crudo promedio).
    float adcTurbidez = leerADCPromedio(turbidezPin);
    String topicTurb = topicBase + "/turbidez";
    client.publish(topicTurb.c_str(), String(adcTurbidez, 2).c_str(), true);

    Serial.print("ADC Turbidez: ");
    Serial.println(adcTurbidez, 2);

    // Publicación de pH (ADC crudo promedio).
    float adcPH = leerADCPromedio(phPin);
    String topicPH = topicBase + "/ph";
    client.publish(topicPH.c_str(), String(adcPH, 2).c_str(), true);
    Serial.print("ADC pH: ");
    Serial.println(adcPH, 2);


    
  }
}

