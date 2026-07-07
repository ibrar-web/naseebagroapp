import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  type ViewStyle,
} from 'react-native';

interface Props extends ScrollViewProps {
  children: React.ReactNode;
  /** Style applied to the outer KeyboardAvoidingView (defaults to flex:1). */
  outerStyle?: ViewStyle;
}

/**
 * Reusable screen scroll container that prevents the keyboard from obscuring
 * focused inputs. On iOS uses the 'padding' behavior; on Android the OS
 * handles it via windowSoftInputMode (adjustResize).
 *
 * Usage — replace your <ScrollView> with <KeyboardScrollView>:
 *   <KeyboardScrollView contentContainerStyle={styles.content}>
 *     ...inputs...
 *   </KeyboardScrollView>
 */
export const KeyboardScrollView = ({
  children,
  outerStyle,
  ...scrollProps
}: Props) => (
  <KeyboardAvoidingView
    style={[styles.flex, outerStyle]}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
