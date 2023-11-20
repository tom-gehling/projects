import nodemailer from "nodemailer";

export async function getMailer() {
	// Generate test SMTP service account from ethereal.email
	// Only needed if you don't have a real mail account for testing

	// create reusable transporter object using the default SMTP transport
	const transporter = nodemailer.createTransport({
		host: 'smtp-relay.sendinblue.com',
		port: 587,
		auth: {
			// user: 'postmaster@sandboxf96faa76198f4d0aaa6ce284cb8bfaa4.mailgun.org',
			// pass: 'fdb216dda67511f3c0b78332a6d7428b-6d1c649a-4eb3e9fd'
			user: 'dev@forbit.dev',
			pass: 'QkSPsWc7GDY1Vm2b'
		}
	});

	return transporter;
}