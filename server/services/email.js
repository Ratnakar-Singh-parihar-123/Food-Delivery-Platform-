export const sendEmailOtp = async ({ email, otp, purpose }) => {
  /*
      Development:

      Later Nodemailer / Resend /
      SES connect karna.
    */

  console.log("================================");

  console.log(`EMAIL: ${email}`);

  console.log(`PURPOSE: ${purpose}`);

  console.log(`OTP: ${otp}`);

  console.log("================================");

  return true;
};
