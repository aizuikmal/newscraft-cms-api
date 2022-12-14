import axios from 'axios'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER
const API_ENDPOINT = process.env.API_ENDPOINT

export default async (req, res) => {
  const publisher_id = req.cookies['_nc_active_publisher']
  const property_id = req.cookies['_nc_active_property']
  const { name } = req.query

  // const find = {
  //   name: { $regex: `.${name}.`, $options: 'i' },
  //   publisher_id,
  //   property_id,
  //   status: 1
  // }

  // const result = await axios.post(API_SERVER, {
  //   key: process.env.API_KEY,
  //   type: 'find',
  //   collection: 'authors',
  //   find: find,
  //   limit: 100,
  //   sort: { name: 1 }
  // })
  const resultAgg = await axios.post(`${API_ENDPOINT}/searchAuthor`, { authorName: name, publisher_id, property_id, status: 1 })
  if (resultAgg.data?.authors) {
    const resWithImage = await Promise.all(resultAgg?.data?.authors.map(async author => {
      const authorRes = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: 'findOne',
        collection: 'author_meta',
        sort: { name: 1 },
        limit: 10000,
        find: { author_id: author.id }
      })
      return { ...author, meta: authorRes.data.data }
      // return { ...author }
    }))
    res.send({ status: 'ok', data: resWithImage })
  } else {
    res.send({ data: result.data.data })
  }
}
