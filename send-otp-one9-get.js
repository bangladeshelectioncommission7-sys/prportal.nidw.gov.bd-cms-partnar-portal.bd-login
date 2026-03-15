export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const phone = (body?.phone || "").trim();
    const otp = String(body?.otp || "").trim();

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "phone বা otp পাওয়া যায়নি"
      });
    }

    const token = process.env.SMS_API_TOKEN;
    const from = process.env.SMS_FROM || "sms";
    const unicode = process.env.SMS_UNICODE || "1";

    if (!token) {
      return res.status(500).json({
        success: false,
        message: "SMS_API_TOKEN পাওয়া যায়নি"
      });
    }

    const message = `আপনার OTP কোড: ${otp}`;

    const url =
      `https://sms.one9.one/sms/api?action=send-sms` +
      `&api_key=${encodeURIComponent(token)}` +
      `&to=${encodeURIComponent(phone)}` +
      `&from=${encodeURIComponent(from)}` +
      `&sms=${encodeURIComponent(message)}` +
      `&unicode=${encodeURIComponent(unicode)}`;

    const response = await fetch(url, { method: "GET" });
    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: text || "OTP পাঠানো যায়নি"
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP পাঠানো হয়েছে",
      providerResponse: text
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
}
