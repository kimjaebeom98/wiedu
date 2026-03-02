import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: FeatherIconName;
  rightIcon?: FeatherIconName;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export default function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry !== undefined;
  const shouldHideText = isPassword && !showPassword;

  const inputContainerStyles: ViewStyle[] = [
    styles.inputContainer,
    isFocused ? styles.inputContainerFocused : {},
    error ? styles.inputContainerError : {},
  ];

  const inputStyles: TextStyle[] = [
    styles.input,
    leftIcon ? styles.inputWithLeftIcon : {},
    (rightIcon || isPassword) ? styles.inputWithRightIcon : {},
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={inputContainerStyles}>
        {leftIcon && (
          <Feather
            name={leftIcon}
            size={20}
            color={isFocused ? '#8B5CF6' : '#71717A'}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={inputStyles}
          placeholderTextColor="#52525B"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={shouldHideText}
          accessibilityLabel={label}
          accessibilityHint={hint}
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity
            style={styles.rightIconButton}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            <Feather
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#71717A"
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            style={styles.rightIconButton}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            <Feather name={rightIcon} size={20} color="#71717A" />
          </TouchableOpacity>
        ) : null}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: '#8B5CF6',
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    marginRight: 4,
  },
  rightIconButton: {
    padding: 4,
    marginLeft: 4,
  },
  error: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 6,
  },
  hint: {
    fontSize: 13,
    color: '#71717A',
    marginTop: 6,
  },
});
