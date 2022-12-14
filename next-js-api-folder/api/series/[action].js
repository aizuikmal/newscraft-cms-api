import axios from 'axios'
import dayjs from 'dayjs'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { action, upsert, publisher_id, property_id } = req.query

  if (action === 'list_entries') {
    try {
      const response = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: 'findOne',
        collection: 'feed_sort',
        find: { series_id: req.body.series_id }
      })
      res.send(response.data)
    } catch (error) {
      console.log('error 1',err)
      res.status(500).json({ status: 'An error has occured' })
    }
  }

  if (action === 'update_entries') {
    try {
      const response = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: 'updateOne',
        collection: 'feed_sort',
        upsert: upsert === 'true' ? true : false,
        payload: {
          publisher_id: publisher_id,
          property_id: property_id,
          entries: req.body,
          dateModified: dayjs(new Date()).unix()
        },
        find: { series_id: req.query.series_id }
      })


      //webhook
      //-headline_update

      const pl = {
        publisher_id, property_id, section:req.query.series_name
      }

      console.log('=======================================  ',pl)

      const ret_webhooks = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: 'find',
        collection: 'webhook',
        find: {
          // $or: [{ intent: 'entry_add' }, { intent: 'entry_update' }, { intent: 'entry_delete' }],
          $or: [{ intent: 'headline_update' }],
          status: 1, publisher_id: publisher_id, property_id: property_id
        },
        sort: { async: -1 }
      })

      let total_webhooks = await Promise.all(
        ret_webhooks.data.data.map(async webhook => {

          axios.post(webhook.url, pl)
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


      res.send(response.data.status)
    } catch (error) {
      console.log('error 2',error.data)
      res.status(500).json({ status: 'An error has occured' })
    }
  }
}
