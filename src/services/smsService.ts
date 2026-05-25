import dotenv from 'dotenv';
dotenv.config();

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  try {
    // Remove country code for Fast2SMS (Indian numbers only)
    const cleanPhone = phone.replace(/[^0-9]/g, '').replace(/^91/, '').slice(-10);

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: message,
        language: 'english',
        flash: 0,
        numbers: cleanPhone,
      }),
    });

    const data = await response.json();
    console.log('Fast2SMS response:', data);
    return data.return === true;
  } catch (error) {
    console.error('Fast2SMS error:', error);
    return false;
  }
}

export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  try {
    // Fast2SMS WhatsApp API
    const cleanPhone = phone.replace(/[^0-9]/g, '').replace(/^91/, '').slice(-10);

    const response = await fetch('https://www.fast2sms.com/dev/bulk', {
      method: 'POST',
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: message,
        language: 'english',
        flash: 0,
        numbers: cleanPhone,
      }),
    });

    const data = await response.json();
    return data.return === true;
  } catch (error) {
    console.error('WhatsApp error:', error);
    return false;
  }
}
