import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform, Linking, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import NetInfo from "@react-native-community/netinfo";
import * as SplashScreen from "expo-splash-screen";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Notifications from 'expo-notifications';
import NotificationService from './services/NotificationService';
import CacheService from './services/CacheService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

const APP_CONFIG = {
  websiteUrl: "{{WEBSITE_URL}}",
  userAgent: "{{USER_AGENT}}",
  deepLinking: {
    enabled: true,
    allowedDomains: ["{{MAIN_DOMAIN}}"],
    customScheme: "{{APP_SCHEME}}"
  },
  notificationConfig: {
    apiEndpoint: "{{NOTIFICATION_API_ENDPOINT}}",
    apiKey: "{{NOTIFICATION_API_KEY}}",
    pollInterval: "{{POLL_INTERVAL}}",
    userId: "{{USER_ID}}"
  },
  cacheConfig: {
    enabled: true,
    maxCacheSize: "{{CACHE_SIZE}}",
    maxCacheAge: "{{CACHE_AGE}}",
    preloadUrls: "{{PRELOAD_URLS}}",
    offlineMode: "{{OFFLINE_MODE}}"
  }
};

export default function App() {
  const [isConnected, setIsConnected] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [servicesReady, setServicesReady] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const initializeServices = async () => {
      try {
        const cacheInitialized = await CacheService.initialize(APP_CONFIG.cacheConfig);
        const notificationInitialized = await NotificationService.initialize(APP_CONFIG.notificationConfig);
        
        if (cacheInitialized && notificationInitialized) {
          setServicesReady(true);
          await CacheService.preloadUrls();
          const stats = await CacheService.getCacheStats();
          setCacheStats(stats);
        }
      } catch (error) {
        console.error('Failed to initialize services:', error);
        setServicesReady(true);
      }
    };

    const handleDeepLink = (url) => {
      if (!APP_CONFIG.deepLinking.enabled) return;
      
      try {
        const urlObj = new URL(url);
        const isAllowedDomain = APP_CONFIG.deepLinking.allowedDomains.some(domain => 
          urlObj.hostname.includes(domain.replace('{{MAIN_DOMAIN}}', ''))
        );
        
        if (isAllowedDomain && webViewRef.current) {
          webViewRef.current.injectJavaScript(`window.location.href = "${url}"; true;`);
        }
      } catch (error) {
        console.error('Invalid deep link URL:', error);
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });

    const requestNotificationPermissions = async () => {
      if (Platform.OS === 'android') {
        const { status } = await Notifications.requestPermissionsAsync();
      }
    };

    const initialize = async () => {
      await requestNotificationPermissions();
      await initializeServices();
      
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    initialize();

    const linkingListener = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    const notificationListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.url) {
        handleDeepLink(data.url);
      }
    });

    const cacheStatsInterval = setInterval(async () => {
      if (servicesReady) {
        const stats = await CacheService.getCacheStats();
        setCacheStats(stats);
      }
    }, 30000);

    setTimeout(async () => {
      setAppReady(true);
      await SplashScreen.hideAsync();
    }, 1200);

    return () => {
      unsubscribe();
      linkingListener.remove();
      notificationListener.remove();
      clearInterval(cacheStatsInterval);
    };
  }, []);

  // Handle back button press - separate useEffect to avoid stale closure
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // Prevent default behavior (closing app)
      }
      return false; // Allow default behavior (close app) if can't go back
    });

    return () => {
      backHandler.remove();
    };
  }, [canGoBack]);

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.offlineContainer}>
        <Text style={styles.offlineText}>⚠️ No internet connection</Text>
        <Text>Please reconnect to continue.</Text>
      </SafeAreaView>
    );
  }

  if (!appReady || !servicesReady) {
    return null; // splash is still showing or services are initializing
  }

  const handleLoadStart = () => {
    setIsLoading(true);
    setLoadProgress(0);
    progressAnim.setValue(0);
  };

  const handleLoadProgress = ({ nativeEvent }) => {
    const progress = nativeEvent.progress;
    setLoadProgress(progress);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const sendTestNotification = async () => {
    try {
      await NotificationService.sendNotification(
        "WebView Loaded! 🎉",
        "Your app has successfully loaded the web content.",
        { 
          url: APP_CONFIG.websiteUrl,
          timestamp: new Date().toISOString(),
          cacheStats: cacheStats
        }
      );
      console.log('Test notification sent successfully');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const checkForAPINotifications = async () => {
    try {
      const notifications = await NotificationService.checkForNotifications();
      console.log(`Checked for API notifications, found: ${notifications.length}`);
    } catch (error) {
      console.error('Error checking for API notifications:', error);
    }
  };

  const handleLoadEnd = async () => {
    setIsLoading(false);
    setRetryCount(0);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    if (APP_CONFIG.cacheConfig.enabled) {
      try {
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'CACHE_PAGE',
              url: window.location.href,
              html: document.documentElement.outerHTML
            }));
            true;
          `);
        }
      } catch (error) {
        console.error('Error caching page:', error);
      }
    }
    
    // sendTestNotification(); // Commented out to prevent notifications on every page load
    checkForAPINotifications();
  };

  const handleError = () => {
    setRetryCount(prev => prev + 1);
    retryTimeoutRef.current = setTimeout(() => {
      if (webViewRef.current) {
        webViewRef.current.reload();
      }
    }, 1000);
  };

  const handleShouldStartLoadWithRequest = (request) => {
    return true;
  };

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
  };

 const injectedJavaScript = `
(function() {
  function uid() { return 'webview-file-' + Math.random().toString(36).slice(2); }

  function enhanceFileInputs() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input, idx) => {
      if (input.dataset.webviewEnhanced) return;
      input.dataset.webviewEnhanced = '1';

      if (!input.dataset.webviewInputId) {
        input.dataset.webviewInputId = uid();
      }
      const inputId = input.dataset.webviewInputId;

      input.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const payload = {
          type: 'REQUEST_FILE',
          inputId: inputId,
          accept: input.accept || '',
          multiple: !!input.multiple
        };
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }, true);

      const originalClick = input.click.bind(input);
      input.click = function() {
        const evt = new Event('click', { bubbles: true, cancelable: true });
        input.dispatchEvent(evt);
      };
    });
  }

  window.__receiveFilesFromNative = async function(payloadJson) {
    try {
      const payload = JSON.parse(payloadJson);
      const input = document.querySelector('[data-webview-input-id="' + payload.inputId + '"]');
      if (!input) return;

      const dt = new DataTransfer();
      for (const f of payload.files) {
        const res = await fetch('data:' + f.mime + ';base64,' + f.base64);
        const blob = await res.blob();
        const file = new File([blob], f.name, { type: f.mime });
        dt.items.add(file);
      }
      input.files = dt.files;

      input.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (err) {
      console.error('Error in __receiveFilesFromNative:', err);
    }
  };

  enhanceFileInputs();
  document.addEventListener('DOMContentLoaded', enhanceFileInputs);
  window.addEventListener('load', enhanceFileInputs);

  const observer = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.addedNodes && m.addedNodes.length) {
        enhanceFileInputs();
        break;
      }
    }
  });
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
})();
true;
`;

const handleWebViewMessage = async (event) => {
  try {
    const msg = event?.nativeEvent?.data;
    if (!msg) return;

    let data;
    try {
      data = JSON.parse(msg);
    } catch {
      return;
    }

    if (data.type === 'CACHE_PAGE') {
      try {
        await CacheService.cachePageForOffline(data.url, data.html);
      } catch (error) {
        console.error('Failed to cache page:', error);
      }
      return;
    }

    if (data.type !== 'REQUEST_FILE') return;

    const res = await DocumentPicker.getDocumentAsync({
      type: data.accept || '*/*',
      multiple: data.multiple || false,
      copyToCacheDirectory: true,
    });

    if (!res || res.type === 'cancel' || res.canceled) {
      console.log('User cancelled file selection');
      return;
    }

    // normalize across both old and new formats
    const assets = res.assets || [res];
    const filesToSend = [];

    for (const asset of assets) {
      if (!asset?.uri) {
        console.warn('Missing URI for asset', asset);
        continue;
      }

      const uri = asset.uri;
      const name = asset.name || uri.split('/').pop() || 'file';
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64', // works for all versions
      });

      const ext = name.includes('.') ? name.split('.').pop() : '';
      const mime =
        asset.mimeType ||
        (ext ? `application/${ext}` : 'application/octet-stream');

      filesToSend.push({ name, mime, base64 });
    }

    if (!filesToSend.length) return;

    const payload = {
      inputId: data.inputId,
      files: filesToSend,
      multiple: data.multiple || false,
    };

    const jsToInject = `
      window.__receiveFilesFromNative(${JSON.stringify(
        JSON.stringify(payload)
      )});
      true;
    `;
    webViewRef.current?.injectJavaScript(jsToInject);
  } catch (err) {
    console.warn('handleWebViewMessage error', err);
  }
};





  return (
    <SafeAreaView style={styles.container}>
      {/* Browser-style progress bar */}
      {isLoading && (
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ 
          uri: APP_CONFIG.websiteUrl,
          headers: APP_CONFIG.userAgent !== "{{USER_AGENT}}" ? {
            'User-Agent': APP_CONFIG.userAgent
          } : {}
        }}
        userAgent={APP_CONFIG.userAgent !== "{{USER_AGENT}}" ? APP_CONFIG.userAgent : undefined}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFileAccess={true}
        allowsFileAccessFromFileURLs={true}
        allowsUniversalAccessFromFileURLs={true}
        allowsFullscreenVideo={true}
        allowsProtectedMedia={true}
        mediaCapturePermissionGrantType="prompt"
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleWebViewMessage}
        onLoadStart={handleLoadStart}
        onLoadProgress={handleLoadProgress}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onNavigationStateChange={handleNavigationStateChange}
        allowsBackForwardNavigationGestures
        scalesPageToFit
        startInLoadingState={false}
        onFileDownload={({ nativeEvent }) => {
          console.log('File download requested:', nativeEvent);
        }}
        onPermissionRequest={(request) => {
          console.log('Permission requested:', request);
          request.grant();
        }}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        androidLayerType="hardware"
        androidCameraAccess={true}
        androidHardwareAccelerationDisabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  offlineContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  offlineText: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  progressContainer: {
    height: 3,
    backgroundColor: "#f0f0f0",
    width: "100%",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 1.5,
  },
  testButtonContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    zIndex: 1000,
    gap: 8,
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 50,
    alignItems: 'center',
  },
  apiButton: {
    backgroundColor: '#FF6B35',
  },
  cacheButton: {
    backgroundColor: '#28A745',
  },
  testButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
