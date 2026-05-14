import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

type AppLoaderProps = {
  visible?: boolean;
  message?: string;
  overlay?: boolean;
};

const AppLoader = ({
  visible = true,
  message,
  overlay = false,
}: AppLoaderProps) => {
  if (!visible) {
    return null;
  }

  const content = (
    <View className="items-center justify-center rounded-3xl bg-white px-6 py-5 shadow-2xl shadow-black/10">
      <ActivityIndicator size="large" color="#1A6B34" />
      {message ? (
        <Text className="mt-3 text-center text-gray-600 text-sm font-semibold">
          {message}
        </Text>
      ) : null}
    </View>
  );

  if (overlay) {
    return (
      <View className="absolute inset-0 z-50 items-center justify-center bg-black/20 px-8">
        {content}
      </View>
    );
  }

  return <View className="items-center justify-center py-8">{content}</View>;
};

export default AppLoader;
