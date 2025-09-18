# 🔧 配置说明文档

本文档说明如何配置Passkey演示应用以支持不同的网络访问模式，包括本地访问、局域网访问和自定义域名配置。

## 📋 配置概览

应用现在使用统一的配置系统，所有与网络、域名、IP相关的设置都集中在 `app/src/config/index.ts` 文件中管理。

## 🌐 网络访问配置

### 1. 本地访问（默认）
适用于单机开发和测试：
```bash
# 不需要额外配置，直接运行
cd app && npm run dev
cd ui && npm run dev

# 访问地址
前端: http://localhost:3000
后端: http://localhost:3001
```

### 2. 局域网访问（当前配置）
适用于在其他设备上访问，如手机、平板等：

**当前IP配置**: `192.168.203.123`

```bash
# 访问地址
前端: http://192.168.203.123:3000
后端: http://192.168.203.123:3001
```

### 3. 自定义IP配置

#### 方法一：环境变量配置（推荐）
创建 `.env` 文件：
```bash
# 复制示例配置文件
cp env.example .env

# 编辑 .env 文件，修改IP地址
HOST_IP=你的IP地址
HOSTNAME=你的IP地址
NEXT_PUBLIC_API_URL=http://你的IP地址:3001/api
```

#### 方法二：直接修改配置文件
编辑 `app/src/config/index.ts`：
```typescript
// 修改这一行
const getHostIP = (): string => {
  return process.env.HOST_IP || '你的IP地址';
};
```

编辑 `ui/src/lib/api.ts`：
```typescript
// 修改这一行
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://你的IP地址:3001/api';
```

## 🔧 配置文件详解

### 后端配置 (`app/src/config/index.ts`)

```typescript
export const config = {
  // 服务器配置
  server: {
    port: 3001,           // 后端端口
    host: '0.0.0.0',      // 监听所有网络接口
    hostname: 'IP地址',    // 外部访问地址
  },

  // WebAuthn 配置
  webauthn: {
    rpId: 'IP地址',        // 必须与前端访问域名匹配
    rpName: 'Passkey Demo',
    allowedOrigins: [      // 允许的前端访问地址
      'http://localhost:3000',
      'http://IP地址:3000'
    ],
    timeout: 60000,
  },

  // CORS 配置
  cors: {
    origins: [             // 跨域允许的来源
      'http://localhost:3000',
      'http://IP地址:3000'
    ],
    credentials: true
  }
}
```

### 前端配置 (`ui/src/lib/api.ts`)

```typescript
// API基础URL配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://IP地址:3001/api';
```

## 🚀 快速切换配置

### 获取当前IP地址
```bash
# macOS/Linux
ifconfig | grep -E "inet.*broadcast" | awk '{print $2}' | head -1

# Windows
ipconfig | findstr "IPv4"
```

### 快速配置脚本
创建 `scripts/set-ip.sh`：
```bash
#!/bin/bash
NEW_IP=$1

if [ -z "$NEW_IP" ]; then
    echo "用法: ./set-ip.sh <IP地址>"
    exit 1
fi

# 更新环境变量文件
cat > .env << EOF
HOST_IP=$NEW_IP
HOSTNAME=$NEW_IP
NEXT_PUBLIC_API_URL=http://$NEW_IP:3001/api
EOF

echo "✅ IP地址已更新为: $NEW_IP"
echo "请重启服务以应用更改"
```

使用方法：
```bash
chmod +x scripts/set-ip.sh
./scripts/set-ip.sh 192.168.1.100
```

## ⚠️ 重要注意事项

### WebAuthn域名限制
- **rpId必须匹配**：WebAuthn的`rpId`必须与用户访问的域名/IP完全匹配
- **HTTPS要求**：生产环境必须使用HTTPS（localhost除外）
- **跨域限制**：WebAuthn不支持跨域操作

### 网络安全
- 确保防火墙允许相应端口（3000, 3001）
- 局域网访问时注意网络安全
- 生产环境建议使用反向代理和HTTPS

### 浏览器兼容性
不同访问方式的浏览器支持：
- **localhost**: 所有现代浏览器支持
- **IP地址**: 需要HTTPS或特殊配置
- **域名**: 推荐方式，完整支持

## 🔄 配置变更流程

1. **修改配置文件**或设置环境变量
2. **重启后端服务**：`cd app && npm run dev`
3. **重启前端服务**：`cd ui && npm run dev`
4. **清理浏览器缓存**（如果需要）
5. **测试功能**：注册→登录→用户信息

## 🐛 常见问题排查

### 问题1：WebAuthn失败
- 检查rpId是否与访问地址匹配
- 确认allowedOrigins包含前端访问地址
- 验证CORS配置正确

### 问题2：API调用失败
- 确认NEXT_PUBLIC_API_URL配置正确
- 检查后端服务是否在正确的IP和端口运行
- 验证网络连通性

### 问题3：跨域错误
- 检查CORS配置是否包含前端地址
- 确认credentials设置正确
- 验证请求头配置

## 📞 技术支持

如果遇到配置问题：
1. 检查控制台错误信息
2. 验证网络连通性
3. 确认配置文件语法正确
4. 查看服务启动日志
