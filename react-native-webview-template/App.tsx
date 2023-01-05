import React, {
  useEffect,
  useRef
} from "react";

import {
  SafeAreaView,
  StatusBar,
  BackHandler,
  Alert,
  Linking
} from 'react-native';

import WebView, {
  type WebViewProps
} from "react-native-webview";

const backKeep = { state: false };

// type ShouldStartLoadWithRequestProps = {
//   // title
//   // url
//   // loading
//   // target
//   // canGoBack
//   // canGoForward
//   // lockIdentifier
//   // mainDocumentURL (iOS only)
//   // navigationType (iOS only)
//   // isTopFrame (iOS only)
// };

function onShouldStartLoadWithRequest(request: any) {

  // short circuit these
  if (!request.url ||
    request.url.startsWith('http') ||
    request.url.startsWith("/") ||
    request.url.startsWith("#") ||
    request.url.startsWith("javascript") ||
    request.url.startsWith("about:blank")
  ) {
    return true;
  }

  // blocked blobs
  if (request.url.startsWith("blob")) {
    Alert.alert("Link cannot be opened.");

    return false;
  }

  // list of schemas we will allow the webview
  // to open natively
  if (request.url.startsWith("tel:") ||
    request.url.startsWith("mailto:") ||
    request.url.startsWith("maps:") ||
    request.url.startsWith("geo:") ||
    request.url.startsWith("sms:")
  ) {

    Linking.openURL(request.url).catch(er => {
      Alert.alert("Failed to open Link: " + er.message);
    });

    return false;
  }

  // let everything else to the webview
  return true;
}

function App(): JSX.Element {
  const webView = useRef(null);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (backKeep.state) {
          webView.current && (webView.current as WebView<WebViewProps>).goBack();
        }

        return backKeep.state;
      });

    return (() => { backHandler.remove(); });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={"white"}
      />
      <WebView
        source={{ uri: "YOUR_URI_HERE" }}
        originWhitelist={[
          "http://*",
          "https://*",
          "intent://*",
          "tel:*",
          "mailto:*"
        ]}
        setSupportMultipleWindows={true}
        ref={webView}
        onLoadProgress={(syntheticEvent) => {
          const { nativeEvent: { url, canGoBack } } = syntheticEvent;

          backKeep.state = canGoBack;
        }}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      />
    </SafeAreaView>
  );
};

export default App;
