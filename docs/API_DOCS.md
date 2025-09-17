# API 文档

## 概述

本文档描述了 Passkey 演示项目的后端 API 接口。API 提供用户注册、登录和 Passkey 管理功能。

## 基础信息

- **基础 URL**: `http://localhost:{PORT}/api`
- **内容类型**: `application/json`
- **认证方式**: Session cookies

## 接口列表

### 1. 注册相关

#### 1.1 获取注册挑战
- **URL**: `POST /auth/register/challenge`
- **描述**: 生成注册挑战，用于创建新的 Passkey
- **请求体**:
  ```json
  {
    "username": "string"
  }
  ```
- **响应**:
  ```json
  {
    "challenge": "base64url-string",
    "rp": {
      "name": "Passkey Demo",
      "id": "localhost"
    },
    "user": {
      "id": "base64url-string",
      "name": "username",
      "displayName": "username"
    },
    "pubKeyCredParams": [
      { "type": "public-key", "alg": -7 },
      { "type": "public-key", "alg": -257 }
    ]
  }
  ```

#### 1.2 完成注册
- **URL**: `POST /auth/register/verify`
- **描述**: 验证并保存新创建的 Passkey
- **请求体**:
  ```json
  {
    "username": "string",
    "credential": "PublicKeyCredential"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "注册成功"
  }
  ```

### 2. 登录相关

#### 2.1 获取登录挑战
- **URL**: `POST /auth/login/challenge`
- **描述**: 生成登录挑战，用于验证现有 Passkey
- **请求体**:
  ```json
  {
    "username": "string"
  }
  ```
- **响应**:
  ```json
  {
    "challenge": "base64url-string",
    "allowCredentials": [
      {
        "id": "base64url-string",
        "type": "public-key"
      }
    ],
    "rpId": "localhost"
  }
  ```

#### 2.2 完成登录
- **URL**: `POST /auth/login/verify`
- **描述**: 验证 Passkey 并创建会话
- **请求体**:
  ```json
  {
    "username": "string",
    "credential": "PublicKeyCredential"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "登录成功",
    "user": {
      "id": "string",
      "username": "string"
    }
  }
  ```

### 3. 用户管理

#### 3.1 获取当前用户信息
- **URL**: `GET /user/me`
- **描述**: 获取当前登录用户信息
- **响应**:
  ```json
  {
    "id": "string",
    "username": "string",
    "credentials": [
      {
        "id": "string",
        "created_at": "timestamp"
      }
    ]
  }
  ```

#### 3.2 注销
- **URL**: `POST /auth/logout`
- **描述**: 注销当前用户
- **响应**:
  ```json
  {
    "success": true,
    "message": "注销成功"
  }
  ```

### 4. 错误响应

所有错误响应格式：
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

常见错误码：
- `INVALID_REQUEST`: 请求参数无效
- `USER_NOT_FOUND`: 用户不存在
- `INVALID_CREDENTIAL`: 凭证无效
- `CHALLENGE_EXPIRED`: 挑战已过期
- `AUTH_FAILED`: 认证失败

## 数据存储

系统使用文件存储，数据结构如下：

### 用户数据 (`data/users.json`)
```json
{
  "users": [
    {
      "id": "unique-id",
      "username": "string",
      "created_at": "timestamp"
    }
  ]
}
```

### 凭证数据 (`data/credentials.json`)
```json
{
  "credentials": [
    {
      "id": "credential-id",
      "user_id": "user-id",
      "public_key": "base64-string",
      "sign_count": 0,
      "created_at": "timestamp"
    }
  ]
}
```

### 挑战数据 (`data/challenges.json`)
```json
{
  "challenges": [
    {
      "challenge": "base64url-string",
      "username": "string",
      "type": "register|login",
      "created_at": "timestamp",
      "expires_at": "timestamp"
    }
  ]
}
```