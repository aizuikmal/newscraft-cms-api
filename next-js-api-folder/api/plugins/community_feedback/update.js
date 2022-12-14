import axios from 'axios'
import _ from 'lodash'

require('dotenv').config()
const API_SERVICES_ENDPOINT = process.env.API_SERVICES_ENDPOINT

const CommunityFeedbackUpdate = async (req, res) => {
  const { data, user } = req.body

  const result = await Promise.all(
    data.map(async item => {
      try {
        const res = await axios.post(`${API_SERVICES_ENDPOINT}/mk-text-report/resolve`, {
          id: item._id,
          resolve_actor: user
        })
        return res.data
      } catch (error) {
        return error
      }
    })
  )
  res.json({ status: 'ok', data: result })
}
export default CommunityFeedbackUpdate
