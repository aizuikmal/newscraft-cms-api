import axios from 'axios'
import md5 from 'md5'
import dayjs from 'dayjs'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { type, publisher_id, property_id, keywords } = req.body

  const result = await meta_process(req.body, 'updateOne', 'tags')

  // const find = {
  //   term: { $regex: `^${alphabet}`, $options: 'i' },
  //   publisher_id,
  //   property_id
  // }

  // const result = await axios.post(API_SERVER, {
  //   key: process.env.API_KEY,
  //   type: 'find',
  //   collection: type == 'author' ? 'author' : 'tags',
  //   find: find,
  //   limit: 1000,
  //   sort: { term: 1 }
  // })
  res.send({ status: 'ok' })
}

const meta_process = (data, type, cls) => {
  const { keywords, publisher_id, property_id, deleted, user } = data
  keywords.length &&
    keywords.map(async meta => {
      // if (meta.__isNew__) {
      await meta_process_stored(meta, publisher_id, property_id, deleted, type, cls, user)
      // }
    })
  return keywords
}

const meta_process_stored = async (meta, publisher_id, property_id, deleted, type, cls, user) => {
  let _id = meta._id ? meta._id : md5(meta.value)

  delete meta.__isNew__

  let unset = false
  let pl_metas = {}
  pl_metas.publisher_id = publisher_id
  pl_metas.property_id = property_id
  pl_metas.term = meta.label
  // pl_metas.deleted = true

  const options_tags = {
    key: process.env.API_KEY,
    db: 'autocomplete',
    type: type,
    collection: cls,
    upsert: true,
    find: { term: meta.label },
    payload: pl_metas
  }
  // !deleted ? (options.unset = { deleted: '' }) : (options.payload = pl_metas)

  const pl_action = {
    namespace: cls,
    term: meta.label,
    publisher_id,
    property_id,
    isNew: true,
    isIgnored: false,
    user_mod: user,
    date_mod: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }

  const options_actions = {
    key: process.env.API_KEY,
    db: 'autocomplete',
    type: 'insertOne',
    collection: 'actions',
    upsert: true,
    payload: pl_action
  }

  console.log('options_actions', options_tags)

  try {
    const tagResult = await axios.post(API_SERVER, options_tags)
    // aliff - 2022-03-11 - only update actions if new keyword added
    if (tagResult.data.data.upsertedCount) {
      await axios.post(API_SERVER, options_actions)
    }
  } catch (error) {
    return error
  }
}
