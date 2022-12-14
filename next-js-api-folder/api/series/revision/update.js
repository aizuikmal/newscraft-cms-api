import axios from 'axios'
import dayjs from 'dayjs'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { series_id, series_name, user, publisher_id, property_id } = req.query

  try {
    const response = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'insertOne',
      collection: 'feed_revisions',
      payload: {
        feed_id: series_id,
        entries: req.body,
        createdBy: user,
        createdAt: dayjs(new Date()).unix()
      },
      find: { feed_id: series_id }
    })

    const pl = {
      publisher_id,
      property_id,
      section: series_name
    }

    console.log('=======================================  ', pl)

    const ret_webhooks = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'find',
      collection: 'webhook',
      find: {
        $or: [{ intent: 'headline_update' }],
        status: 1,
        publisher_id: publisher_id,
        property_id: property_id
      },
      sort: { async: -1 }
    })

    let total_webhooks = await Promise.all(
      ret_webhooks.data.data.map(async webhook => {
        axios
          .post(webhook.url, pl)
          .then(function (response) {
            if (webhook.async) {
              return { 'webhook DONE': webhook.url }
            }
          })
          .catch(function (error) {
            console.error('webhook error', webhook.url)
            // TODO: mechanism to log error, and alert on UI
            // ...
          })
        if (!webhook.async) {
          return { 'webhook DONE': webhook.url }
        }
      })
    )

    console.log('total_webhooks', total_webhooks)

    console.log(response.data)
    // res.send('OK')
    res.send(response.data.status)
  } catch (error) {
    console.log('error 2', error.data)
    res.status(500).json({ status: 'An error has occured' })
  }
}
