import axios from 'axios'
require('dotenv').config()

export default async (req, res) => {
  const { publisher_id, property_id } = req.query
  const { id, name, email, status, phone, roles } = req.body
  try {
    const ret = await axios.post(process.env.API_SERVER, {
      key: 'xxxx0987',
      type: 'updateOne',
      collection: 'users',
      find: { id: id },
      payload: {
        id: id,
        name: name,
        email: email,
        // status: parseInt(status),
        phone: phone
        // super_admin: 0
      },
      upsert: true
    })

    axios.post(process.env.API_SERVER, {
      key: 'xxxx0987',
      type: 'updateOne',
      collection: 'permissions',
      find: { user_id: id, pub_id: publisher_id, prop_id: property_id },
      payload: {
        roles: roles,
        status: parseInt(status)
      },
      upsert: true
    })
    res.status(200).json(ret.data)
  } catch (error) {
    res.status(500).json(error)
  }
}
