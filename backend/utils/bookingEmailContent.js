// utils/emailTemplates.js
const createBookingEmail = (userName, bookingDetails) => {
  const { centreName, sportName, courtName, date, startTime, endTime } =
    bookingDetails;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Booking Confirmation</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f4;">
      <table role="presentation" style="width:100%; border-collapse:collapse; background-color:#f4f4f4;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table role="presentation" style="width:600px; border-collapse:collapse; background-color:#ffffff; border-radius:5px; overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="padding: 20px; text-align:center; background-color:#28a745;">
                  <h1 style="color:#ffffff; margin:0;">Quick Court Slot</h1>
                </td>
              </tr>
              <!-- Body -->Court Booking Team


              <tr>
                <td style="padding: 30px;">
                  <h2 style="color:#333333;">Booking Confirmation</h2>
                  <p style="color:#555555;">Hello ${userName},</p>
                  <p style="color:#555555;">Thank you for booking a court with us. Here are your booking details:</p>
                  <table style="width:100%; border-collapse:collapse; margin:20px 0;">
                    <tr>
                      <td style="padding:8px; border:1px solid #ddd;">Centre</td>
                      <td style="padding:8px; border:1px solid #ddd;">${centreName}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px; border:1px solid #ddd;">Sport</td>
                      <td style="padding:8px; border:1px solid #ddd;">${sportName}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px; border:1px solid #ddd;">Court</td>
                      <td style="padding:8px; border:1px solid #ddd;">${courtName}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px; border:1px solid #ddd;">Date</td>
                      <td style="padding:8px; border:1px solid #ddd;">${date}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px; border:1px solid #ddd;">Start Time</td>
                      <td style="padding:8px; border:1px solid #ddd;">${startTime}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px; border:1px solid #ddd;">End Time</td>
                      <td style="padding:8px; border:1px solid #ddd;">${endTime}</td>
                    </tr>
                  </table>
                  <p style="color:#555555;">We look forward to seeing you!</p>
                  <p style="color:#555555;">Best regards,<br/>Quick Court Team</p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 20px; text-align:center; background-color:#f4f4f4;">
                  <p style="color:#999999; font-size:12px; margin:0;">© ${new Date().getFullYear()} Quick Court. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

module.exports = { createBookingEmail };
