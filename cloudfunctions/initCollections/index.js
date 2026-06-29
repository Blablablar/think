// 初始化数据库集合
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const collections = [
    'users',
    'creativities',
    'userLikes',
    'comments',
    'claims',
    'implementations',
    'implLikes',
    'notifications',
    'favorites',
    'follows'
  ]
  const results = []
  for (const name of collections) {
    try {
      await db.createCollection(name)
      results.push({ name, success: true, message: 'created' })
    } catch (err) {
      // 集合已存在也算成功
      if (err.message && err.message.indexOf('already exists') !== -1) {
        results.push({ name, success: true, message: 'already exists' })
      } else {
        results.push({ name, success: false, error: err.message })
      }
    }
  }
  return { code: 0, message: 'ok', data: results }
}
