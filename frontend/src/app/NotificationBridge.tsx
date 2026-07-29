import { useEffect } from 'react';
import { App } from 'antd';
import { registerNotifier } from '@shared/lib/notify';

export function NotificationBridge() {
  const { message } = App.useApp();

  useEffect(() => {
    registerNotifier(message);
  }, [message]);

  return null;
}
