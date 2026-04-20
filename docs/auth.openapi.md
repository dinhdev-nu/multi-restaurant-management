# Auth Module OpenAPI Documentation

## 1. Data Lineage

### 1.1 Files traced
- Controller:
  - src/modules/auth/auth.controller.xxx.ts
- Service:
  - src/modules/auth/auth.service.xxx.ts
- Request DTO:
  - src/modules/auth/dto/auth.dto.ts
- Repository:
  - src/modules/auth/repositories/user.repository.ts
  - src/modules/auth/repositories/session.repository.ts
  - src/modules/auth/repositories/oauth-provider.repository.ts
- Schema:
  - src/modules/auth/schema/user.xxx.schema.ts
  - src/modules/auth/schema/user_session.xxx.schema.ts
  - src/modules/auth/schema/oauth_provider.xxx.schema.ts
- Response envelope helper:
  - src/common/interceptors/transform-response.interceptor.ts
  - src/common/swagger/api-response.util.ts

### 1.2 Endpoint lineage map

| Endpoint | Controller method | Service method | Repository touchpoint | Schema read/write |
|---|---|---|---|---|
| POST /auths/check-email | checkEmailExist | checkEmailExist | userRepository.findUserExistByEmail | read users |
| POST /auths/register | register | register | userRepository.create, userRepository.findUserExistByPhone | write users + redis otp |
| POST /auths/verify-otp | verifyOTP | verifyOTP | userRepository.getUserPendingDocumentByEmail | read/write users + redis otp |
| POST /auths/resend-otp | resendOTP | resendOTP | userRepository.findUserPendingByEmail | read users + redis otp |
| POST /auths/login | login | login | userRepository.findUserExistByEmail/Phone, sessionRepository.create, userRepository.update | read/write users, user_sessions, redis session |
| POST /auths/2fa/send-otp | send2FAOTP | send2FAEmailOTP | none (redis + queue) | redis temp and otp |
| POST /auths/2fa/verify-otp | verify2FAOTP | verify2FAOTP | userRepository.findUserExistById, sessionRepository.create, userRepository.update | read/write users + user_sessions + redis |
| POST /auths/refresh-token | refreshToken | refreshToken | sessionRepository.findSessionByTokenHash, updateSessionLogoutByTokenHash, create, userRepository.findById | read/write user_sessions + redis + users |
| POST /auths/logout | logout | logout | sessionRepository.updateSessionLogoutByTokenHash | write user_sessions + redis blacklist |
| POST /auths/logout-all | logoutAllSessions | logoutAllSessions | sessionRepository.findAllByUserId, updateSessionsLogoutByUserId | write user_sessions + redis blacklist |
| POST /auths/forgot-password | forgotPassword | forgotPassword | userRepository.findUserExistByEmail | read users + redis otp/session |
| POST /auths/reset-password/verify-otp | verifyForgotPasswordOTP | verifyForgotPasswordOTP | none | redis only |
| POST /auths/reset-password | resetPassword | resetPassword | userRepository.update, sessionRepository.findAllByUserId, updateSessionsLogoutByUserId | write users + revoke sessions |
| POST /auths/change-password | changePassword | changePassword | userRepository.findById/update, sessionRepository.findSessionsExcludingTokenHash, UpdateSessionsExcludingTokenHash | write users + selective session revoke |
| POST /auths/2fa/enable | enable2FA | enable2FA | userRepository.findUserExistById, userRepository.update | write users.two_factor_enabled |
| POST /auths/2fa/disable | disable2FA | disable2FA | userRepository.findUserExistById, userRepository.update | write users.two_factor_enabled |
| GET /auths/sessions | getSessions | getSessions | sessionRepository.findAllByUserId | read user_sessions |
| DELETE /auths/sessions | revokeSession | revokeSession | sessionRepository.findOne, updateSessionLogoutByTokenHash | write user_sessions + redis |
| POST /auths/phone/send-otp | sendPhoneOTP | sendPhoneOTP | userRepository.findUserExistByPhone | read users + redis otp |
| POST /auths/phone/verify-otp | verifyPhoneOTP | verifyPhoneOTP | userRepository.update | write users.phone and users.phone_verified_at |
| GET /auths/oauth/{provider} | oauthLogin | oauthInit | none | redis oauth state |
| GET /auths/{provider}/callback | oauthCallback | oauthCallback | providerRepository.findByProviderAndProviderId, userRepository.findUserExistById/Email, userRepository.create/update, providerRepository.create, sessionRepository.create | read/write oauth_providers, users, user_sessions |

