'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { WebAuthnService } from '@/lib/webauthn';
import { RegistrationOptions } from '@/types';

export function RegisterForm() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
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
      console.log('🚀 开始注册流程，用户名:', username.trim());
      
      // 检查 WebAuthn 支持
      console.log('🔍 检查 WebAuthn 支持...');
      const support = WebAuthnService.checkSupport();
      console.log('🔍 WebAuthn 支持情况:', support);
      
      if (!support.supported) {
        setError('您的浏览器不支持 WebAuthn');
        return;
      }
      
      // 1. 获取注册挑战
      console.log('📋 请求注册挑战...');
      const options: RegistrationOptions = await apiClient.getRegistrationChallenge(username.trim());
      console.log('📋 注册挑战响应:', JSON.stringify(options, null, 2));
      console.log('📋 Challenge 值:', options.challenge);
      console.log('📋 User ID:', options.user.id);
      console.log('📋 RP ID:', options.rp.id);
      
      // 2. 启动 WebAuthn 注册
      console.log('🔐 开始 WebAuthn 注册...');
      const credential = await WebAuthnService.register(options);
      console.log('🔐 WebAuthn 注册响应原始数据:', credential);
      console.log('🔐 Credential ID:', credential.id);
      console.log('🔐 Credential rawId:', credential.rawId);
      console.log('🔐 Client data JSON:', credential.response?.clientDataJSON);
      console.log('🔐 Attestation object:', credential.response?.attestationObject);
      console.log('🔐 Type:', credential.type);
      
      // 验证凭证结构
      const validation = WebAuthnService.validateCredential(credential);
      console.log('🔍 凭证验证结果:', validation);
      
      if (!validation.valid) {
        console.error('❌ 凭证验证失败:', validation.errors);
        setError('凭证验证失败: ' + validation.errors.join(', '));
        return;
      }
      
      // 详细检查响应结构
      if (credential.response) {
        console.log('🔐 Response keys:', Object.keys(credential.response));
        console.log('🔐 Client data JSON length:', credential.response.clientDataJSON?.length);
        console.log('🔐 Attestation object length:', credential.response.attestationObject?.length);
      }
      
      // 3. 验证注册
      console.log('✅ 发送验证请求...');
      const verificationRequest = {
        username: username.trim(),
        credential
      };
      console.log('✅ 验证请求数据:', JSON.stringify(verificationRequest, null, 2));
      
      const result = await apiClient.verifyRegistration(verificationRequest);
      console.log('✅ 验证响应:', result);

      if (result.success) {
        setSuccess('注册成功！您现在可以使用 Passkey 登录了');
        setUsername('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('❌ 注册流程错误:', err);
      console.error('❌ 错误类型:', typeof err);
      console.error('❌ 错误详情:', err instanceof Error ? err.stack : 'No stack trace');
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-black mb-6 text-center text-blue-900 border-b-2 border-blue-500 pb-3">🔐 注册 Passkey</h2>
      
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-gray-800 mb-2">
            用户名
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 placeholder-gray-400 text-base font-medium shadow-sm transition-all duration-200"
            placeholder="请输入用户名"
            disabled={isLoading}
            autoComplete="username"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !username.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? '注册中...' : '使用 Passkey 注册'}
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
        <p className="font-bold text-base text-gray-800 mb-2">📋 注册说明：</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>请确保您的设备支持生物识别（指纹、面部识别等）</li>
          <li>注册过程中需要验证您的身份</li>
          <li>注册完成后，您可以使用相同的生物识别方式登录</li>
        </ul>
      </div>
    </div>
  );
}