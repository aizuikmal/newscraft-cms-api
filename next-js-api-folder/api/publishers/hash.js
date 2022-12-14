import md5 from 'md5'

require('dotenv').config()

export default async (req, res) => {

  const { pub_id, prop_id, lang } = req.body
  
  res.send(md5(pub_id + prop_id + lang + process.env.HASHING_SALT))

}
