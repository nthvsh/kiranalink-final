// OTP service - MSG91 integration

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOTP(mobile: string, otp: string): Promise<boolean> {
  // MSG91 API
  const authKey = process.env.MSG91_AUTH_KEY
  const templateId = process.env.MSG91_TEMPLATE_ID
  const senderId = process.env.MSG91_SENDER_ID || 'KIRALK'

  try {
    const response = await fetch('https://api.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': authKey || '',
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile: `91${mobile}`,
        authkey: authKey,
        otp: otp,
        sender: senderId,
      }),
    })

    const data = await response.json()
    console.log('MSG91 response:', data)
    return data.type === 'success'
  } catch (error) {
    console.error('OTP send error:', error)
    // In development, just log the OTP
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 DEV MODE — OTP for ${mobile}: ${otp}`)
      return true
    }
    return false
  }
}
