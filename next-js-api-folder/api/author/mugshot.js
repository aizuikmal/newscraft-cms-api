import axios from 'axios'
import FormData from 'form-data'
require('dotenv').config()
import fs from 'fs'
const API_SERVER = process.env.API_SERVER
export default async (req, res) => {
  try {
    console.log('fule', req.method)
    const { lang, file, filename, authorId, type } = req.body
    const tempPath = `./${filename}${type}`
    let base64Image = file.split(';base64,').pop();
    const buff = Buffer.from(base64Image, 'base64')
    fs.writeFileSync(tempPath, buff)
    const imgFile = fs.createReadStream(tempPath)
    const formData = new FormData()
    formData.append('file', imgFile)
    formData.append('filename', filename)
    // const config = {
    //   method: 'post',
    //   url: 'https://xxxxxxxxx/api/author_mugshot/upload/en',
    //   headers: { 
    //     'authorization': 'F9TcGdY!5*qVA5hBq33i1y', 
    //     ...formData.getHeaders()
    //   },
    //   data : formData
    // };
    
    // axios(config)
    // .then(function (response) {
    //   console.log(JSON.stringify(response.data))
    // })
    const resultAgg = await axios.post(`https://xxxxxxxxx/api/author_mugshot/upload/${lang}`, formData, { headers: { ...formData.getHeaders() } })
    console.log('Loko', resultAgg.data)
    fs.unlink(tempPath, (err) => {
      if (err) {
        console.log(err, 'LOL')
        return
      }
      return
    })
    if (resultAgg.data.status === 'OK') {
      console.log(authorId, resultAgg.data.url)
      axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: 'updateOne',
        collection: 'author_meta',
        upsert: true,
        payload: { avatar: resultAgg.data.url },
        find: { author_id: authorId }
      })
    } else {
      throw new Error('error uploading image')
    }
    res.send(resultAgg.data)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}
