import axios from 'axios'
import md5 from 'md5'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { term, publisher_id, property_id } = req.body

  const query = `
    query get{
      stories(first: 100, test_include:1, bypass_cache_key: "xxxxxxxxx", publisher_id: "${publisher_id}", property_id: "${property_id}", tag: "${term}") {
        i
        id
        title
        sid
        date_pub
        author
        tags
      }
    }
  `

  const response = await axios.post(
    'http://xxxxxxxxx/graphql',
    { query },
    { headers: { 'Cache-Control': 'no-cache' } }
  )

  // console.log(query)
  // console.log(response.data.data.stories)

  res.json({ status:'ok', data:response.data.data.stories })
}
