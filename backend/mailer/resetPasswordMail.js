const transporter = require("./mailSend.js");

const resetMailOptions = async (email, resetURL) => {
 const mailOptions = {
   from: `"Court Booking System" <dbmsproject09@gmail.com>`, // Sender address with a friendly name
   to: email, // Recipient's email address
   subject: "Password Reset Request",
   html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Password Reset Request</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f4;">
      <table role="presentation" style="width:100%; border-collapse:collapse; background-color:#f4f4f4;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table role="presentation" style="width:600px; border-collapse:collapse; background-color:#ffffff; border-radius:5px; overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="padding: 20px; text-align:center; background-color:#4267B2;">
                  <h1 style="color:#ffffff; margin:0;">Court Booking System</h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 30px;">
                  <h2 style="color:#333333;">Password Reset Request</h2>
                  <p style="color:#555555;">Hello,</p>
                  <p style="color:#555555;">We received a request to reset your password for your Court Booking System account. Click the link below to set a new password:</p>
                  <p style="text-align:center;">
                    <a href="${resetURL}" style="display:inline-block; padding: 10px 20px; color:#ffffff; background-color:#4267B2; text-decoration:none; border-radius:5px;">Reset Password</a>
                  </p>
                  <p style="color:#555555;">This link will expire in <strong>1 hour</strong>.</p>
                  <p style="color:#555555;">If you did not request a password reset, please ignore this email or contact support.</p>
                  <p style="color:#555555;">Best regards,<br/>Court Booking Team</p>
                </td>
              </tr>
              <!-- Footer -->
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

  // Send email
  await transporter.sendMail(mailOptions);
};

module.exports = resetMailOptions;
