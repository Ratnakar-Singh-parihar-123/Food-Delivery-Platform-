import nodemailer from "nodemailer";

/* =====================================================
   EMAIL TRANSPORTER
===================================================== */

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL } =
    process.env;

  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASSWORD ||
    !SMTP_FROM_EMAIL
  ) {
    throw new Error(
      "SMTP configuration is incomplete. Check environment variables.",
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,

    port: Number(SMTP_PORT),

    secure: Number(SMTP_PORT) === 465,

    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },

    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  });
};

/* =====================================================
   VERIFY SMTP CONNECTION
===================================================== */

export const verifyEmailConnection = async () => {
  try {
    const transporter = createTransporter();

    await transporter.verify();

    console.log("Email service connected successfully");

    return true;
  } catch (error) {
    console.error("EMAIL SERVICE CONNECTION ERROR:", error.message);

    return false;
  }
};

/* =====================================================
   GENERIC SEND EMAIL
===================================================== */

export const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  if (!to) {
    throw new Error("Recipient email is required");
  }

  if (!subject) {
    throw new Error("Email subject is required");
  }

  if (!html && !text) {
    throw new Error("Email content is required");
  }

  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: {
      name: process.env.SMTP_FROM_NAME || "Food Delivery Platform",

      address: process.env.SMTP_FROM_EMAIL,
    },

    to,
    subject,
    html,
    text,

    ...(replyTo
      ? {
          replyTo,
        }
      : {}),
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  };
};

/* =====================================================
   EMAIL OTP
===================================================== */

