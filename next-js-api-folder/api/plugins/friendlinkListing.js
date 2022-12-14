import axios from 'axios'

const friendlinkListing = async (req, res) => {
  try {
    console.log('KOLO')
    const listings = await axios.get('https://xxxxxxxxx/listing')
    res.json({ listings: listings.data })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ listings: [] })
  }
}

export default friendlinkListing