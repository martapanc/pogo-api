// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export function sendActivationEmail(email: string, verificationLink: string) {
    const content = `Hi!<br><br>Please click on the following link to activate your PoGo Connect account: <br><br>${verificationLink}`;

    const message = {
        to: email,
        bcc: 'pogoconnect.mail@gmail.com',
        from: 'pogoconnect.mail@gmail.com',
        subject: 'Please confirm your email address',
        html: content,
    }

    sgMail
        .send(message)
        .then(() => {
            console.log(`Activation Email sent to ${email}`);
        })
        .catch((error: any) => {
            console.error(error);
        })
}

export function sendPasswordResetEmail(email: string, newPassword: string) {
    const content = `Hi!<br><br>Here's your new password: <strong>${newPassword}</strong>`;

    const message = {
        to: email,
        bcc: 'pogoconnect.mail@gmail.com',
        from: 'pogoconnect.mail@gmail.com',
        subject: `Here's your new PoGo Connect password`,
        html: content,
    }

    sgMail
        .send(message)
        .then(() => {
            console.log(`Password Reset Email sent to ${email}`);
        })
        .catch((error: any) => {
            console.error(error);
        })
}
