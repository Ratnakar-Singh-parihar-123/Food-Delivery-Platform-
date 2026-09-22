import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID; // ✅ New env variable

if (!accountSid || !apiKeySid || !apiKeySecret || !verifyServiceSid) {
  throw new Error(
    "Missing Twilio env vars. Please set TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, and TWILIO_VERIFY_SERVICE_SID",
  );
}

if (!accountSid.startsWith("AC") || !apiKeySid.startsWith("SK")) {
  throw new Error("Invalid Twilio credentials");
}

const client = twilio(apiKeySid, apiKeySecret, { accountSid });

export const sendSmsOtp = async (phone, otp) => {
  try {
    // ✅ Using Verify Service – Twilio auto‑generates OTP, no custom body needed
    const verification = await client.verify
      .services(verifyServiceSid)
      .verifications.create({
        to: phone,
        channel: "sms",
      });

    console.log("✅ Verification sent:", verification.sid);
    return verification;
  } catch (error) {
    console.error("❌ Twilio Verify error:", error);
    throw new Error("Failed to send OTP via SMS");
  }
};

// ─── NEW: Verify the OTP entered by user ─────────────────
export const verifyOtp = async (phone, code) => {
  try {
    const verificationCheck = await client.verify
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: phone,
        code: code,
      });
    return verificationCheck.status === "approved";
  } catch (error) {
    console.error("❌ Twilio Verify check error:", error);
    return false;
  }
};
