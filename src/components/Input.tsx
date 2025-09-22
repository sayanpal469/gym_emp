// components/FloatingLabelInput.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  Text,
} from 'react-native';

interface FloatingLabelInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  rightIcon?: React.ReactNode;
  inputStyle?: object;
  wrapperStyle?: object;
}

const Input = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  rightIcon,
  inputStyle,
  wrapperStyle,
  ...rest
}: FloatingLabelInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value === '' ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value !== '' ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -24],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 14],
    }),
  };

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      <Animated.Text style={[styles.labelBase, labelStyle]}>
        {label}
      </Animated.Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[styles.input, inputStyle]}
        secureTextEntry={secureTextEntry}
        {...rest}
      />
      {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
    paddingRight: 40,
    paddingTop: 20,
    color: 'black'
  },
  iconRight: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  labelBase: {
    position: 'absolute',
    left: 16,
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
  },

});
