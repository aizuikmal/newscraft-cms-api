import axios from 'axios'

require('dotenv').config()

export default async (req, res) => {
  const { user_id, super_admin = 0 } = req.body
  try {
    const ret = await axios.post(`${process.env.API_ENDPOINT}/user/permission`, {
      user_id: user_id,
      super_admin: super_admin
    })
    const permission_data = ret.data
    // const ret = await axios.post(process.env.API_SERVER, {
    //   key: 'xxxx0987',
    //   type: 'find',
    //   collection: 'permissions',
    //   find: { user_id: user_id, status: 1 }
    // })
    // const permissions = ret.data.data
    // const permission_data = await getPermissions(
    //   permissions,
    //   user_id,
    //   super_admin
    // )
    res.status(200).json(permission_data)
  } catch (error) {
    res.status(500).json(error)
  }
}

const getPermissions = async (permissions, user_id, super_admin) => {
  // super_admin = 0
  if (!permissions.length) {
    return []
  }
  let payload = {}
  payload.publishers = await getPublishers(permissions, super_admin)
  payload.properties = await getProperties(permissions, super_admin)
  return payload
}

const getPublishers = async (permissions, super_admin) => {
  let payload = []
  let options = {
    key: 'xxxx0987',
    type: 'find',
    collection: 'publishers',
    find: { status: 1 },
    sort: { lang: 1 }
  }
  if (!super_admin) {
    payload = await Promise.all(
      permissions.map(async perms => {
        options.type = 'findOne'
        options.find.id = perms.pub_id
        const publisher = await axios.post(process.env.API_SERVER, options)
        return publisher.data.data
      })
    )
    payload = [...new Map(payload.map(item => [item['id'], item])).values()]
  } else {
    const publishers = await axios.post(process.env.API_SERVER, options)
    payload = publishers.data.data
  }
  return payload
}

const getProperties = async (permissions, super_admin) => {
  let payload = []
  let options = {
    key: 'xxxx0987',
    type: 'find',
    collection: 'properties',
    find: {},
    sort: { lang: 1 }
  }
  if (!super_admin) {
    payload = await Promise.all(
      permissions.map(async perms => {
        options.type = 'findOne'
        options.find.id = perms.prop_id
        options.find.pub_id = perms.pub_id
        const property = await axios.post(process.env.API_SERVER, options)
        return property.data.data
      })
    )
  } else {
    const properties = await axios.post(process.env.API_SERVER, options)
    payload = properties.data.data
  }
  return payload
}
