import axios from 'axios'

const GraphData = async (req, res) => {

	const url = `https://xxxxxxxxx/graph_data/${req.query.segment}`

	const ret = await axios.get(url)

	res.json(ret.data)

}

export default GraphData