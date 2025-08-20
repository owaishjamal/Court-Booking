
const transporter = require("./mailSend.js");
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: "dbmsproject09@gmail.com",
    to: email,
    subject: "Your OTP for Registration",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>OTP Verification</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f4;">
        <table role="presentation" style="width:100%; border-collapse:collapse; background-color:#f4f4f4;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table role="presentation" style="width:600px; border-collapse:collapse; background-color:#ffffff; border-radius:5px; overflow:hidden;">
                <tr>
                  <td style="padding: 20px; text-align:center; background-color:#4267B2;">
                    <h1 style="color:#ffffff; margin:0;">Court Booking System</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="color:#333333;">OTP Verification</h2>
                    <p style="color:#555555;">Hello,</p>
                    <p style="color:#555555;">Thank you for registering with our Court Booking System. Please use the following OTP to verify your email address:</p>
                    <h3 style="color:#333333;">${otp}</h3>
                    <p style="color:#555555;">This OTP is valid for <strong>5 minutes</strong>.</p>
                    <p style="color:#555555;">If you did not request this, please ignore this email.</p>
                    <p style="color:#555555;">Best regards,<br/>Court Booking Team</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; text-align:center; background-color:#f4f4f4;">
                    <p style="color:#999999; font-size:12px; margin:0;">© ${new Date().getFullYear()} Court Booking System. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
module.exports = sendOtpEmail;
