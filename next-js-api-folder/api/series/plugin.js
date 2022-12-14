import axios from 'axios'
import dayjs from 'dayjs'
import {
  FiEdit2,
  FiArrowRight,
  FiChevronRight,
  FiLoader,
  FiPlus,
  FiArrowUp,
  FiTrash,
  FiExternalLink,
  FiRefreshCw
} from 'react-icons/fi'

require('dotenv').config()
const API_SERVER = process.env.API_SERVER

export default async (req, res) => {
  
  const ret = {
    commentNum: {
      icon: <FiPlus />,
      data: [1, 5, 65, 24, 14, 65, 78, 324, 542, 32, 5, 56]
    },
  
    friendNum: {
      icon: <FiArrowUp />,
      data: [4, 89, 38, 24, 14, 65, 78, 324, 542, 32, 5, 56]
    },

    subsNum: {
      type: 'info',
      icon: <FiTrash />,
      data: [5, 42, 90, 24, 14, 65, 78, 324, 542, 32, 5, 56]
    },

    sendPush: {
      type: 'button',
      icon: <FiTrash />,
      html: '<span id="pushnoti_${eid}"></span>',
      script: 'https://xxxxxxxxx/newscraft_include_script'
    }
  }

  res.json(ret)

}
