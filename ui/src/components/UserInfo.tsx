'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { User } from '@/types';

export function UserInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取用户信息失败');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '注销失败');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center text-gray-600">您还未登录</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-black mb-6 text-center text-gray-900 border-b-2 border-blue-500 pb-3">👤 用户信息</h2>
      
      <div className="space-y-3">
        <div>
          <span className="font-medium text-gray-700">用户名：</span>
          <span className="text-gray-900">{user.username}</span>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">注册时间：</span>
          <span className="text-gray-900">
            {new Date(user.created_at).toLocaleString('zh-CN')}
          </span>
        </div>

        {user.credentials && user.credentials.length > 0 && (
          <div>
            <span className="font-medium text-gray-700">Passkey 数量：</span>
            <span className="text-gray-900">{user.credentials.length}</span>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          注销
        </button>
      </div>

      {user.credentials && user.credentials.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          <p className="font-bold text-lg text-gray-800 mb-2">🔑 您的 Passkey：</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            {user.credentials.map((credential, index) => (
              <li key={credential.id}>
                Passkey {index + 1} - 创建于 {new Date(credential.created_at).toLocaleDateString('zh-CN')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}