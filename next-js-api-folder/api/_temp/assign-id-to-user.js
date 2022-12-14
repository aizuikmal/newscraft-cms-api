/*
aizu-20220206
1. assign md5 to id for each user
2. add the new user, add into permission collection, based on lang slug

*/


import axios from 'axios'
import md5 from 'md5'
import dayjs from 'dayjs'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

const pub_id = 'xxxxxxxxx'

const prop_id = {
	'en': '3304c750d8xxxxxxxxxc44051c3669785629cbdac80f05ade357',
	'my': 'F7BF63A74F5Dxxxxxxxxx05E61A8695BECDE3C0806F18EA3',
	'zh': '57CFB13FD747D3CAAxxxxxxxxxDF51D8B9957EFA5B18B28B2',
}

const run = async (req, res) => {

	const ret = await axios.post(API_SERVER, {
		key: process.env.API_KEY,
		type: 'find',
		collection: 'users',
		find: {}
	})

	let out = ''
	ret.data.data.map(user => {

		if (user.property_id !== 'my') {
			console.log(user.property_id, user.email)

			// const payload = {
			// 	"user_id": user.id,
			// 	"pub_id": "7036ebfcf43a34133adef1434c6e6797d5b05af5d670431d747229412b71d3cf",
			// 	"prop_id": prop_id[user.property_id],
			// 	"roles": ["200ceb26807d6bf99fd6f4f0d1ca54d4"],
			// 	"status": 1
			// }

			// out += JSON.stringify(payload)
			// out += "\n\n"

		}

	})

	res.send(out)


	// ret.data.data.map(user => {
	// 	if (!user.id) {
	// 		console.log(user.email)
	// 		axios.post(API_SERVER, {
	// 			key: process.env.API_KEY,
	// 			type: 'updateOne',
	// 			collection: 'users',
	// 			payload: { id: md5(user.email + dayjs().format()) },
	// 			find: { email: user.email }
	// 		})
	// 	}
	// })



	// res.send('ok')

}

export default run