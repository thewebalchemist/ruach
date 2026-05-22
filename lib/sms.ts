// BongaSMS integration
// Env vars: BONGA_CLIENT_ID, BONGA_KEY, BONGA_SECRET, BONGA_SERVICE_ID

const SMS_URL   = 'http://167.172.14.50:4002/v1/send-sms';
const BULK_URL  = 'http://167.172.14.50:4002/v1/send-bulk-sms';

function buildParams(MSISDN: string, txtMessage: string): string {
  return new URLSearchParams({
    apiClientID: process.env.BONGA_CLIENT_ID ?? '',
    key:         process.env.BONGA_KEY        ?? '',
    secret:      process.env.BONGA_SECRET     ?? '',
    serviceID:   process.env.BONGA_SERVICE_ID ?? '1',
    txtMessage,
    MSISDN,
  }).toString();
}

function normaliseKenyanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')   && digits.length === 10) return '254' + digits.slice(1);
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('7')   && digits.length === 9)  return '254' + digits;
  return digits;
}

interface SMSResult {
  status: number;
  status_message: string;
  unique_id?: string;
  credits?: number;
}

/** Send a single SMS. Returns the BongaSMS response. Does not throw. */
export async function sendSMS(phone: string, message: string): Promise<SMSResult> {
  if (!process.env.BONGA_CLIENT_ID) {
    console.warn('[sms] BONGA_CLIENT_ID not set — SMS skipped');
    return { status: 0, status_message: 'SMS not configured' };
  }
  try {
    const res = await fetch(SMS_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    buildParams(normaliseKenyanPhone(phone), message),
    });
    const data = await res.json();
    if (data.status !== 222) {
      console.error('[sms] send failed:', data);
    }
    return data as SMSResult;
  } catch (err) {
    console.error('[sms] network error:', err);
    return { status: 0, status_message: 'Network error' };
  }
}

/** Send the same message to multiple phone numbers. */
export async function sendBulkSMS(phones: string[], message: string): Promise<void> {
  if (!process.env.BONGA_CLIENT_ID) {
    console.warn('[sms] BONGA_CLIENT_ID not set — bulk SMS skipped');
    return;
  }
  if (phones.length === 0) return;

  const normalised = phones.map(normaliseKenyanPhone).join(',');

  try {
    const res = await fetch(BULK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    buildParams(normalised, message),
    });
    const data = await res.json();
    if (data.status !== 222) {
      console.error('[sms] bulk send failed:', data);
    }
  } catch (err) {
    console.error('[sms] bulk network error:', err);
  }
}