### 1.3 Standard response envelope
All endpoints (except raw redirect responses using @Res()) are wrapped by TransformResponseInterceptor:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request was successful",
  "data": {},
  "correlationId": "string",
  "timestamp": "2026-04-17T08:00:00.000Z"
}
```

Notes:
- If controller/service returns an object containing message, top-level message uses that value.
- Endpoints using @Res() for redirect return HTTP 302 and do not return standard JSON body.

### 1.4 Persistence field inventory

#### User schema fields
- email, phone, password_hash, full_name, avatar_url
- date_of_birth, gender
- system_role, status
- email_verified_at, phone_verified_at
- last_login_at, last_login_ip
- two_factor_enabled
- preferences.language, preferences.theme, preferences.notifications.email/sms/push
- deleted_at, created_at, updated_at

#### UserSession schema fields
- user_id, token_hash
- device_info.browser/os/device/user_agent
- ip_address
- expires_at, is_revoked, remember_me
- created_at

#### OAuthProvider schema fields
- user_id
- provider
- provider_user_id
- created_at

### 1.5 Zero-omission mapping (schema to response)

#### A. User schema to auth responses
| User field | Exposed response endpoint(s) | Omit reason if not exposed |
|---|---|---|
| email | indirectly via process only (not explicit in auth response data) | privacy, minimized auth payload |
| phone | not directly in auth response | privacy |
| password_hash | never | sensitive |
| full_name, avatar_url | not in auth response payload | not required for auth handshake |
| system_role | encoded in JWT, not plain response | token-based contract |
| status | not directly exposed; used for guard/exception branch | policy only |
| email_verified_at, phone_verified_at | not directly exposed | policy only |
| last_login_at, last_login_ip | not directly exposed | internal audit |
| two_factor_enabled | affects login branch response (2fa_required) | behavior signal only |
| preferences | not in auth endpoint data | user profile domain |
| created_at, updated_at, deleted_at | not in auth response data | internal metadata |

#### B. UserSession schema to auth responses
| Session field | Exposed response endpoint(s) | Notes |
|---|---|---|
| _id | GET /auths/sessions as session_id | mapped name session_id |
| user_id | not exposed | inferred from current user |
| token_hash | never | sensitive |
| device_info.* | GET /auths/sessions | full nested object nullable |
| ip_address | GET /auths/sessions | nullable |
| expires_at | GET /auths/sessions | direct mapping |
| is_revoked | not exposed directly | reflected by active session filtering |
| remember_me | not exposed directly | used by refresh rotation/cookie TTL |
| created_at | GET /auths/sessions | direct mapping |

#### C. OAuthProvider schema to auth responses
| OAuthProvider field | Exposed response endpoint(s) | Omit reason |
|---|---|---|
| provider, provider_user_id, user_id | not returned in auth response body | internal linkage metadata |
| created_at | not returned | internal metadata |

---

## 2. API Specifications

### 2.1 DTO request catalog

#### CheckEmailDTO
| Field | Type | Required | Validation |
|---|---|---|---|
| email | string | yes | IsEmail |

#### RegisterDTO
| Field | Type | Required | Validation |
|---|---|---|---|
| email | string | yes | IsEmail |
| password | string | yes | IsString, Length(6,32) |
| full_name | string | yes | IsString, Length(5,100) |
| phone | string | no | IsPhoneNumber(VN) |

#### VerifyOTPDTO
| Field | Type | Required | Validation |
|---|---|---|---|
| email | string | yes | IsEmail |
| otp | string | yes | Length(OTP_LENGTH, OTP_LENGTH) |

#### ResendOTPDTO
- Same as CheckEmailDTO

#### LoginDTO
| Field | Type | Required | Validation |
|---|---|---|---|
| identifier | string | yes | IsEmailOrPhone |
| password | string | yes | IsString, Length(6,32) |
| remember_me | boolean | yes | IsBoolean |

Hidden internal fields (not client input): identifier_type, device_info, user_ip.

#### Send2FAOtpDTO
| Field | Type | Required | Validation |
|---|---|---|---|
| temp_token | string | yes | IsString |

#### Verify2FAOTPDTO
| Field | Type | Required | Validation |
|---|---|---|---|
| temp_token | string | yes | IsString |
| otp | string | yes | Length(OTP_LENGTH, OTP_LENGTH) |

#### ForgotPasswordDTO
- Same as CheckEmailDTO

#### VerifyForgotPasswordOTPDTO
| Field | Type | Required | Validation |
|---|---|---|---|
| session_token | string | yes | IsString |
| otp | string | yes | Length(OTP_LENGTH, OTP_LENGTH) |

#### ResetPasswordDTO
| Field | Type | Required | Validation |
|---|---|---|---|
| grant_token | string | yes | IsString |
| new_password | string | yes | IsString, Length(6,32) |

#### ChangePasswordDTO
| Field | Type | Required | Validation |
|---|---|---|---|
| current_password | string | yes | IsString, Length(6,32) |
| new_password | string | yes | IsString, Length(6,32) |

#### Enable2FADTO / Disable2FADTO
| Field | Type | Required | Validation |
|---|---|---|---|
| password | string | yes | IsString, Length(6,32) |

#### RevokeSessionDTO
| Field | Type | Required | Validation |
|---|---|---|---|
| session_id | string (ObjectId) | yes | IsMongoId |

#### SendPhoneOTPDTO
| Field | Type | Required | Validation |
|---|---|---|---|
| phone | string | yes | IsPhoneNumber(VN) |

#### VerifyPhoneOTPDTO
Current class extends Verify2FAOTPDTO.
| Field | Type | Required | Validation |
|---|---|---|---|
| temp_token | string | yes (DTO level) | IsString |
| otp | string | yes | Length(OTP_LENGTH, OTP_LENGTH) |

Runtime note: service verifyPhoneOTP currently only uses otp.

---

### 2.2 POST /auths/check-email
#### Purpose
Check email availability before registration.

#### Request
- Public endpoint.
- Body: CheckEmailDTO.

#### Response
- HTTP 200.
- data shape:
  - available: boolean
  - acction?: string
  - hint?: string

#### Errors
- 400 invalid body.
- 409 email already exists and not pending.
- 429 rate limit.
- 500 internal error.

---

### 2.3 POST /auths/register
#### Purpose
Create pending account and send email OTP.

#### Request
- Public endpoint.
- Rate limit: 5 req / hour.
- Body: RegisterDTO.

#### Response
- HTTP 201.
- data shape:
  - message: string
  - acction?: string
  - hint?: string

#### Errors
- 400 validation error.
- 409 email/phone conflict.
- 429 rate limit.
- 500 internal error.

---

### 2.4 POST /auths/verify-otp
#### Purpose
Verify registration OTP and activate account.

#### Request
- Public endpoint.
- Body: VerifyOTPDTO.

#### Response
- HTTP 200.
- data: { verified: true }

#### Errors
- 400 invalid otp.
- 404 pending user or otp not found.
- 429 otp attempts exceeded.
- 500 internal error.

---

### 2.5 POST /auths/resend-otp
#### Purpose
Resend registration OTP to pending user.

#### Request
- Public endpoint.
- Body: ResendOTPDTO.

#### Response
- HTTP 200.
- data: { message: "Sent" }

#### Errors
- 400 validation error.
- 404 pending user not found.
- 429 too many resend attempts.
- 500 internal error.

---

### 2.6 POST /auths/login
#### Purpose
Authenticate by email/phone + password.

#### Request
- Public endpoint.
- Rate limit: 10 req / 5 minutes.
- Body: LoginDTO.

#### Response
- HTTP 200, one of:
  - data: { access_token: string } and cookie refresh_token set.
  - data: { state: "2fa_required", temp_token: string, method: "email" }.

#### Errors
- 400 validation error.
- 401 invalid credentials.
- 403 pending/inactive/banned/user not eligible.
- 404 user not found.
- 429 login rate limit or fail-limit lock.
- 500 internal error.

---

### 2.7 POST /auths/2fa/send-otp
#### Purpose
Send OTP for pending 2FA login flow.

#### Request
- Public endpoint.
- Body: Send2FAOtpDTO.
- Uses request IP consistency check.

#### Response
- HTTP 200.
- data:
  - message: string
  - expires_in: number

#### Errors
- 400 invalid/expired temp_token or IP mismatch.
- 429 too many send attempts.
- 500 internal error.

---

### 2.8 POST /auths/2fa/verify-otp
#### Purpose
Verify 2FA OTP and finalize login.

#### Request
- Public endpoint.
- Body: Verify2FAOTPDTO.
- Uses request IP consistency check.

#### Response
- HTTP 200.
- data: { access_token: string }
- refresh_token cookie set.

#### Errors
- 400 invalid/expired temp_token or otp.
- 404 user not found.
- 429 too many invalid otp attempts.
- 500 internal error.

---

### 2.9 POST /auths/refresh-token
#### Purpose
Issue new access token from refresh token cookie.

#### Request
- Public endpoint.
- Cookie required: refresh_token.

#### Response
- HTTP 200.
- data: { access_token: string }
- cookie may rotate if nearing expiry threshold.

#### Errors
- 401 missing/invalid/expired refresh token or invalid session.
- 403 user inactive/banned.
- 500 internal error.

---

### 2.10 POST /auths/logout
#### Purpose
Revoke current session.

#### Request
- Requires bearer auth.
- Cookie required: refresh_token.

#### Response
- HTTP 200.
- data: { logged_out: boolean }
- refresh_token cookie cleared.

#### Errors
- 401 unauthorized.
- 500 internal error.

---

### 2.11 POST /auths/logout-all
#### Purpose
Revoke all sessions for current user.

#### Request
- Requires bearer auth.
- Cookie required: refresh_token.

#### Response
- HTTP 200.
- data: { logged_out_count: number }
- refresh_token cookie cleared.

#### Errors
- 401 unauthorized.
- 500 internal error.

---

### 2.12 POST /auths/forgot-password
#### Purpose
Start password reset flow by sending OTP.

#### Request
- Public endpoint.
- Rate limit: 5 req / hour.
- Body: ForgotPasswordDTO.

#### Response
- HTTP 200.
- data:
  - message: string
  - session_token: string

#### Errors
- 400 validation error.
- 404 email not found or user banned (current runtime behavior).
- 429 rate limit.
- 500 internal error.

---

### 2.13 POST /auths/reset-password/verify-otp
#### Purpose
Verify forgot-password OTP and issue one-time reset grant token.

#### Request
- Public endpoint.
- Body: VerifyForgotPasswordOTPDTO.

#### Response
- HTTP 200.
- data:
  - verified: boolean
  - reset_grant_token: string

#### Errors
- 400 invalid session_token or otp.
- 404 otp not found/expired.
- 429 otp attempts exceeded.
- 500 internal error.

---

### 2.14 POST /auths/reset-password
#### Purpose
Set new password using reset grant token.

#### Request
- Public endpoint.
- Body: ResetPasswordDTO.

#### Response
- HTTP 200.
- data: { reset: true }

#### Errors
- 400 invalid/expired grant token or body validation error.
- 500 internal error.

---

### 2.15 POST /auths/change-password
#### Purpose
Change password for authenticated user and revoke other sessions.

#### Request
- Requires bearer auth.
- Cookie required: refresh_token.
- Body: ChangePasswordDTO.

#### Response
- HTTP 200.
- data: { changed: true }

#### Errors
- 400 validation error.
- 401 current password invalid.
- 404 user not found.
- 429 rate limit.
- 500 internal error.

---

### 2.16 POST /auths/2fa/enable
#### Purpose
Enable 2FA for authenticated user.

#### Request
- Requires bearer auth.
- Body: Enable2FADTO.

#### Response
- HTTP 200.
- data: { enabled: true }

#### Errors
- 400 password not set or email not verified.
- 401 password invalid.
- 404 user not found.
- 500 internal error.

---

### 2.17 POST /auths/2fa/disable
#### Purpose
Disable 2FA for authenticated user.

#### Request
- Requires bearer auth.
- Body: Disable2FADTO.

#### Response
- HTTP 200.
- data: { disabled: true }

#### Errors
- 401 password invalid.
- 404 user not found.
- 500 internal error.

---

### 2.18 GET /auths/sessions
#### Purpose
List active sessions of current user.

#### Request
- Requires bearer auth.
- Cookie required: refresh_token (for current-session marker hash compare).

#### Response
- HTTP 200.
- data:
  - sessions: array of
    - session_id: string
    - device_info: { browser, os, device, user_agent } | null
    - ip_address: string | null
    - created_at: string(date-time)
    - expires_at: string(date-time)
    - is_current: boolean

#### Errors
- 401 unauthorized.
- 500 internal error.

---

### 2.19 DELETE /auths/sessions
#### Purpose
Revoke one specific session.

#### Request
- Requires bearer auth.
- Cookie required: refresh_token.
- Body: RevokeSessionDTO.

#### Response
- HTTP 200.
- data: { revoked: true }
- If target is current session, refresh_token cookie is cleared.

#### Errors
- 400 validation error.
- 401 unauthorized.
- 404 session not found.
- 500 internal error.

---

### 2.20 POST /auths/phone/send-otp
#### Purpose
Send OTP to verify and bind phone number.

#### Request
- Requires bearer auth.
- Body: SendPhoneOTPDTO.

#### Response
- HTTP 200.
- data:
  - message: string
  - expires_in: number

#### Errors
- 400 invalid phone format.
- 409 phone already in use.
- 429 sms rate limit.
- 500 internal error.

---

### 2.21 POST /auths/phone/verify-otp
#### Purpose
Verify phone OTP and update user phone_verified_at.

#### Request
- Requires bearer auth.
- Body: VerifyPhoneOTPDTO.

#### Response
- HTTP 200.
- data: { verified: true }

#### Errors
- 400 invalid/expired otp.
- 429 otp attempts exceeded.
- 500 internal error.

---

### 2.22 GET /auths/oauth/{provider}
#### Purpose
Initialize OAuth login flow and redirect to provider auth page.

#### Request
- Public endpoint.
- Path param:
  - provider: string, currently supported: google.

#### Response
- HTTP 302 redirect.

#### Errors
- 400 invalid provider.
- 500 internal error.

---

### 2.23 GET /auths/{provider}/callback
#### Purpose
Handle OAuth callback, create/login/link account, set refresh cookie, then redirect to client callback URL.

#### Request
- Public endpoint.
- Path param:
  - provider: string, currently supported: google.
- Query:
  - code: string
  - state: string

#### Response
- HTTP 302 redirect to client URL:
  - {clientUrl}/oauth/callback?access_token={token}
- Cookie set:
  - refresh_token (httpOnly, secure, sameSite=none)

#### Errors
- 400 invalid state/provider/code exchange failure.
- 403 user blocked/invalid.
- 500 internal error.

---

## 3. Runtime Contract Notes
- Route prefix is /auths (not /auth).
- Cookie key for refresh flow is refresh_token.
- Response field acction is intentionally spelled as in current service contract.
- Login and refresh are mixed token+cookie flows:
  - access_token in response data.
  - refresh_token in httpOnly cookie.
- Redirect endpoints (/oauth/:provider and /:provider/callback) are HTTP 302 and not JSON envelope responses.
