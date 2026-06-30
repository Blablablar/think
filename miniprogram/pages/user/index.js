// pages/user/index.js
const { callFunction, showToast } = require('../../utils/cloud.js')
const { formatTime } = require('../../utils/util.js')
const { PAGE_SIZE } = require('../../utils/constants.js')

Page({
  data: {
    openid: '',
    userInfo: null, // { nickName, avatarUrl, createdAt, creativityCount, followerCount, isFollowing }
    list: [],
    page: 1,
    hasMore: true,
    loading: false,
    refreshing: false,
    myOpenid: '',
    isSelf: false
  },

  onLoad(options) {
    const app = getApp()
    const myOpenid = (app.globalData && app.globalData.openid) || ''
    this.setData({ myOpenid })

    if (!options || !options.openid) {
      showToast('参数缺失')
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const targetOpenid = options.openid
    this.setData({
      openid: targetOpenid,
      isSelf: myOpenid === targetOpenid
    })

    this.loadAll()
  },

  async loadAll() {
    await Promise.all([
      this.loadUserInfo(),
      this.loadCreativities(true)
    ])
  },

  async loadUserInfo() {
    try {
      const data = await callFunction('getUserInfo', { openid: this.data.openid })
      this.setData({
        userInfo: data ? {
          ...data,
          joinDate: formatTime(data.createdAt)
        } : null
      })
    } catch (err) {
      console.error('[User] loadUserInfo failed:', err)
      showToast('加载失败')
    }
  },

  async loadCreativities(reset = false) {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const page = reset ? 1 : this.data.page
      const res = await callFunction('getUserCreativities', {
        openid: this.data.openid,
        page,
        pageSize: PAGE_SIZE
      })
      const newList = (res.list || []).map(c => ({
        ...c,
        date: formatTime(c.createdAt)
      }))
      const list = reset ? newList : [...this.data.list, ...newList]
      this.setData({
        list,
        page: reset ? 1 : page + 1,
        hasMore: !!res.hasMore
      })
    } catch (err) {
      console.error('[User] loadCreativities failed:', err)
      showToast('加载失败')
    } finally {
      this.setData({ loading: false, refreshing: false })
    }
  },

  async onPullDownRefresh() {
    this.setData({ refreshing: true })
    await this.loadAll()
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadCreativities(false)
    }
  },

  // 关注/取消关注
  async onToggleFollow() {
    const { userInfo, openid } = this.data
    if (!userInfo) return
    const prev = { isFollowing: userInfo.isFollowing, followerCount: userInfo.followerCount }
    // 乐观更新
    this.setData({
      userInfo: {
        ...userInfo,
        isFollowing: !userInfo.isFollowing,
        followerCount: userInfo.isFollowing
          ? Math.max(0, userInfo.followerCount - 1)
          : userInfo.followerCount + 1
      }
    })
    try {
      const res = await callFunction('toggleFollow', { targetOpenid: openid })
      // 用服务端返回的状态校正
      this.setData({
        userInfo: {
          ...this.data.userInfo,
          isFollowing: res.isFollowing
        }
      })
      showToast(res.isFollowing ? '已关注' : '已取消', 'success')
    } catch (err) {
      console.error('[User] toggleFollow failed:', err)
      this.setData({
        userInfo: { ...this.data.userInfo, ...prev }
      })
      showToast(err.message || '操作失败')
    }
  },

  onTagClick(e) {
    const { tag } = e.detail
    wx.navigateTo({ url: `/pages/tag/index?tag=${tag}` })
  },

  onCardClick(e) {
    const { id } = e.detail
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` })
  },

  async onLike(e) {
    const { id } = e.detail
    const list = this.data.list.map(c => {
      if (c._id === id) {
        return {
          ...c,
          isLiked: !c.isLiked,
          likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1
        }
      }
      return c
    })
    this.setData({ list })
    try {
      await callFunction('toggleLike', { creativityId: id, type: 'like' })
    } catch (err) {
      console.error('[User] toggleLike failed:', err)
    }
  },

  async onDislike(e) {
    const { id } = e.detail
    const list = this.data.list.map(c => {
      if (c._id === id) {
        return {
          ...c,
          isDisliked: !c.isDisliked,
          dislikeCount: c.isDisliked ? c.dislikeCount - 1 : c.dislikeCount + 1
        }
      }
      return c
    })
    this.setData({ list })
    try {
      await callFunction('toggleLike', { creativityId: id, type: 'dislike' })
    } catch (err) {
      console.error('[User] toggleDislike failed:', err)
    }
  },

  onShareAppMessage() {
    const u = this.data.userInfo
    return {
      title: u ? `${u.nickName || '微信用户'} 的创意主页` : '灵光 - 用户主页',
      path: `/pages/user/index?openid=${this.data.openid}`
    }
  },

  onShareTimeline() {
    return { title: '灵光 - 用户主页' }
  }
})
