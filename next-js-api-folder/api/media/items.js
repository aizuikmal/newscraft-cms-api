import axios from 'axios';

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {

    const { category, page, limit, search, search_operator = 'AND' } = req.query

    const active_pub = req.cookies['_nc_active_publisher']

    const find = { status : 1, publisher_id: active_pub }
    if(category && category !== 'all'){
        find['category'] = parseInt(category)
    }

    if(search === 'false' || search === ''){}else{
        if(search_operator == 'AND'){
            const search_arr = search.split(' ')

            let g = ''
            search_arr.map(item => {
                if(item.substring(0,1) === '-'){
                    g += `-"${item.substring(1)}" `
                }else{
                    g += `"${item}" `
                }
            })
            // console.log(g)

            // const search_joined = '"' + search_arr.join('" "') + '"'
            find['$text'] = { '$search': ` ${g} ` }
        }
        if(search_operator == 'OR'){
            find['$text'] = { '$search': search }
        }
    }

    let skip = 0
    skip = page > 0 ? page * limit : 0

    console.log('find', find)

    const ret = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        db: 'assets',
        type: 'find',
        collection: 'assets',
        find,
        limit : limit <= 101 ? limit : 100, //limit item req to max 100 only.
        skip,
        sort : {date_pub:-1}
    })

    const ret_total = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        db: 'assets',
        type: 'count',
        collection: 'assets',
        find
    })

    res.json({items:ret.data, total:ret_total.data})
}