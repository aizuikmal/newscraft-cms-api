import axios from 'axios'
import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

require('dotenv').config()

const API_SERVER = process.env.API_SERVER

export default NextAuth({
  site: process.env.NEXTAUTH_URL,
  providers: [
    Providers.Google({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET
    }),
    Providers.Credentials({
      async authorize (credentials) {
        try {
          const users = await axios.post(API_SERVER, {
            key: 'xxxx0987',
            type: 'findOne',
            collection: 'accounts',
            find: { status: 1, email: credentials.email }
          })
          if (!users) throw new Error('No user found')

          return users
        } catch (error) {
          throw new Error(error)
        }
      }
    })
  ],
  secret: process.env.SECRET,
  pages: {
    signIn: '/signIn',
    error: '/signIn'
  },
  session: { jwt: true },
  callbacks: {
    signIn: async (user, account, profile, credentials) => {
      const users = await axios.post(API_SERVER, {
        key: process.env.API_KEY,
        type: 'findOne',
        collection: 'users',
        find: { status: 1, email: profile.email }
      })

      user.id = users.data.data?.id
      user.email = users.data.data?.email
      user.data = users.data.data

      return users.data.data ? Promise.resolve(true) : Promise.resolve(false)
    },
    async jwt (token, user, account, profile, isNewUser) {
      if (account?.accessToken) {
        token.accessToken = account.accessToken
      }
      if (user?.data) {
        token.users = user.data
      }
      return token
    },
    session: async (session, user, token) => {
      const accounts = await axios.post(API_SERVER, {
        key: 'xxxx0987',
        type: 'findOne',
        collection: 'accounts',
        find: { user_id: user.sub }
      })

      session.accounts = accounts.data?.data
      session.user = user.users
      return Promise.resolve(session)
    },
    redirect: async (url, _) => {
      if (url === '/api/auth/signin') {
        return Promise.resolve('/publishers')
      }
      return Promise.resolve('/')
    }
  }
})
