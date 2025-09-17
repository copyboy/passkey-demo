# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a FIDO Passkey demonstration project implementing registration and login flows with device authenticator support. The project includes detailed sequence diagrams showing the interaction between frontend, browser/OS, backend server, and authenticator (device security chip).

## Technology Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Node.js (Express) - To be implemented
- **Package Manager**: pnpm
- **Storage**: File-based JSON storage
- **Authentication**: FIDO2/WebAuthn Passkey support

## Project Structure

```
passkey-demo/
├── ui/                    # 前端 Next.js 应用
│   ├── src/
│   │   ├── app/           # App Router 页面
│   │   └── components/    # React 组件
│   └── package.json
├── app/                   # 后端服务器 (Node.js + Express)
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── routes/        # 路由
│   │   ├── services/      # 业务逻辑
│   │   ├── storage/       # 数据存储 (JSON)
│   │   └── types/         # 类型定义
│   └── package.json
├── docs/                  # 项目文档
├── CLAUDE.md              # Claude 开发指南
└── README.md              # 项目说明
```

## Development Commands

### Frontend (ui/ directory)
```bash
cd ui

# Install dependencies
pnpm install

# Start development server (port 3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

### Backend (app/ directory)
```bash
cd app

# Install dependencies
pnpm install

# Start development server (port to be determined)
pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint
```

## Architecture Overview

### Passkey Registration Flow
1. Frontend requests registration challenge from backend
2. Backend generates random challenge and PublicKey creation options
3. Frontend calls `navigator.credentials.create()` 
4. Browser/OS prompts for biometric verification
5. Authenticator generates asymmetric key pair (private key never leaves device)
6. Backend validates and stores public key with credential ID

### Passkey Login Flow  
1. Frontend requests login challenge for username
2. Backend finds registered credential IDs and generates challenge
3. Frontend calls `navigator.credentials.get()`
4. User selects account and completes biometric verification
5. Authenticator signs challenge with private key
6. Backend verifies signature using stored public key

### Key Security Features
- **Phishing resistance**: Passkeys only work for original registered domain
- **Zero-knowledge proof**: Private keys never leave the device
- **No secret transmission**: Only cryptographic signatures are sent over network
- **Challenge-response**: Prevents replay attacks with random challenges

## Storage Architecture (File-based)

The backend will use file-based JSON storage for data persistence:
- User accounts and metadata (`app/data/users.json`)
- Passkey credential IDs and public keys (`app/data/credentials.json`)  
- Challenge tracking for prevention of replay attacks (`app/data/challenges.json`)
- Session management (`app/data/sessions.json`)

## API Documentation

Complete API documentation is available in `docs/API_DOCS.md`, including:
- Registration and login endpoints
- User management endpoints
- Error response formats
- Data storage schemas

## WebAuthn Implementation Notes

The server implementation needs to handle:
- Challenge generation and validation
- PublicKeyCredential creation options
- PublicKeyCredential request options  
- Credential assertion verification
- User session management
- File-based data persistence with proper error handling

## Development Considerations

When implementing this passkey demo:
- Use the WebAuthn specification for credential creation and assertion
- Implement proper challenge storage and expiration with cleanup
- Handle cross-browser compatibility for WebAuthn APIs
- Provide clear error messages for biometric verification failures
- Consider credential backup and synchronization requirements
- Implement file locking or atomic writes for data consistency
- Use Express.js for backend API endpoints
- Implement proper TypeScript types for WebAuthn objects
- Follow the API design documented in `docs/API_DOCS.md`
- Separate frontend and backend development workflows
- Add to memory, not running app & ui, I'll do this,