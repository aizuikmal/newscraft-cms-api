import axios from 'axios'
import md5 from 'md5'
require('dotenv').config()

export default async (req, res) => {
  const { pulisher_id, property_id } = req.query
  const { roles } = req.body
  req.body.id = md5(req.body.email)
  const reg_user = await registerUser(req.body)

  if (reg_user.upsertedId) {
    registerAccounts(req.body.id)
    registerpermissions(req.body.id, pulisher_id, property_id, roles)
    res.status(200).json('OK')
  } else {
    res.status(404).send('User exist!')
  }
}

const registerUser = async pl => {
  const { id, name, email, status, phone } = pl
  const ret = await axios.post(process.env.API_SERVER, {
    key: 'xxxx0987',
    type: 'updateOne',
    collection: 'users',
    find: { email: email },
    payload: {
      id: id,
      name: name,
      email: email,
      status: status,
      phone: phone
    },
    upsert: true
  })
  if (ret.data.data.upsertedId) {
    await axios.post(process.env.API_SERVER, {
      key: 'xxxx0987',
      type: 'updateOne',
      collection: 'users',
      find: { email: email },
      payload: { id: id }
    })
  }
  return ret.data.data
}

const registerAccounts = uid => {
  let payload = {
    user_id: uid,
    provider: 'google'
  }
  payload.id = md5(`${payload}_${new Date()}`)
  axios.post(process.env.API_SERVER, {
    key: 'xxxx0987',
    type: 'insertOne',
    collection: 'accounts',
    find: { user_id: uid },
    payload: payload
  })
}

const registerpermissions = (uid, pulisher_id, property_id, roles) => {
  let payload = {
    user_id: uid,
    pub_id: pulisher_id,
    prop_id: property_id,
    roles: roles,
    status: 1
  }
//   payload.id = md5(`${payload}_${new Date()}`)
//   payload.id = md5(payload)
  axios.post(process.env.API_SERVER, {
    key: 'xxxx0987',
    type: 'insertOne',
    collection: 'permissions',
    find: { user_id: uid, pub_id: pulisher_id, prop_id: property_id, },
    payload: payload
  })
}
