import nodemailer from 'nodemailer';

export const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your preferred provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Unimart Email Verification',
    text: `Your OTP is: ${otp}. It expires in 5 minutes.`
  };

  await transporter.sendMail(mailOptions);
};
