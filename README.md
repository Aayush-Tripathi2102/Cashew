# Cashew API Documentation

## Overview

Cashew is a decentralized payment gateway integration toolkit designed specifically for subscription management. Built on Ethereum blockchain technology, Cashew provides developers with a comprehensive set of FaaS (Functions as a Service) HTTP API endpoints to handle subscription-based payments in a fully decentralized manner.

### Key Features

- 🔗 **Fully Decentralized**: All data stored on Ethereum blockchain
- 💳 **Subscription Management**: Create and manage recurring payment plans
- 🔐 **Secure**: Blockchain-backed security and transparency
- 🚀 **Developer-Friendly**: RESTful API design with clear endpoints
- 💰 **Token Balance Management**: Real-time balance tracking
- 📊 **Transparent**: All transactions verifiable on-chain

## Getting Started

### Base URL
```
https://your-cashew-api-domain.com
```

### Authentication
*[Add your authentication method here - API keys, JWT, etc.]*

### Content Type
All API requests should include:
```
Content-Type: application/json
```

## API Endpoints

### 1. Create Subscription Plan

Create a new subscription plan that will be stored on the Ethereum blockchain.

**Endpoint:** `POST /api/v1/plans`

**Description:** Creates a new subscription plan with specified pricing, duration, and metadata. The plan details are stored on-chain for full transparency and immutability.

#### Request Body

```json
{
  "name": "Premium Plan",
  "description": "Access to premium features",
  "price": "10.5",
  "currency": "ETH",
  "interval": "monthly",
  "intervalCount": 1,
  "trialPeriodDays": 7,
  "maxSubscribers": 1000,
  "features": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "metadata": {
    "category": "premium",
    "tier": "gold"
  }
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Plan name (max 100 characters) |
| `description` | string | No | Plan description (max 500 characters) |
| `price` | string | Yes | Plan price in specified currency |
| `currency` | string | Yes | Currency code (ETH, USDC, etc.) |
| `interval` | string | Yes | Billing interval: `daily`, `weekly`, `monthly`, `yearly` |
| `intervalCount` | number | No | Number of intervals between charges (default: 1) |
| `trialPeriodDays` | number | No | Free trial period in days |
| `maxSubscribers` | number | No | Maximum number of subscribers allowed |
| `features` | array | No | List of plan features |
| `metadata` | object | No | Additional metadata |

#### Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "data": {
    "planId": "0x1234567890abcdef1234567890abcdef12345678",
    "name": "Premium Plan",
    "description": "Access to premium features",
    "price": "10.5",
    "currency": "ETH",
    "interval": "monthly",
    "intervalCount": 1,
    "trialPeriodDays": 7,
    "maxSubscribers": 1000,
    "currentSubscribers": 0,
    "features": [
      "Feature 1",
      "Feature 2",
      "Feature 3"
    ],
    "metadata": {
      "category": "premium",
      "tier": "gold"
    },
    "createdAt": "2025-01-15T10:30:00Z",
    "blockNumber": 18500123,
    "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "status": "active"
  }
}
```

#### Error Responses

**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Invalid plan parameters provided",
    "details": [
      "Price must be a positive number",
      "Interval must be one of: daily, weekly, monthly, yearly"
    ]
  }
}
```

---

### 2. View Subscription Plan

Retrieve details of a specific subscription plan from the blockchain.

**Endpoint:** `GET /api/v1/plans/:planId`

**Description:** Fetches comprehensive details of a subscription plan directly from the Ethereum blockchain using the plan ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `planId` | string | Yes | Ethereum address/hash of the plan |

#### Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "planId": "0x1234567890abcdef1234567890abcdef12345678",
    "name": "Premium Plan",
    "description": "Access to premium features",
    "price": "10.5",
    "currency": "ETH",
    "interval": "monthly",
    "intervalCount": 1,
    "trialPeriodDays": 7,
    "maxSubscribers": 1000,
    "currentSubscribers": 45,
    "features": [
      "Feature 1",
      "Feature 2",
      "Feature 3"
    ],
    "metadata": {
      "category": "premium",
      "tier": "gold"
    },
    "createdAt": "2025-01-15T10:30:00Z",
    "lastUpdated": "2025-01-15T10:30:00Z",
    "blockNumber": 18500123,
    "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "status": "active",
    "totalRevenue": "472.5",
    "isActive": true
  }
}
```

