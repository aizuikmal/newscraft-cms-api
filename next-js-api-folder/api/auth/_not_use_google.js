import axios from 'axios';
const { OAuth2Client } = require('google-auth-library')

require('dotenv').config()

const API_SERVER = process.env.API_SERVER
const client = new OAuth2Client(process.env.CLIENT_ID)

const google = async (req, res) => {

    const { token }  = req.body
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    const { sub: gid, name, email, email_verified, picture, given_name, family_name, locale } = ticket.getPayload();

    const method = 'google'

    try {
        const ret = await axios.post(API_SERVER, {
            key: "xxxx0987",
            type: 'findOne',
            collection: 'accounts',
            find: { method, email: email }
        })
        req.session.userId = ret.data.id
        res.status(201).json(ret)
    } catch (error) {
        res.status(500).json(error)
    }

}

export default google