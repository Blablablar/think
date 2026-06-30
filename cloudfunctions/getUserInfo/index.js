const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext()
    const { openid } = event

    if (!openid) {
      return { code: -1, message: '缺少 openid 参数', data: null }
    }

    const users = db.collection('users')
    const creativities = db.collection('creativities')
    const follows = db.collection('follows')

    const userRes = await users.where({ openid: openid }).get()
    let userInfo = {}
    if (userRes.data && userRes.data.length > 0) {
      const u = userRes.data[0]
      userInfo = {
        nickName: u.nickName,
        avatarUrl: u.avatarUrl,
        createdAt: u.createdAt
      }
    }

    const creaCount = await creativities.where({ openid: openid }).count()
    const followerCount = await follows.where({ following: openid }).count()

    const isFollowedRes = await follows.where({
      follower: OPENID,
      following: openid
    }).get()
    const isFollowing = isFollowedRes.data && isFollowedRes.data.length > 0

    return {
      code: 0,
      message: 'ok',
      data: {
        ...userInfo,
        openid,
        creativityCount: creaCount.total,
        followerCount: followerCount.total,
        isFollowing
      }
    }
  } catch (err) {
    return { code: -1, message: String(err.message || err), data: null }
  }
}
