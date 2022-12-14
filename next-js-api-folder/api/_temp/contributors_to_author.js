import axios from 'axios'

require('dotenv').config()

const desk = ['English Desk', 'Chinese Desk', 'BM Desk']
const pub_id = '7036ebfcfxxxxxxxxxxxx229412b71d3cf'
const prop_id = {
  en: '3304c750d8ae08111xxxxxxxxxxxxxxxx5629cbdac80f05ade357',
  my: 'F7BF63A74F5D77xxxxxxxxxxxxxxxxxECDE3C0806F18EA3',
  zh: '57CFB13FD747D3CAxxxxxxxxxxxxxxxxFA5B18B28B2'
}

const run = async (req, res) => {
  const ret = await axios.post(process.env.API_SERVER, {
    key: process.env.API_KEY,
    type: 'find',
    collection: 'contributors',
    find: {
      'desk.0': 'English Desk'
    },
    limit: 105
  })
  ret.data.data.map(user => {
    migrate_author(user)
  })
  res.send(ret.data)
}
const migrate_author = async user => {
  const ret = await axios.post(process.env.API_SERVER, {
    key: process.env.API_KEY,
    type: 'find',
    collection: 'authors',
    find: {
      name: user.author,
      status: 1
    }
  })
  const payload = {
    id: ret.data.data.length ? ret.data.data[0].id : user._id || 'no id',
    publisher_id: pub_id,
    property_id: prop_id.en, //change id
    name: user.author,
    email: user.email || '',
    bank_name: user.bankName,
    bank_account_name: user.bankAccountName,
    bank_account_number: user.bankAccountNumber,
    payment_rate: user.paymentRate,
    status: 1
  }
  // const ret2 = await axios.post(process.env.API_SERVER, {
  //   key: process.env.API_KEY,
  //   type: 'updateOne',
  //   upsert: true,
  //   collection: 'authors',
  //   payload: payload,
  //   find: {
  //     id: payload.id
  //   }
  // })
}
export default run
