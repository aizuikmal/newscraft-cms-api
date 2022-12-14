import axios from 'axios'
import md5 from 'md5'
import dayjs from 'dayjs'
import { getSession } from 'next-auth/client'
import slugify from 'slugify'

const fs = require('fs')

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

const BACKUP_COPIES_TMP = '/tmp/nc_backup_posts'
const BACKUP_COPIES_FILE_PREFIX = 'nc_backup_post'

export default async (req, res) => {
  const { type, projection } = req.query
  const { feed_pos, author, authors, cat_id, tags, publisher_id, property_id, status, user_pub, meta } = req.body

  const session = await getSession({ req })

  const pl = { ...req.body }

  if (type === 'updateOne' || type === 'insertOne') {
    delete pl.series_raw

    try {
      meta && await entries_meta(pl.id, pl)
      const authors_array = await meta_process(authors, publisher_id, property_id, 'author', user_pub)
      const tags_array = await meta_process(tags, publisher_id, property_id, 'tags', user_pub)
      const cats_array = cat_id && meta_process_categories(cat_id)
      const cats_str = cat_id && meta_process_categories_str(cat_id)

      authors_array ? (pl.author_str = pl.author.join(', ')) : ''
      tags_array ? (pl.tags = tags_array.map(tag => tag.label)) : ''
      tags_array ? (pl.tags_str = pl.tags.join(',')) : ''
      cats_array ? (pl.cat_id = cats_array) : []
      cats_str ? (pl.cat_str = cats_str) : ''
      cats_str ? (pl.category = cats_str) : ''
      pl.image_feat = meta_process_image_feat(pl.images)
      pl.feed_pos = parseInt(feed_pos)
      pl.author_id = authors && authors.length ? authors.map(item => item.id || md5(item.label)) : []

      const webhook_payload = { ...pl }
      webhook_payload.content = pl.full_content

      delete pl.authors

      saveContentInBackupFile({ pl, session, property_id })

      pl.full_content && (await setFullContent(pl))
      delete pl.full_content
      delete webhook_payload.full_content

      // save to nc_entry
      await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: type,
        collection: 'entry',
        payload: pl,
        find: { id: pl.id }
      })

      //webhook
      //- entry_add (story new)
      //- entry_update (story edit/update existing)
      //- entry_delete (story delete)

      if (status === 1 || status === 8 || status === 0) {
        const ret_webhooks = await axios.post(API_SERVER, {
          key: process.env.API_KEY,
          type: 'find',
          collection: 'webhook',
          find: {
            $or: [{ intent: 'entry_add' }, { intent: 'entry_update' }],
            status: 1,
            publisher_id: publisher_id,
            property_id: property_id
          },
          sort: { async: -1 }
        })

        let total_webhooks = await Promise.all(
          ret_webhooks.data.data.map(async webhook => {
            if ((type === 'insertOne' && webhook.intent === 'entry_add') || (type === 'updateOne' && webhook.intent === 'entry_update')) {
              axios({
                method: 'post',
                url: webhook.url.replace('{eid}', webhook_payload.id),
                headers: { 'x-api-key': '62fdffbf70102e4d636a85e08043df25' },
                data: webhook_payload
              })
                .then(function (response) {
                  if (webhook.async) {
                    return { 'webhook DONE': webhook.url.replace('{eid}', webhook_payload.id) }
                  }
                })
                .catch(function (error) {
                  // console.error('webhook error', webhook.url.replace('{eid}', pl.id))
                  // TODO: mechanism to log error, and alert on UI
                  // ...
                })
              if (!webhook.async) {
                return { 'webhook DONE': webhook.url.replace('{eid}', webhook_payload.id) }
              }
            } else {
              return { 'webhook IGNORED': webhook.url.replace('{eid}', webhook_payload.id) }
            }
          })
        )
      }

      res.json({ status: 200, data: pl })
    } catch (error) {
      console.log(error)
      res.status(500).json({ status: 'An error has occured' })
    }
  } else {
    const response = await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: type,
      limit: 50,
      collection: 'entry',
      projection: JSON.parse(projection),
      find: req.body,
      sort: { date_pub: -1 }
    })
    res.send(response.data)
  }
}

const slugify_custom = a => {
  const b = a.replace(/[^a-zA-Z0-9_\u3400-\u9FBF\s-]/g, '')
  return b
}

