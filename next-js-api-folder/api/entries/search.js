import axios from 'axios'

export default async (req, res) => {
  try {
    const { payload } = req.body
    const { publisher_id, property_id, type, value, date_start, date_end } = payload
    console.log(payload, 'Load /api/entries/search')

    const limit = 100
    const skip = 0
    const find = type === 'keyword' ? 'search' : 'stories'

    const query = `
    query get($publisher_id: String, $property_id: String) {
      ${find}(
        first: ${limit},
        skip: ${skip},
        publisher_id: $publisher_id,
        property_id: $property_id,
        ${type}: "${value.trim()}"
        ${type === 'keyword' && date_start ? 'date_pub_from: ' + date_start : ''}
        ${type === 'keyword' && date_end ? 'date_pub_to: ' + date_end : ''}
        ${type === 'tag' && date_start && date_end ? 'date_pub_range: "' + date_start + '-' + date_end + '"' : ''}
        ${type === 'tag' ? 'bypass_cache_key: "xxxxxxxxx"' : ''}
      ) {
        id
        title
        sid
        image_feat
        image_feat_single
        summary
        author
        author_str
        date_pub
        date_pub2
        date_pubh
        category
        comment_count
        search_total
        language
      }
    }
  `
    const variables = {
      publisher_id,
      property_id
    }
    const response = await axios.post('https://xxxxxxxxx/graphql', {
      query,
      variables
    })
    res.json({ status: 'ok', data: response.data.data.search || response.data.data.stories, message: 'ok' })
  } catch (error) {
    console.log(error.message, 'API/ENTRIES/SEARCH_GRAPH_API')
    res.status(500).json({ status: 'errored', data: [], message: error.message })
  }
}
