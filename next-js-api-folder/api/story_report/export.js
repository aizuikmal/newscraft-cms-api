import axios from 'axios'
import fs from 'fs'
import dayjs from 'dayjs'

const converter = require('json-2-csv')

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

const listing_limit = 1000

export default async (req, res) => {
  const { search, hash, adv } = req.query
  const search_json = JSON.parse(search)
  const { author, category, date_start, date_end, publisher_id, property_id } = search_json

  console.log(search_json)

  // if (!req.query.hash) {
  //   res.status(401).json({ status: 'hash required' })
  //   return
  // }

  const find = { publisher_id, property_id, status: 1 }

  if (date_start && date_end) {
    find.date_pub = { $gt: parseInt(date_start), $lt: parseInt(date_end) }
  }

  if (author.length > 0) {
    find.author = { $in: author }
  }

  if (category.length > 0) {
    find.cat_str = category
  }

  const response = await axios.post(process.env.API_SERVER, {
    key: process.env.API_KEY,
    type: 'find',
    collection: 'entry',
    limit: listing_limit,
    projection: {
      id: 1,
      sid: 1,
      title: 1,
      // summary: 1,
      // cat: 1,
      cat_str: 1,
      free: 1,
      // feed_pos: 1,
      // feed_id: 1,
      author: 1,
      // author_display: 1,
      // author_hidden: 1,
      tags: 1,
      // image_feat: 1,
      // images: 1,
      // status: 1,
      date_pub: 1,
      // date_schedule: 1,
      // meta_contentstatus: 1,
      // meta_contentstatus_2nd_user_mod: 1,
      // meta_contentstatus_2nd_date_mod: 1,
      // meta_contentstatus_3rd_user_mod: 1,
      // meta_contentstatus_3rd_date_mod: 1,
      user_pub: 1,
      // user_mod: 1,
      // is_schedule: 1,
      post_type: 1
      // videos: 1
    },
    sort: { date_pub: -1 },
    find: find
  })

  // console.log(response.data.data)
  console.log('find', find)

  if (adv === 'calcpara') {
    //do para calculation

    //map all the entries
    //download fullcontent via graphql
    //calc letters and paragraphs
    //compile back into array

    const buf = []

    let payload_promised = await Promise.all(
      response.data.data.map(async story => {
        const query = `
        query get($id: String, $api_key: String) {
            story(id: $id, api_key: $api_key) {
                content
                content_status
            }
        }`

        const variables = {
          publisher_id: 'xxxxxxxxx',
          id: story.id,
          api_key: 'xxxxxxxxx'
        }

        const response = await axios.post('http://xxxxxxxxx/graphql', {
          query,
          variables
        })

        const story_length_letters = response.data.data.story.content.length
        const story_length_para = (response.data.data.story.content.match(/<p>/g) || []).length
        const story_length_words = response.data.data.story.content.split(" ").length
        
        const analysis = { length_letters:story_length_letters, length_para:story_length_para, length_words:story_length_words }
        const comp = {...story, ...analysis}

        return comp
      })
    )

    // res.send({ status: 'ok', data: item_total_price })

    converter.json2csv(payload_promised, (err, csv) => {
      if (err) {
        throw err
      }

      const filename = `export-stories-${hash ? hash : ''}-${dayjs().format('YYYYMMDDHHmmss')}.csv`

      fs.writeFile(`/tmp/nc-${filename}`, csv, (err, item) => {
        const rs = fs.createReadStream(`/tmp/nc-${filename}`)
        res.setHeader('Content-disposition', 'attachment; filename=' + filename)
        res.setHeader('Content-Type', 'text/csv')
        rs.pipe(res)
      })
    })

  } else {
    converter.json2csv(response.data.data, (err, csv) => {
      if (err) {
        throw err
      }

      const filename = `export-stories-${hash ? hash : ''}-${dayjs().format('YYYYMMDDHHmmss')}.csv`

      fs.writeFile(`/tmp/nc-${filename}`, csv, (err, item) => {
        const rs = fs.createReadStream(`/tmp/nc-${filename}`)
        res.setHeader('Content-disposition', 'attachment; filename=' + filename)
        res.setHeader('Content-Type', 'text/csv')
        rs.pipe(res)
      })
    })
  }
}