#### Error Responses

**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "error": {
    "code": "PLAN_NOT_FOUND",
    "message": "Subscription plan not found",
    "planId": "0x1234567890abcdef1234567890abcdef12345678"
  }
}
```

---

### 3. Enroll in Subscription Plan

Subscribe a user to a specific plan with payment processing on the blockchain.

**Endpoint:** `POST /api/v1/subscription/subscribe`

**Description:** Enrolls a user in a subscription plan. Creates a subscription record on-chain and processes the initial payment if no trial period is specified.

#### Request Body

```json
{
  "planId": "0x1234567890abcdef1234567890abcdef12345678",
  "userAddress": "0xabcdef1234567890abcdef1234567890abcdef12",
  "paymentMethod": {
    "type": "wallet",
    "address": "0xabcdef1234567890abcdef1234567890abcdef12"
  },
  "metadata": {
    "userId": "user123",
    "email": "user@example.com",
    "referralCode": "REF123"
  }
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `planId` | string | Yes | ID of the subscription plan |
| `userAddress` | string | Yes | Ethereum address of the subscriber |
| `paymentMethod` | object | Yes | Payment method details |
| `paymentMethod.type` | string | Yes | Payment type: `wallet`, `contract` |
| `paymentMethod.address` | string | Yes | Payment source address |
| `metadata` | object | No | Additional subscription metadata |

#### Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "data": {
    "subscriptionId": "0xdef1234567890abcdef1234567890abcdef123456",
    "planId": "0x1234567890abcdef1234567890abcdef12345678",
    "userAddress": "0xabcdef1234567890abcdef1234567890abcdef12",
    "status": "active",
    "startDate": "2025-01-15T11:00:00Z",
    "nextBillingDate": "2025-02-15T11:00:00Z",
    "trialEndsAt": "2025-01-22T11:00:00Z",
    "currentPeriodStart": "2025-01-15T11:00:00Z",
    "currentPeriodEnd": "2025-02-15T11:00:00Z",
    "paymentMethod": {
      "type": "wallet",
      "address": "0xabcdef1234567890abcdef1234567890abcdef12"
    },
    "transactionHash": "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
    "blockNumber": 18500456,
    "metadata": {
      "userId": "user123",
      "email": "user@example.com",
      "referralCode": "REF123"
    },
    "totalPaid": "0",
    "isInTrial": true
  }
}
```

#### Error Responses

**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "INVALID_SUBSCRIPTION_REQUEST",
    "message": "Cannot subscribe to this plan",
    "details": [
      "Plan has reached maximum subscriber limit",
      "User already has an active subscription to this plan"
    ]
  }
}
```

**Status Code:** `402 Payment Required**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance for subscription",
    "required": "10.5 ETH",
    "available": "8.2 ETH"
  }
}
```

---

### 4. View Token Balance

Check the current token balance of a wallet address.

**Endpoint:** `GET /api/v1/tokens/getBalance`

**Description:** Retrieves the current token balance for a specified wallet address directly from the Ethereum blockchain. Supports multiple token types.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | Yes | Ethereum wallet address |
| `tokenType` | string | No | Token type: `ETH`, `USDC`, `USDT`, etc. (default: `ETH`) |
| `includeHistory` | boolean | No | Include recent transaction history (default: `false`) |

#### Example Request

```
GET /api/v1/tokens/getBalance?address=0xabcdef1234567890abcdef1234567890abcdef12&tokenType=ETH&includeHistory=true
```

#### Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "address": "0xabcdef1234567890abcdef1234567890abcdef12",
    "tokenType": "ETH",
    "balance": "25.789234567890123456",
    "balanceFormatted": "25.79 ETH",
    "usdValue": "42,847.23",
    "lastUpdated": "2025-01-15T11:30:00Z",
    "blockNumber": 18500789,
    "pendingTransactions": 2,
    "recentTransactions": [
      {
        "hash": "0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff",
        "type": "subscription_payment",
        "amount": "-10.5",
        "timestamp": "2025-01-15T10:45:00Z",
        "planId": "0x1234567890abcdef1234567890abcdef12345678",
        "status": "confirmed"
      },
      {
        "hash": "0x0000ffffeeeedddcccbbbaaa99998888777766665555444433332222111100",
        "type": "deposit",
        "amount": "+50.0",
        "timestamp": "2025-01-14T15:20:00Z",
        "from": "0x9999888877776666555544443333222211110000",
        "status": "confirmed"
      }
    ]
  }
}
```

#### Error Responses

**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ADDRESS",
    "message": "Invalid Ethereum address format",
    "address": "invalid_address"
  }
}
```

