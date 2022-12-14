import axios from 'axios'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { author, category, page = 0, date_start, date_end, publisher_id, property_id } = req.body

  const first = 100
  const skip = page * first

  if (!req.body) {
    res.status(401).json({ status: 'body required' })
    return
  }
  const query = `
    query get{
      stories(skip: ${skip}, first: ${first}, bypass_cache_key: "xxxxxxxxx", publisher_id: "${publisher_id}", property_id: "${property_id}", 
      ${author ? `author: "${author}"` : ''}, 
      ${category ? `category: "${category}"` : ''},
      ${date_start && date_end ? `date_pub_range: "${date_start}-${date_end}"` : ''},
    ) {
        i
        id
        title
        sid
        date_pub
        author
        category
        language 
      }
    }
  `
  
  const response = await axios.post(
    'http://xxxxxxxxx/graphql',
    { query },
    { headers: { 'Cache-Control': 'no-cache' } }
  )
  res.json({ status: 'ok', data: response.data.data.stories })
}
