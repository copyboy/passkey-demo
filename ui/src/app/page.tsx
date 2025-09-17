'use client';

import { RegisterForm } from '@/components/RegisterForm';
import { LoginForm } from '@/components/LoginForm';
import { UserInfo } from '@/components/UserInfo';
import { WebAuthnErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Passkey 演示应用
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            体验 FIDO2 WebAuthn 技术，使用生物识别安全登录，无需密码
          </p>
        </div>

        {/* 功能说明 */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              什么是 Passkey？
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">更安全</h3>
                <p className="text-gray-600 text-sm">基于公钥加密，私钥永不离开设备，防止密码泄露</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">更便捷</h3>
                <p className="text-gray-600 text-sm">使用指纹、面部识别等生物识别，一键登录</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">防钓鱼</h3>
                <p className="text-gray-600 text-sm">Passkey 与网站域名绑定，防止钓鱼攻击</p>
              </div>
            </div>
          </div>
        </div>

        {/* 用户界面区域 */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-1">
            <UserInfo />
          </div>
          
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <WebAuthnErrorBoundary>
                  <RegisterForm />
                </WebAuthnErrorBoundary>
              </div>
              <div>
                <WebAuthnErrorBoundary>
                  <LoginForm />
                </WebAuthnErrorBoundary>
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">使用步骤</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>在左侧注册区域输入用户名并点击"使用 Passkey 注册"</li>
              <li>系统会提示您进行生物识别验证（指纹、面部识别等）</li>
              <li>注册成功后，您可以在右侧登录区域使用相同的用户名登录</li>
              <li>登录时同样需要生物识别验证</li>
              <li>成功登录后，用户信息会显示在左侧区域</li>
            </ol>
          </div>
        </div>

        {/* 技术说明 */}
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-sm text-gray-500">
            本演示使用 Next.js 15 + TypeScript + Tailwind CSS 构建前端，
            后端使用 Node.js + Express + SimpleWebAuthn 实现 WebAuthn 功能
          </p>
        </div>
      </div>
    </div>
  );
}