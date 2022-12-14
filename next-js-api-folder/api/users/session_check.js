const axios = require('axios')

require('dotenv').config()

const sessionCheck = async (req, res) => {

	const { eid, user } = req.body

	let payload = {}
	const find = { $text: { $search: '"/edit/' + eid + '"' } }
	const ret = await axios.post(process.env.API_SERVER, {
		key: process.env.API_KEY,
		type: 'find',
		collection: 'users_session',
		find,
	})
	// console.log('sessionCheck()', ret.data, find)
	if (ret.data.data.length > 0) {
		ret.data.data.map(item => {

			if (item.user !== user) {
				payload = {
					user: item.user,
					date_pub: item.date_pub,
					date_pubh: item.date_pubh,
					status: item.status
				}
			}
		})
	}
	console.log(ret.data.data)
	console.log('payload', payload)
	res.json(payload)

}

export default sessionCheck