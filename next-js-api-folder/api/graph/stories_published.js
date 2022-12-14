import axios from 'axios'
require('dotenv').config()

export default async (req, res) => {
  const { key } = req.query
  if (!key) {
    res.status(400).send({ status: 'error', message: 'key is required' })
    return
  }
  const url = `${process.env.API_ENDPOINT}/graph_analytics/stories_published/${key}`
  try {
    const response = await axios.post(url)
    let data = response.data
    let psum = 0
    let psum_paid = 0
    let psum_free = 0
    let payload = data.map(item => ({
      Hour: Object.keys(item)[0],
      Stories: item[Object.keys(item)[0]].published,
      Paid: item[Object.keys(item)[0]].paid,
      Free: item[Object.keys(item)[0]].free,
      Total: (psum += item[Object.keys(item)[0]].published),
      Total_Paid: (psum_paid += item[Object.keys(item)[0]].paid),
      Total_Free: (psum_free += item[Object.keys(item)[0]].free)
    }))
    res.send({ status: 'success', data: payload })
  } catch (error) {
    console.log(error)
    res.send(error)
  }
}
