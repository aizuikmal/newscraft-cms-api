import axios from 'axios'
import md5 from 'md5'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  const { term, type, collection } = req.query
  if (type !== 'find') {
    const result = await meta_process(req.body, type, collection)
    res.send(result)
  } else {
    const find = {
      term: { $regex: `^${term}`, $options: 'i' },
      publisher_id: req.body.publisher_id,
      property_id: req.body.property_id
    }
    const result = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'find',
      collection: collection,
      find: find,
      sort: { term: 1 }
    })
    res.send({ data: result.data.data })
  }
}

const meta_process = (data, type, cls) => {
  const { keywords, publisher_id, property_id, deleted } = data
  keywords.length &&
    keywords.map(async meta => {
      // if (meta.__isNew__) {
      await meta_process_stored(meta, publisher_id, property_id, deleted, type, cls)
      // }
    })
  return keywords
}

const meta_process_stored = async (meta, publisher_id, property_id, deleted, type, cls) => {
  let _id = meta._id ? meta._id : md5(meta.value)

  delete meta.__isNew__

  let unset = false
  let pl_metas = {}
  pl_metas.publisher_id = publisher_id
  pl_metas.property_id = property_id
  pl_metas.term = meta.label
  pl_metas.deleted = true

  const options = {
    key: process.env.API_KEY,
    type: type,
    collection: cls,
    upsert: false,
    find: { term: meta.label }
  }
  !deleted ? (options.unset = { deleted: '' }) : (options.payload = pl_metas)

  try {
    const response = await axios.post(API_SERVER, options)
  } catch (error) {
    return error
  }
}
