import axios from 'axios'
require('dotenv').config()

export default async (req, res) => {
  const { uid, publisher_id, property_id } = req.body
  try {
    const user = await axios.post(process.env.API_SERVER, {
      key: 'xxxx0987',
      type: 'findOne',
      collection: 'users',
      find: { id: uid }
    })
    const permissions = await axios.post(process.env.API_SERVER, {
      key: 'xxxx0987',
      type: 'findOne',
      collection: 'permissions',
      find: { user_id: uid, pub_id: publisher_id, prop_id: property_id }
    })
    
    const roles = await axios.post(process.env.API_SERVER, {
      key: 'xxxx0987',
      type: 'find',
      collection: 'roles',
      projection: { id: 1, name: 1, description: 1 },
      find: { id: { $in: permissions.data.data ? permissions.data.data.roles : [] } }
    })

    const payload = {
      user: user.data?.data || [],
      roles: roles.data?.data || []
    }

    res.status(200).json(payload)
  } catch (error) {
    res.status(500).json(error)
  }
}