export const sendEmailOtp = async ({
  email,
  otp,
  purpose = "email_verification",
  name = "",
}) => {
  if (!email || !otp) {
    throw new Error("Email and OTP are required");
  }

  const details = getOtpEmailDetails(purpose);

  const displayName = name?.trim() || "there";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>${details.title}</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
          font-family: Arial, Helvetica, sans-serif;
          color: #111827;
        "
      >
        <table
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="background-color: #f8fafc; padding: 32px 12px;"
        >
          <tr>
            <td align="center">
              <table
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  max-width: 560px;
                  background-color: #ffffff;
                  border-radius: 20px;
                  overflow: hidden;
                  border: 1px solid #f1f5f9;
                "
              >
                <tr>
                  <td
                    style="
                      padding: 28px;
                      background: linear-gradient(
                        135deg,
                        #f97316,
                        #ef4444
                      );
                      color: #ffffff;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        font-size: 12px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        opacity: 0.9;
                      "
                    >
                      Food Delivery Platform
                    </p>

                    <h1
                      style="
                        margin: 12px 0 0;
                        font-size: 26px;
                        line-height: 1.3;
                      "
                    >
                      ${details.title}
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 32px 28px;">
                    <p
                      style="
                        margin: 0;
                        font-size: 16px;
                        line-height: 1.7;
                      "
                    >
                      Hello ${displayName},
                    </p>

                    <p
                      style="
                        margin: 14px 0 0;
                        color: #64748b;
                        font-size: 14px;
                        line-height: 1.7;
                      "
                    >
                      ${details.description}
                    </p>

                    <div
                      style="
                        margin: 28px 0;
                        padding: 22px;
                        text-align: center;
                        border-radius: 16px;
                        background-color: #fff7ed;
                        border: 1px dashed #fb923c;
                      "
                    >
                      <p
                        style="
                          margin: 0;
                          color: #9a3412;
                          font-size: 11px;
                          font-weight: 700;
                          text-transform: uppercase;
                          letter-spacing: 1.4px;
                        "
                      >
                        Your verification code
                      </p>

                      <p
                        style="
                          margin: 10px 0 0;
                          color: #ea580c;
                          font-size: 36px;
                          line-height: 1;
                          font-weight: 800;
                          letter-spacing: 8px;
                        "
                      >
                        ${otp}
                      </p>
                    </div>

                    <p
                      style="
                        margin: 0;
                        color: #64748b;
                        font-size: 13px;
                        line-height: 1.7;
                      "
                    >
                      This OTP will expire in
                      <strong>10 minutes</strong>.
                      Do not share this code with anyone.
                    </p>

                    <p
                      style="
                        margin: 18px 0 0;
                        color: #94a3b8;
                        font-size: 12px;
                        line-height: 1.7;
                      "
                    >
                      If you did not request this email,
                      you can safely ignore it.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 18px 28px;
                      background-color: #f8fafc;
                      border-top: 1px solid #f1f5f9;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        text-align: center;
                        color: #94a3b8;
                        font-size: 11px;
                      "
                    >
                      © ${new Date().getFullYear()}
                      ${process.env.SMTP_FROM_NAME || "Food Delivery Platform"}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
Hello ${displayName},

${details.description}

Your OTP is: ${otp}

This OTP will expire in 10 minutes.
Do not share this OTP with anyone.

If you did not request this email, ignore it.
  `.trim();

  return sendEmail({
    to: email,
    subject: details.subject,
    html,
    text,
  });
};

/* =====================================================
   OTP EMAIL DETAILS
===================================================== */

const getOtpEmailDetails = (purpose) => {
  const purposes = {
    rider_email_verification: {
      subject: "Verify your rider account",

      title: "Verify your Rider Account",

      description:
        "Use the verification code below to verify your rider email address. After verification, your application will be sent for admin approval.",
    },

    rider_password_reset: {
      subject: "Reset your rider account password",

      title: "Reset Rider Password",

      description:
        "Use the verification code below to continue resetting your rider account password.",
    },

    vendor_email_verification: {
      subject: "Verify your vendor account",

      title: "Verify your Vendor Account",

      description:
        "Use the verification code below to verify your vendor account email address.",
    },

    vendor_password_reset: {
      subject: "Reset your vendor password",

      title: "Reset Vendor Password",

      description:
        "Use the verification code below to continue resetting your vendor account password.",
    },

    customer_email_verification: {
      subject: "Verify your customer account",

      title: "Verify your Account",

      description:
        "Use the verification code below to verify your account email address.",
    },

    customer_password_reset: {
      subject: "Reset your account password",

      title: "Reset Your Password",

      description:
        "Use the verification code below to continue resetting your account password.",
    },

    admin_email_verification: {
      subject: "Verify your admin account",

      title: "Verify Admin Account",

      description:
        "Use the verification code below to verify your admin email address.",
    },

    admin_password_reset: {
      subject: "Reset your admin password",

      title: "Reset Admin Password",

      description:
        "Use the verification code below to continue resetting your admin password.",
    },
  };

  return (
    purposes[purpose] || {
      subject: "Your verification code",
      title: "Email Verification",
      description: "Use the verification code below to complete your request.",
    }
  );
};

/* =====================================================
   ACCOUNT APPROVED EMAIL
===================================================== */

export const sendRiderApprovedEmail = async ({ email, name }) => {
  const displayName = name?.trim() || "Rider";

  return sendEmail({
    to: email,

    subject: "Your rider account has been approved",

    text: `
Hello ${displayName},

Your rider account has been approved successfully.

You can now log in, go online and start accepting delivery orders.

Thank you.
    `.trim(),

    html: `
      <div
        style="
          max-width: 560px;
          margin: 30px auto;
          padding: 30px;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          font-family: Arial, sans-serif;
        "
      >
        <h1 style="color: #16a34a;">
          Account Approved
        </h1>

        <p>Hello ${displayName},</p>

        <p
          style="
            color: #64748b;
            line-height: 1.7;
          "
        >
          Your rider account has been approved
          successfully.
        </p>

        <p
          style="
            color: #64748b;
            line-height: 1.7;
          "
        >
          You can now log in, go online and start
          accepting delivery orders.
        </p>
      </div>
    `,
  });
};

/* =====================================================
   ACCOUNT REJECTED EMAIL
===================================================== */

export const sendRiderRejectedEmail = async ({ email, name, reason }) => {
  const displayName = name?.trim() || "Rider";

  return sendEmail({
    to: email,

    subject: "Update regarding your rider application",

    text: `
Hello ${displayName},

Your rider application could not be approved.

Reason:
${reason}

Please update or resubmit the required information.
    `.trim(),

    html: `
      <div
        style="
          max-width: 560px;
          margin: 30px auto;
          padding: 30px;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          font-family: Arial, sans-serif;
        "
      >
        <h1 style="color: #dc2626;">
          Application Update
        </h1>

        <p>Hello ${displayName},</p>

        <p
          style="
            color: #64748b;
            line-height: 1.7;
          "
        >
          Your rider application could not be
          approved.
        </p>

        <div
          style="
            margin-top: 18px;
            padding: 16px;
            border-radius: 12px;
            background-color: #fef2f2;
            color: #991b1b;
          "
        >
          <strong>Reason:</strong>

          <p style="margin: 8px 0 0;">
            ${reason}
          </p>
        </div>
      </div>
    `,
  });
};
