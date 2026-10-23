const twilio = require('twilio');

let client = null;

const getClient = () => {
  if (!client) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
      console.warn('⚠️ Twilio credentials missing – messaging will be mocked');
      return null;
    }
    client = twilio(sid, token);
  }
  return client;
};

/**
 * Send SMS
 */
const sendSMS = async (to, body) => {
  const twilioClient = getClient();
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioClient || !from) {
    console.log(`[MOCK SMS] To: ${to} | Body: ${body.substring(0, 80)}...`);
    return { sid: `MOCK_${Date.now()}`, status: 'sent', mock: true };
  }

  // Normalize Nigerian numbers
  let normalized = to.replace(/\s+/g, '');
  if (normalized.startsWith('0')) {
    normalized = '+234' + normalized.slice(1);
  } else if (!normalized.startsWith('+')) {
    normalized = '+234' + normalized;
  }

  const message = await twilioClient.messages.create({
    body,
    from,
    to: normalized,
  });

  return { sid: message.sid, status: message.status };
};

/**
 * Send WhatsApp message
 */
const sendWhatsApp = async (to, body) => {
  const twilioClient = getClient();
  const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  if (!twilioClient) {
    console.log(`[MOCK WhatsApp] To: ${to} | Body: ${body.substring(0, 80)}...`);
    return { sid: `MOCK_WA_${Date.now()}`, status: 'sent', mock: true };
  }

  let normalized = to.replace(/\s+/g, '');
  if (normalized.startsWith('0')) {
    normalized = '+234' + normalized.slice(1);
  } else if (!normalized.startsWith('+')) {
    normalized = '+234' + normalized;
  }
  if (!normalized.startsWith('whatsapp:')) {
    normalized = `whatsapp:${normalized}`;
  }

  const message = await twilioClient.messages.create({
    body,
    from,
    to: normalized,
  });

  return { sid: message.sid, status: message.status };
};

/**
 * Send to multiple recipients with channel preference
 */
const sendBulk = async (recipients, body, channel = 'sms') => {
  const results = [];

  for (const phone of recipients) {
    try {
      let result;
      if (channel === 'whatsapp' || channel === 'both') {
        result = await sendWhatsApp(phone, body);
      } else {
        result = await sendSMS(phone, body);
      }
      results.push({ phone, ...result, success: true });
    } catch (error) {
      results.push({ phone, success: false, error: error.message });
    }
  }

  return results;
};

module.exports = {
  sendSMS,
  sendWhatsApp,
  sendBulk,
};
