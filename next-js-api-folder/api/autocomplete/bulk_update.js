import axios from 'axios'

const BulkUpdate = (req, res) => {

	// console.log(req.body)

	const pl = {
		yournewtag: req.body.yournewtag,
		dataRows: JSON.stringify(req.body.dataRows)
	}
	if(req.body.removetag){
		pl['removetag'] = req.body.removetag
	}

	// console.log(pl)

	const ret = axios.post('http://xxxxxxxxx/update_remove_old_tag', pl,
	// { headers: { 'Authorization': + 'Basic ' + btoa('usertag:tag02519') } }
	{
	  auth: { username: 'xxxxxxxxx', password: 'xxxxxxxxx' },
	  headers: { "Content-Type": "application/json" }
	}
	)


	res.send('ok')

}

export default BulkUpdate