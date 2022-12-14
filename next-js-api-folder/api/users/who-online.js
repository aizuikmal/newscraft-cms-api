const axios = require('axios')
const dayjs = require('dayjs')

const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

require('dotenv').config()

export default async (req, res) => {

	const active_pub = req.cookies['_nc_active_publisher']

	const find = { page: { $ne: null }, publisher_id:active_pub }

	const dic_user = {}
	const ret_dic_user = await axios.post(process.env.API_SERVER, {
		key: process.env.API_KEY,
		type: 'find',
		collection: 'users',
		find: { status: 1 },
		limit: 200
	})
	ret_dic_user.data.data.map(item => {
		dic_user[item.email] = item
	})

	const dic_property = {}
	const ret_dic_property = await axios.post(process.env.API_SERVER, {
		key: process.env.API_KEY,
		type: 'find',
		collection: 'properties',
		find: {},
	})
	ret_dic_property.data.data.map(item => {
		dic_property[item.id] = item
	})

	const ret = await axios.post(process.env.API_SERVER, {
		key: process.env.API_KEY,
		type: 'find',
		collection: 'users_session',
		find,
		limit: 100,
		sort: { date_pub: -1 }
	})

	const payload = {}
	ret.data.data.map(item => {
		if (!payload[item.user]) {
			const d = {
				name: dic_user[item.user]?.name || item.user,
				email: item.user,
				image: dic_user[item.user]?.image || '',
				page: item.page,
				act: item.act,
				pub: active_pub,
				prop: item.property_id,
				status: item.status,
				lang: dic_property[item.property_id]?.lang?.toLowerCase() || '',
				lastActive: item.date_pub,
				lastActive_ago: dayjs.unix(item.date_pub).fromNow(),
			}
			payload[item.user] = d
		}
	})

	res.json({ status: 'ok', data: payload })

}
