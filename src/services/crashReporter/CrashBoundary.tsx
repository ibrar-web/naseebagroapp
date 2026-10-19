import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppIcon } from '../../assets/icons';
import { useTranslation } from '../../localization';
import { reportCrash } from './crashReporter';

const CrashFallback = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <AppIcon name="alertTriangle" size={32} color="#FFFFFF" />
      </View>
      <Text style={styles.title}>{t('crash.title')}</Text>
      <Text style={styles.body}>{t('crash.body')}</Text>
      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.85}
        style={styles.retryBtn}
      >
        <Text style={styles.retryText}>{t('crash.retry')}</Text>
      </TouchableOpacity>
    </View>
  );
};

type Props = { children: ReactNode };
type State = { hasError: boolean; resetKey: number };

/**
 * Catches render errors, reports them, and shows a retry screen instead of a
 * blank one. Retry remounts the whole tree under it.
 */
export class CrashBoundary extends Component<Props, State> {
  state: State = { hasError: false, resetKey: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportCrash(error, 'render', true, info.componentStack ?? null);
  }

  private retry = () => {
    this.setState(s => ({ hasError: false, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return <CrashFallback onRetry={this.retry} />;
    }
    return (
      <React.Fragment key={this.state.resetKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  body: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 24,
    backgroundColor: '#145228',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  retryText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
