const nodemailer=require('nodemailer');

const sendMail=async (email,subject,text)=>
{
    const sendEmail = async (email, subject, text) => {
        // 1. Create a transporter
    // Looking to send emails in production? Check out our Email API/SMTP product!
  // Looking to send emails in production? Check out our Email API/SMTP product!
var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,

    auth: {
        user: process.env.EMAIL_USERNAME ,
        pass: process.env.EMAIL_PASSWORD ,
    }
  });

  const mailOptions = {
    from: '"supermarkt support" <j_hamad83@hotmail.com>', // Sender address
    to: email, // Recipient email
    subject: subject, // Subject line
    text: text, // Plain text body
    // You can also add HTML content if needed
    // html: '<h1>HTML Message</h1>'
  };

  // 3. Actually send the email
  await transport.sendMail(mailOptions);





    }
}

module.exports=sendMail;


//============================================================================
