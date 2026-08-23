import React, { useState } from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

// Web App entry
import WebApp from "./src/App";

export default function App() {
  if (Platform.OS === "web") {
    return <WebApp />;
  }

  // Native iOS / Android in Expo Go
  return <NativeAppWrapper />;
}

function NativeAppWrapper() {
  // Dynamically require react-native-webview on native platforms
  const { WebView } = require("react-native-webview");

  // Default LAN IP detected by Metro
  const [appUrl, setAppUrl] = useState("http://10.49.216.227:3001");
  const [inputUrl, setInputUrl] = useState("http://10.49.216.227:3001");
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(1);

  const handleReload = () => {
    setHasError(false);
    setAppUrl(inputUrl);
    setKey((prev) => prev + 1);
  };

  if (hasError) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F6F4EE" translucent={false} />
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>StockAI Terminal Connection</Text>
          <Text style={styles.errorSubtitle}>
            Unable to connect to the StockAI development server at:
          </Text>
          <TextInput
            style={styles.urlInput}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="http://<YOUR_IP>:3001"
            placeholderTextColor="#8E8E93"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
            <Text style={styles.retryButtonText}>Connect to Server</Text>
          </TouchableOpacity>
          <Text style={styles.helpText}>
            Ensure your computer and mobile phone are on the same Wi-Fi network.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F4EE" translucent={false} />
      <WebView
        key={key}
        source={{ uri: appUrl }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        originWhitelist={["*"]}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F2A93B" />
            <Text style={styles.loadingText}>Loading StockAI Intelligence...</Text>
          </View>
        )}
        onError={() => setHasError(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F4EE",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0,
  },
  webview: {
    flex: 1,
    backgroundColor: "#F6F4EE",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F4EE",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: "#141414",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F4EE",
    padding: 20,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0,
  },
  errorCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#EBE8DF",
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#141414",
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 12,
    color: "#787670",
    textAlign: "center",
    marginBottom: 16,
  },
  urlInput: {
    width: "100%",
    height: 48,
    backgroundColor: "#FAF9F5",
    borderWidth: 1,
    borderColor: "#EBE8DF",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 13,
    color: "#141414",
    marginBottom: 16,
  },
  retryButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#141414",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  helpText: {
    fontSize: 11,
    color: "#8E8E93",
    textAlign: "center",
  },
});
