import type { MessageInstance } from 'antd/es/message/interface';

let messageApi: MessageInstance | null = null;

export function registerNotifier(api: MessageInstance) {
  messageApi = api;
}

export function notifyError(content: string) {
  messageApi?.error(content);
}
