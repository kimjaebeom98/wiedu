import { useState, useCallback } from 'react';
import { AlertButton } from '../components/common/CustomAlert';

export type AlertIcon =
  | 'alert-circle'
  | 'check-circle'
  | 'x-circle'
  | 'info'
  | 'help-circle'
  | 'trash-2'
  | 'user-check'
  | 'user-x'
  | 'user-plus'
  | 'lock'
  | 'calendar'
  | 'log-out'
  | 'edit-2'
  | 'send';

export interface AlertConfig {
  title: string;
  message?: string;
  icon?: AlertIcon;
  iconColor?: string;
  buttons?: AlertButton[];
}

export interface UseAlertReturn {
  visible: boolean;
  config: AlertConfig;
  show: (config: AlertConfig) => void;
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      icon?: AlertIcon;
      confirmText?: string;
      cancelText?: string;
    }
  ) => void;
  hide: () => void;
  alertProps: {
    visible: boolean;
    title: string;
    message?: string;
    icon?: AlertIcon;
    iconColor?: string;
    buttons?: AlertButton[];
    onClose: () => void;
  };
}

export function useAlert(): UseAlertReturn {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({ title: '' });

  const show = useCallback((alertConfig: AlertConfig) => {
    setConfig(alertConfig);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  const confirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void | Promise<void>,
      options?: {
        icon?: AlertIcon;
        confirmText?: string;
        cancelText?: string;
      }
    ) => {
      setConfig({
        title,
        message,
        icon: options?.icon ?? 'alert-circle',
        buttons: [
          { text: options?.cancelText ?? '취소', style: 'cancel' },
          {
            text: options?.confirmText ?? '확인',
            style: 'destructive',
            onPress: async () => {
              await onConfirm();
            },
          },
        ],
      });
      setVisible(true);
    },
    []
  );

  return {
    visible,
    config,
    show,
    confirm,
    hide,
    alertProps: {
      visible,
      title: config.title,
      message: config.message,
      icon: config.icon,
      iconColor: config.iconColor,
      buttons: config.buttons,
      onClose: hide,
    },
  };
}
