const transporter = require("./mailSend.js");
const sendBookingEmail = async (email, bookingDetails) => {
  const mailOptions = {
    from: "dbmsproject09@gmail.com",
    to: email,
    subject: "Booked Court Details",
    html: bookingDetails,
  };

  await transporter.sendMail(mailOptions);
};
module.exports = sendBookingEmail;
