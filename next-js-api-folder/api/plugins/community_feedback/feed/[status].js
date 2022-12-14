import axios from 'axios'
import _ from 'lodash'

require('dotenv').config()
const API_SERVICES_ENDPOINT = process.env.API_SERVICES_ENDPOINT

const CommunityFeedbackFeed = async (req, res) => {
  const { status } = req.query
  const { publisher_id, property_id } = req.body

  try {
    const properties = await axios.post(process.env.API_SERVER, {
      key: process.env.API_KEY,
      type: 'findOne',
      collection: 'properties',
      find: { id: property_id }
    })
    const language = properties.data.data ? properties.data.data.lang.toLowerCase() : 'en'
    const result = await axios.get(
      `${API_SERVICES_ENDPOINT}/mk-text-report/reports?status=${status.toUpperCase()}&publisher_id=${publisher_id}&property_id=${property_id}`
    )
    const data = _.groupBy(
      result.data.reports.filter(item => item.language === language),
      item => item.url.split('/')[4]
    )
    res.json({ status: 'ok', data: data })
  } catch (error) {
    res.json(error)
  }
}

export default CommunityFeedbackFeed
