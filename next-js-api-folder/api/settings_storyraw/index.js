import axios from 'axios'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import md5 from 'md5'
import slugify from 'slugify'
import _ from 'lodash'

const beautify_js = require('js-beautify')

const fs = require('fs')

const BACKUP_COPIES_TMP = '/tmp/nc_backup_posts'
const BACKUP_COPIES_FILE_PREFIX = 'nc_backup_post'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {

  const cookies = parseCookies({ req })
  const property_id = cookies['_nc_active_property'] || '3304c7xxxxxxxxx80f05ade357'
  const publisher_id = cookies['_nc_active_publisher'] || '7036xxxxxxxxxb71d3cf'

  if (req.query.key) {

    let key = req.query.key
    key = key.replace(' 08:00', '+08:00')
    key = key.replace(' 00:00', '+00:00')

    const filename = `${BACKUP_COPIES_TMP}/${property_id}/${BACKUP_COPIES_FILE_PREFIX}}-{${property_id}}-{${key}.json`
    var text = fs.readFileSync(filename, 'utf8')

    if (req.query?.view === 'html') {

      render_html(text, filename, res, key)

    } else if (req.query?.view === 'json') {

      render_json(text, filename, res, key)

    } else {

      render_default(text, filename, res, key)

    }

  } else {

    const items = []


    if (!fs.existsSync(`${BACKUP_COPIES_TMP}/${property_id}`)) {
      res.json({ status: 'ok', space_used: 0, data: [] })
      return
    }

    const basePath = BACKUP_COPIES_TMP + '/' + property_id
    const directoryContent = fs.readdirSync(basePath)
    console.log('directoryContent', directoryContent)

    let space_used = 0 //bytes

    let files = directoryContent.filter((filename) => {
      return fs.statSync(`${basePath}/${filename}`).isFile();
    });

    let sorted = files.sort((a, b) => {
      let aStat = fs.statSync(`${basePath}/${a}`),
        bStat = fs.statSync(`${basePath}/${b}`);

      return new Date(bStat.birthtime).getTime() - new Date(aStat.birthtime).getTime();
    });

    sorted.map(file => {
      if (file.substring(0, BACKUP_COPIES_FILE_PREFIX.length) === BACKUP_COPIES_FILE_PREFIX) {
        if (file.substring(0, `nc_backup_post}-{${property_id}}-{`.length) === `nc_backup_post}-{${property_id}}-{`) {
          let item = file.substring(`nc_backup_post}-{${property_id}}-{`.length)
          item = item.substring(0, item.length - 5)
          const item_arr = item.split('}-{')
          items.push(item_arr)

          const stats = fs.statSync(`${basePath}/${file}`)
          space_used += stats.size
        }
      }
    })


    res.json({ status: 'ok', space_used, data: items })

  }

}


const render_default = (text, filename, res, key) => {

  const return_pl = `
    ${filename}
    <hr />
    <a href="/api/settings_storyraw?key=${key}&view=html" target="_blank">View in HTML rendered</a> |
    <a href="/api/settings_storyraw?key=${key}&view=json" target="_blank">View in JSON</a>
    <hr />
    ${text}
`
  res.setHeader('content-type', 'text/html;charset=utf-8')
  res.setHeader('content-encoding', 'utf-8')
  res.send(return_pl)

}


const render_json = (text, filename, res, key) => {

  const data = JSON.parse(text)

  // res.send(beautify_js(text))

  res.setHeader('content-encoding', 'utf-8')
  res.json(data)

}


const render_html = (text, filename, res, key) => {

  const data = JSON.parse(text)

  let return_pl = ``

  Object.keys(data).map(key => {
    const r = data[key]

    if (key === 'full_content') {
      return_pl += `${key} : ${r}`
    } else {

      return_pl += `${key} : ${JSON.stringify(r)}`
    }


    if (key === 'images') {
      return_pl += '<br />'
      r.map(image => {
        return_pl += `<img width="300" src="${image.filename}" />&nbsp;`
      })
    }

    if (key === 'image_feat') {
      return_pl += '<br />'
      r.map(image => {
        return_pl += `<img width="300" src="${image}" />&nbsp;`
      })

    }

    return_pl += `<hr />`

  })

  res.setHeader('content-type', 'text/html;charset=utf-8')
  res.setHeader('content-encoding', 'utf-8')
  res.send(return_pl)

}