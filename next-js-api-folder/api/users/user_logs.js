const axios = require('axios')

require('dotenv').config()

const getUserLog = async (req, res) => {

	const { user } = req.query

	if(!user){ return res.json({ status:'ko', data:[]}) }

	const ret = await axios.post(process.env.API_SERVER, {
		key: process.env.API_KEY,
		type: 'find',
		collection: 'users_act',
		find: {user},
		sort: { date_pub: -1 }
	})
	// console.log('getUserLog()', ret.data, find)
	res.json(ret.data.data)

}

export default getUserLog