import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onClose: () => void;
  icon?: 'alert-circle' | 'check-circle' | 'x-circle' | 'info' | 'help-circle' | 'trash-2' | 'user-check' | 'user-x' | 'lock' | 'calendar' | 'log-out' | 'edit-2' | 'send';
  iconColor?: string;
}

export default function CustomAlert({
  visible,
  title,
  message,
  buttons = [{ text: '확인', style: 'default' }],
  onClose,
  icon,
  iconColor,
}: CustomAlertProps) {
  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  const getIconColor = () => {
    if (iconColor) return iconColor;
    if (icon === 'check-circle' || icon === 'user-check') return '#22C55E';
    if (icon === 'x-circle' || icon === 'trash-2' || icon === 'user-x') return '#EF4444';
    if (icon === 'alert-circle') return '#F59E0B';
    if (icon === 'lock') return '#71717A';
    if (icon === 'calendar') return '#3B82F6';
    if (icon === 'log-out') return '#EF4444';
    if (icon === 'edit-2' || icon === 'send') return '#8B5CF6';
    return '#8B5CF6';
  };

  const getButtonStyle = (style?: 'default' | 'cancel' | 'destructive') => {
    switch (style) {
      case 'destructive':
        return styles.destructiveBtn;
      case 'cancel':
        return styles.cancelBtn;
      default:
        return styles.defaultBtn;
    }
  };

  const getButtonTextStyle = (style?: 'default' | 'cancel' | 'destructive') => {
    switch (style) {
      case 'destructive':
        return styles.destructiveBtnText;
      case 'cancel':
        return styles.cancelBtnText;
      default:
        return styles.defaultBtnText;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}20` }]}>
              <Feather name={icon} size={28} color={getIconColor()} />
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          {message && <Text style={styles.message}>{message}</Text>}

          {/* Buttons */}
          <View style={[
            styles.buttonContainer,
            buttons.length === 1 && styles.singleButtonContainer,
          ]}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  getButtonStyle(button.style),
                  buttons.length === 1 && styles.singleButton,
                ]}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.7}
              >
                <Text style={getButtonTextStyle(button.style)}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#1F1F23',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  singleButtonContainer: {
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleButton: {
    flex: 0,
    paddingHorizontal: 48,
  },
  defaultBtn: {
    backgroundColor: '#8B5CF6',
  },
  defaultBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: '#27272A',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  destructiveBtn: {
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: '#EF444430',
  },
  destructiveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});
