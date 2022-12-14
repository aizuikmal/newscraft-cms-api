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

const pub_id = '7036ebfcf43a34133adxxxxxxxxx1d747229412b71d3cf'

const prop_id = {
	'en': '3304c75xxxxxxxxx5629cbdac80f05ade357',
	'my': 'F7BF63A7xxxxxxxxx4CE215CC05E61A8695BECDE3C0806F18EA3',
	'zh': '57CFB13FD7xxxxxxxxxA1DF51D8B9957EFA5B18B28B2',
}

const run = async (req, res) => {

	const ret = await axios.post(API_SERVER, {
		key: process.env.API_KEY,
		type: 'find',
		collection: 'entry',
		limit: 11,
		skip: 280,
		sort: { date_pub: 1 },
		find: {
			property_id:"xxxxxxxxx",
			date_pub: { $gt:1643731200, $lt:1644336000 },
			status: 1
		}
	})

	let out = ''
	ret.data.data.map((story, index) => {

		console.log('story',index + '. ' + dayjs.unix(story.date_pub).format('D-MMM') + ' - ' + story.title + ' - ' + story.sid)

		axios({
			method: 'post',
			url: `https://xxxxxxxxx5af5d670431d747229412b71d3cf/${story.id}/_update`,
			headers: { 'x-api-key': 'xxxxxxxxx' },
			data: story
		  })
			.then(function (response) {
			  
			})
			.catch(function (error) {
			  console.error('webhook error', error)
			  // TODO: mechanism to log error, and alert on UI
			  // ...
			})


		// if (user.property_id !== 'my') {
		// 	console.log(user.property_id, user.email)

			// const payload = {
			// 	"user_id": user.id,
			// 	"pub_id": "7036ebfcf43a34133adef1434c6e6797d5b05af5d670431d747229412b71d3cf",
			// 	"prop_id": prop_id[user.property_id],
			// 	"roles": ["200ceb26807d6bf99fd6f4f0d1ca54d4"],
			// 	"status": 1
			// }

			// out += JSON.stringify(payload)
			// out += "\n\n"

		// }

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