import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export function Divider() {
  return <View style={styles.rule} />;
}

const styles = StyleSheet.create((theme) => ({
  rule: { height: StyleSheet.hairlineWidth ?? 1, backgroundColor: theme.colors.hairline },
}));