const entries_meta = async (id, pl) => {
  pl.meta.publisher_id = pl.publisher_id
  pl.meta.property_id = pl.property_id
  try {
    await axios.post(API_SERVER, {
      key: process.env.API_KEY,
      type: 'updateOne',
      collection: 'meta',
      payload: pl.meta,
      upsert: true,
      find: { id: id, publisher_id: pl.meta.publisher_id, property_id: pl.meta.property_id }
    })
    delete pl.meta
    return 'ok'
  } catch (error) {
    delete pl.meta
    console.log(error, ' - on meta collection')
  }
}

const meta_process_categories = metas => {
  metas = metas && metas.length ? metas.map(meta => meta.id) : [metas.id]
  return metas
}

const meta_process_categories_str = metas => {
  return metas[0].name || metas[0].value
}

const meta_process_image_feat = images => {
  if (images) {
    return images.map(image => image.filename)
  }
}

const meta_process = (metas, publisher_id, property_id, cls, user_pub) => {
  metas &&
    metas.map(async meta => {
      if (meta.__isNew__) {
        await meta_process_stored(meta, publisher_id, property_id, cls, user_pub)
      }
    })
  return metas
}

const meta_process_stored = async (meta, publisher_id, property_id, cls, user_pub) => {
  delete meta.__isNew__

  let pl_metas = {
    term: meta.label,
    publisher_id: publisher_id,
    property_id: property_id
  }

  try {
    // await axios.post(API_SERVER, {
    //   key: process.env.API_KEY,
    //   type: 'updateOne',
    //   collection: cls,
    //   payload: pl_metas,
    //   upsert: true,
    //   find: { term: meta.label, publisher_id: publisher_id, property_id: property_id }
    // })

    // update nc-autocomplete db, actions collection
    const options_actions = {
      key: process.env.API_KEY,
      db: 'autocomplete',
      type: 'insertOne',
      collection: 'actions',
      upsert: true,
      payload: {
        namespace: cls,
        term: meta.label,
        publisher_id,
        property_id,
        isNew: true,
        isIgnored: false,
        user_mod: user_pub,
        date_mod: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
    }
    await axios.post(API_SERVER, options_actions)

    if (cls === 'tags') {
      // update nc-autocomplete db, tags collection
      await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: 'updateOne',
        collection: cls,
        payload: pl_metas,
        upsert: true,
        find: { term: meta.label, publisher_id: publisher_id, property_id: property_id }
      })
    } else {
      // update nc-entry db, authors collection
      await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: 'updateOne',
        collection: 'authors',
        payload: {
          status: 1,
          name: meta.label,
          publisher_id: publisher_id,
          property_id: property_id,
          id: md5(meta.label)
        },
        upsert: true,
        find: { name: meta.label, publisher_id: publisher_id, property_id: property_id }
      })
    }
  } catch (error) {
    return error
  }
}

const setFullContent = async ({ id, full_content }) => {
  try {
    const response = await axios.post(process.env.API_ENDPOINT + '/s3', {
      key: `data/contents/${id}`,
      method: 'post',
      bucket: 'api-data.newscraft.io',
      content: `${full_content}`
    })
    console.log('full_content', response.data)
  } catch (error) {
    return error
  }
}

const saveContentInBackupFile = ({ pl, property_id, session }) => {
  const safe_status = slugify(pl.status.toString() || '')
  const safe_title = slugify_custom(pl.title || '', { lower: true })
  const safe_property_id = slugify(property_id || '')
  const safe_id = slugify(pl.id || '')
  const safe_email = slugify(session.user.email || '')

  // check if BACKUP_COPIES_TMP exists
  if (!fs.existsSync(`${BACKUP_COPIES_TMP}/${safe_property_id}`)) {
    fs.mkdirSync(`${BACKUP_COPIES_TMP}/${safe_property_id}`, { recursive: true })
  }

  const filename_backup_copy = `${BACKUP_COPIES_TMP}/${safe_property_id}/${BACKUP_COPIES_FILE_PREFIX}}-{${safe_property_id}}-{${safe_email}}-{${safe_id}}-{${dayjs().format()}}-{${safe_title}}-{${safe_status}.json`

  fs.writeFile(filename_backup_copy, JSON.stringify(pl), (err, item) => {})
}
