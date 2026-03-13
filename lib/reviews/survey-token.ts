import { createHmac, timingSafeEqual } from 'crypto'

interface SurveyTokenPayload {
  orderId: string
  email: string
  exp: number
  v: 1
}

const DEFAULT_SURVEY_TTL_DAYS = 120

function getSurveySecret() {
  const secret = process.env.SATISFACTION_SURVEY_SECRET || process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!secret) {
    throw new Error('Survey token secret is not configured')
  }

  return secret
}

function encodePayload(payload: SurveyTokenPayload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function decodePayload(value: string) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf-8')) as SurveyTokenPayload
}

function signPayload(encodedPayload: string) {
  return createHmac('sha256', getSurveySecret())
    .update(encodedPayload)
    .digest('base64url')
}

export function createSurveyToken(orderId: string, email: string, ttlDays = DEFAULT_SURVEY_TTL_DAYS) {
  const payload: SurveyTokenPayload = {
    orderId,
    email: email.trim().toLowerCase(),
    exp: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
    v: 1,
  }

  const encodedPayload = encodePayload(payload)
  const signature = signPayload(encodedPayload)

  return `${encodedPayload}.${signature}`
}

export function verifySurveyToken(token: string) {
  try {
    const [encodedPayload, signature] = token.split('.')

    if (!encodedPayload || !signature) {
      return null
    }

    const expectedSignature = signPayload(encodedPayload)
    const provided = Buffer.from(signature)
    const expected = Buffer.from(expectedSignature)

    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
      return null
    }

    const payload = decodePayload(encodedPayload)

    if (!payload.orderId || !payload.email || payload.v !== 1) {
      return null
    }

    if (payload.exp < Date.now()) {
      return null
    }

    return payload
  } catch (error) {
    console.error('Error verifying survey token:', error)
    return null
  }
}

export function buildSurveyUrl(orderId: string, email: string) {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://niñamar.com'
  const token = createSurveyToken(orderId, email)

  return `${appUrl}/encuesta/${token}`
}