import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Result } from 'antd';
import * as Sentry from '@sentry/react';
import { AppButton } from '@shared/ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info);
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle="An unexpected error occurred. Try reloading the page."
          extra={
            <AppButton variant="primary" onClick={() => window.location.assign('/')}>
              Back to home
            </AppButton>
          }
        />
      );
    }

    return this.props.children;
  }
}
