const inlineCss = require('../../../lib/inline-css')

const ProcessCss = (req, res) => {
  // console.log('ProcessCss()')
  if (req.body.full_content && req.body.full_content.length > 0 && req.body.custom_css && req.body.custom_css.length > 0) {
    let html_input = req.body.full_content
    let css_input = req.body.custom_css

    html_input = '<style>' + css_input + '</style>' + html_input
    inlineCss(html_input, { extraCss: false, url: 'http://' }).then(function (html) {
      res.send(html)
    })
  } else {
    res.send('')
  }
}

export default ProcessCss
