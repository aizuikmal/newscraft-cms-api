import axios from 'axios'
require('dotenv').config()
const parse = require('url-parse')

export default async (req, res) => {
  
  const { url, template } = req.body

  const url_parsed = parse(url, true)
  
  console.log(template.split('/'))
  console.log(url_parsed.pathname)
  
  if(!url_parsed.slashes){
    res.status(200).send('error')
    return
  }
  
  const url_arr = url_parsed.pathname.split('/')
  const template_arr = template.split('/')

  const pl = {}
  template_arr.map((item, index) => {
    if(item.length > 0 && item !== '*'){
      pl[item] = url_arr[index]
    }
  })

  let find = {}
  let isFind = false

  //check for sid
  if(pl['%sid%'] !== undefined){
    find['sid'] = parseInt(pl['%sid%'])
    // find['sid'] = pl['%sid%']
    isFind = true
  }

  if(isFind){
    const ret = await axios.post(process.env.API_SERVER, {
      key: process.env.API_KEY,
      type: 'findOne',
      collection: 'entry',
      find,
      projection: {
        id: 1,
      }
    })

    if(ret.data.data === null){
      res.status(200).send('error')
      return
    }

    let url_redirect = '/edit/'+ret.data.data.id

    res.status(200).send(url_redirect)
  }else{
    res.status(200).send('error')
    return
  }
}
