const axios = require('axios')

require('dotenv').config()

const sessionCheck = async (req, res) => {

	const { sortby } = req.query

	let sort = { date_pub: -1 }
	if (sortby == 'user') {
		sort = { user: 1 }
	}

	const ret = await axios.post(process.env.API_SERVER, {
		key: process.env.API_KEY,
		type: 'find',
		collection: 'users_session',
		find: {},
		sort
	})
	// console.log('sessionCheck()', ret.data, find)
	res.json(ret.data.data)

}

export default sessionCheck