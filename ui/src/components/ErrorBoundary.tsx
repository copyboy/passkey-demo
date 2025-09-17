'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ [ERROR_BOUNDARY] 捕获到错误:', error);
    console.error('❌ [ERROR_BOUNDARY] 错误信息:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 调用自定义错误处理
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-w-full p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              ❌ 系统错误
            </h2>
            <div className="text-sm text-red-700 space-y-2">
              <p>
                <strong>错误信息:</strong> {this.state.error?.message || '未知错误'}
              </p>
              {this.state.error?.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-600 hover:text-red-800">
                    查看错误堆栈
                  </summary>
                  <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-600 hover:text-red-800">
                    查看组件堆栈
                  </summary>
                  <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// WebAuthn 特定的错误边界
export function WebAuthnErrorBoundary({ children }: { children: ReactNode }) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('🔐 [WEBAUTHN_ERROR] WebAuthn 错误:', error);
    console.error('🔐 [WEBAUTHN_ERROR] 组件信息:', errorInfo);
    
    // 发送错误到分析服务（如果需要）
    // sendErrorToAnalytics(error, errorInfo);
  };

  return (
    <ErrorBoundary 
      onError={handleError}
      fallback={
        <div className="min-w-full p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-lg font-semibold text-orange-800 mb-2">
              🔐 WebAuthn 认证错误
            </h2>
            <p className="text-sm text-orange-700 mb-4">
              生物识别认证过程中出现错误。请确保您的设备支持 WebAuthn 并且已经启用了生物识别功能。
            </p>
            <div className="space-y-2 text-left text-xs text-orange-600">
              <p>• 检查浏览器是否支持 WebAuthn</p>
              <p>• 确保设备有指纹传感器或面部识别</p>
              <p>• 检查操作系统设置中的生物识别功能</p>
              <p>• 尝试刷新页面重新开始</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}