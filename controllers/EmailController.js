require('dotenv').config();

const nodemailer = require("nodemailer");

module.exports = {
    send_email: async (req, res) => {
        try {
            const code = req.body.verification_code;
            delete req.body.verification_code;
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.APP_MAIL,
                    pass: process.env.APP_PASS
                }
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: `"DO-NOT-REPLY" <${process.env.APP_MAIL}>`, // sender address
                to: req.body.to, // list of receivers
                subject: req.body.subject, // Subject line
                text: req.body.text, // plain text body
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width">
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                        <style>
                            body {
                                background: teal;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                            }
                            .container {
                                background: white;
                                padding: 20px;
                                margin: 20px;
                                border-radius: 15px;
                                box-shadow: 0px 0px 10px 5px white;
                                text-align: center;
                            }
                        </style>
                    </head>
                    
                    <body>
                        ${req.body.html}
                    </body>
                    </html>
                `, // html body
            });
            res.status(200).send({ message: "Verification sent success" });
        } catch (err) {
            console.log(err);
        }
    }
}