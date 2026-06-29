// pages/hot/index.js
const { callFunction, showToast } = require('../../utils/cloud.js')
const { PAGE_SIZE } = require('../../utils/constants.js')

Page({
  data: {
    list: [],
    page: 1,
    hasMore: true,
    loading: false,
    refreshing: false,
    maxHot: 1
  },

  onLoad() {
    this.loadData(true)
  },

  async loadData(reset = false) {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const page = reset ? 1 : this.data.page
      const res = await callFunction('getHotList', { page, pageSize: PAGE_SIZE })
      const newList = res.list || []
      const allList = reset ? newList : [...this.data.list, ...newList]
      const maxHot = allList.length > 0 ? allList[0].likeCount : 1

      this.setData({
        list: allList,
        page: reset ? 1 : page + 1,
        hasMore: res.hasMore,
        maxHot
      })
    } catch (err) {
      console.error('[Hot] loadData failed:', err)
      showToast('加载失败')
    } finally {
      this.setData({ loading: false, refreshing: false })
    }
  },

  async onPullDownRefresh() {
    this.setData({ refreshing: true })
    await this.loadData(true)
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadData()
    }
  },

  async onLike(e) {
    const { id } = e.detail
    try {
      await callFunction('toggleLike', { creativityId: id, type: 'like' })
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
    } catch (err) {
      console.error('[Hot] toggleLike failed:', err)
    }
  },

  async onDislike(e) {
    const { id } = e.detail
    try {
      await callFunction('toggleLike', { creativityId: id, type: 'dislike' })
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
    } catch (err) {
      console.error('[Hot] toggleDislike failed:', err)
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

  onShareAppMessage() {
    return {
      title: '灵光 - 热门创意排行',
      path: '/pages/hot/index'
    }
  },

  onShareTimeline() {
    return { title: '灵光 - 热门创意排行' }
  }
})
