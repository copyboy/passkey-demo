'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { WebAuthnService } from '@/lib/webauthn';
import { AuthenticationOptions } from '@/types';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }

    if (!WebAuthnService.isSupported()) {
      setError('您的浏览器不支持 WebAuthn');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. 获取登录挑战
      const options: AuthenticationOptions = await apiClient.getLoginChallenge(username.trim());
      
      // 2. 启动 WebAuthn 认证
      const credential = await WebAuthnService.authenticate(options);
      
      // 3. 验证登录
      const result = await apiClient.verifyLogin({
        username: username.trim(),
        credential
      });

      if (result.success) {
        setSuccess('登录成功！');
        setUsername('');
        // 可以在这里重定向到用户页面
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-black mb-6 text-center text-green-900 border-b-2 border-green-500 pb-3">🚀 Passkey 登录</h2>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-gray-800 mb-2">
            用户名
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500 placeholder-gray-400 text-base font-medium shadow-sm transition-all duration-200"
            placeholder="请输入用户名"
            disabled={isLoading}
            autoComplete="username"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !username.trim()}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold text-base hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? '登录中...' : '使用 Passkey 登录'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-800 rounded-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-800 rounded-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-bold text-base text-gray-800 mb-2">📝 登录说明：</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>请输入您注册时使用的用户名</li>
          <li>系统会调用您的设备进行生物识别验证</li>
          <li>无需记住密码，安全便捷</li>
        </ul>
      </div>
    </div>
  );
}