const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendEMail2 = async (email, subject, text) => {
    console.log("process.env.SENDGRID_API_KEY"+process.env.SENDGRID_API_KEY)
    try {
      const msg = {
        to: 'j_hamad83@hotmail.com',
        from: 'j_hamad83@hotmail.com',
        subject: subject,
        text: text,
      };
  
      await sgMail.send(msg);
      console.log('Email sent successfully.');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

module.exports = sendEMail2;
