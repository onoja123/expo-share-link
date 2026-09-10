import { isAvailable, shareLink, type ShareLinkResult } from 'expo-share-link';
import { useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const URL = 'https://github.com/onoja123/expo-share-link';

export default function App() {
  const [result, setResult] = useState<ShareLinkResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const share = async (withIcon: boolean) => {
    setError(null);
    try {
      setResult(
        await shareLink({
          url: URL,
          title: 'expo-share-link on GitHub',
          icon: withIcon ? require('./assets/icon.png') : undefined,
          dialogTitle: 'Share this repo',
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.heading}>expo-share-link</Text>
      <Text style={styles.body}>Share sheet available: {String(isAvailable())}</Text>
      <View style={styles.buttons}>
        <Button title="Share with title and icon" onPress={() => share(true)} />
        <Button title="Share with title only" onPress={() => share(false)} />
      </View>
      {result ? <Text style={styles.body}>Result: {JSON.stringify(result)}</Text> : null}
      {error ? <Text style={[styles.body, styles.error]}>Error: {error}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, gap: 16, justifyContent: 'center', backgroundColor: '#fff' },
  heading: { fontSize: 28, fontWeight: '700' },
  body: { fontSize: 16 },
  error: { color: '#c00' },
  buttons: { gap: 12 },
});
