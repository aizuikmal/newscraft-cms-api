import axios from 'axios'
import _ from 'lodash'

require('dotenv').config()
const API_SERVICES_ENDPOINT = process.env.API_SERVICES_ENDPOINT

const CommunityFeedback = async (req, res) => {
  const { publisher_id, property_id, lang } = req.body

  try {
    const result = await axios.get(
      `${API_SERVICES_ENDPOINT}/mk-text-report/reports?status=REPORTED&publisher_id=${publisher_id}&property_id=${property_id}`
    )
    const data = _.groupBy(
      result.data.reports.filter(item => item.language === lang),
      item => item.url.split('/')[4]
    )
    res.json({ status: 'ok', data: [data] })
  } catch (error) {
    console.log(error)
    res.json(error)
  }
}

export default CommunityFeedback
