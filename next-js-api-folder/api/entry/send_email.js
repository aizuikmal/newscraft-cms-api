const AWS = require('aws-sdk')

const AMZ_SES_SMTP_ENDPOINT = 'email-smtp.ap-southeast-1.amazonaws.com'
const AMZ_SES_SMTP_PORT = '465'
const AMZ_SES_SMTP_USER = 'AKIAVXC32QPA3WRJZXHX'
const AMZ_SES_SMTP_PASS = 'BDP9VGvV8PMkW3LVXphjdxXe/nBIIAAKi/CPkGF7l4tL'
const AMZ_SES_ACCESS = 'AKIAVXC32QPA76N374TZ'
const AMZ_SES_SECRET = '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'
const AMZ_SES_REGION = 'ap-southeast-1'

const sendEmail = async (req, res) => {
  // console.log('sendEmail()')
  if (req.body.email && req.body.email.length > 0) {
    let email_input = req.body.email
    let entry_input = req.body.entry
    let full_content_input = req.body.full_content
    // console.log('entry_input',entry_input)

    //send new registration email
    const email_subject = '[NEWSCRAFT STORY EMAIL PREVIEW] - ' + entry_input.title
    const email_content_html = full_content_input
    const email_content_txt = full_content_input.replace(/(<([^>]+)>)/gi, '')

    const SES_CONFIG = {
      accessKeyId: AMZ_SES_ACCESS,
      secretAccessKey: AMZ_SES_SECRET,
      region: AMZ_SES_REGION
    }

    const AWS_SES = new AWS.SES(SES_CONFIG)

    const send_email_params = {
      Destination: {
        // CcAddresses: [ 'EMAIL_ADDRESS' ],
        ToAddresses: [email_input]
      },
      Message: {
        Body: {
          Html: { Charset: 'UTF-8', Data: email_content_html },
          Text: { Charset: 'UTF-8', Data: email_content_txt }
        },
        Subject: { Charset: 'UTF-8', Data: email_subject }
      },
      Source: '"Newscraft CMS" <hello@ohsem.net>',
      ReplyToAddresses: ['hello@ohsem.net']
    }

    // console.log('send_email_params',send_email_params)
    const ret = await AWS_SES.sendEmail(send_email_params).promise()
    console.log('AWS SES', ret)
  }
  res.send('ok')
}

export default sendEmail