**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "error": {
    "code": "ADDRESS_NOT_FOUND",
    "message": "Address not found on blockchain",
    "address": "0xabcdef1234567890abcdef1234567890abcdef12"
  }
}
```

---

## Error Handling

### Standard Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": ["Additional error details if applicable"],
    "timestamp": "2025-01-15T11:30:00Z",
    "requestId": "req_1234567890abcdef"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_PARAMETERS` | 400 | Request parameters are invalid |
| `AUTHENTICATION_FAILED` | 401 | Authentication credentials are invalid |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource doesn't exist |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `BLOCKCHAIN_ERROR` | 500 | Blockchain interaction failed |
| `NETWORK_CONGESTION` | 503 | Ethereum network congestion |

---

## Blockchain Integration Details

### Smart Contract Addresses

*[Add your deployed contract addresses]*

```
Subscription Manager Contract: 0x...
Payment Processor Contract: 0x...
Token Contract: 0x...
```

### Supported Networks

- **Mainnet**: Ethereum Mainnet
- **Testnet**: Sepolia, Goerli (for development)

### Gas Optimization

Cashew implements several gas optimization strategies:
- Batch operations where possible
- Efficient storage patterns
- Layer 2 scaling solutions support

### Transaction Confirmation

- **Fast**: 1-2 block confirmations (recommended for testing)
- **Standard**: 6-12 block confirmations (recommended for production)
- **Secure**: 20+ block confirmations (recommended for high-value transactions)

---

## Rate Limits

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `POST /api/v1/plans` | 10 requests | 1 minute |
| `GET /api/v1/plans/:planId` | 100 requests | 1 minute |
| `POST /api/v1/subscription/subscribe` | 5 requests | 1 minute |
| `GET /api/v1/tokens/getBalance` | 50 requests | 1 minute |

---

## SDK and Libraries

### JavaScript/TypeScript
```bash
npm install @cashew/sdk
```

### Python
```bash
pip install cashew-python
```

### Go
```bash
go get github.com/cashew/go-sdk
```

---

## Examples

### Creating and Using a Subscription Plan

```javascript
// 1. Create a plan
const plan = await cashew.createPlan({
  name: "Basic Plan",
  price: "5.0",
  currency: "ETH",
  interval: "monthly"
});

// 2. Subscribe a user
const subscription = await cashew.subscribe({
  planId: plan.planId,
  userAddress: "0x...",
  paymentMethod: {
    type: "wallet",
    address: "0x..."
  }
});

// 3. Check user's balance
const balance = await cashew.getBalance({
  address: "0x...",
  tokenType: "ETH"
});
```

---

## Webhooks

### Webhook Events

Cashew can notify your application about important events:

- `subscription.created`
- `subscription.payment.succeeded`
- `subscription.payment.failed`
- `subscription.cancelled`
- `plan.updated`

### Webhook Payload Example

```json
{
  "event": "subscription.payment.succeeded",
  "data": {
    "subscriptionId": "0x...",
    "planId": "0x...",
    "amount": "10.5",
    "currency": "ETH",
    "transactionHash": "0x...",
    "timestamp": "2025-01-15T11:30:00Z"
  },
  "webhookId": "wh_1234567890",
  "created": "2025-01-15T11:30:05Z"
}
```

---

## Support and Resources

### Documentation
- [Developer Guide](https://docs.cashew.dev)
- [API Reference](https://api.cashew.dev/docs)
- [Smart Contract Documentation](https://contracts.cashew.dev)

### Community
- [Discord Server](https://discord.gg/cashew)
- [GitHub Repository](https://github.com/cashew/api)
- [Developer Forum](https://forum.cashew.dev)

### Support
- Email: support@cashew.dev
- Developer Support: dev-support@cashew.dev

---

## Contributing

We welcome contributions to Cashew! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/cashew/api
cd cashew-api
npm install
npm run dev
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Last updated: January 2025*
