import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedRGBProps {
  children?: React.ReactNode;
  style?: any;
  isBorder?: boolean;
}

export const AnimatedRGB: React.FC<AnimatedRGBProps> = ({ children, style, isBorder = false }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 3,
        duration: 9000, // 9 seconds for a full cycle
        useNativeDriver: false, // Color interpolation cannot use native driver
      })
    ).start();
  }, [animatedValue]);

  const rgbColor = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#00F0FF', '#FF003C', '#8B5CF6', '#00F0FF'], // Cyan -> Magenta -> Purple -> Cyan
  });

  const animatedStyle = isBorder
    ? { borderColor: rgbColor, borderWidth: 2 }
    : { backgroundColor: rgbColor };

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedRGB;
