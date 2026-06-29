// pages/today/index.js
const { callFunction, showToast } = require('../../utils/cloud.js')
const { getTodayChinese } = require('../../utils/util.js')
const { PAGE_SIZE } = require('../../utils/constants.js')

Page({
  data: {
    list: [],
    page: 1,
    hasMore: true,
    loading: false,
    refreshing: false,
    today: ''
  },

  onLoad() {
    this.setData({ today: getTodayChinese() })
    this.loadData(true)
  },

  async loadData(reset = false) {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const page = reset ? 1 : this.data.page
      const res = await callFunction('getTodayList', { page, pageSize: PAGE_SIZE })
      const newList = res.list || []

      this.setData({
        list: reset ? newList : [...this.data.list, ...newList],
        page: reset ? 1 : page + 1,
        hasMore: res.hasMore
      })
    } catch (err) {
      console.error('[Today] loadData failed:', err)
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
      console.error('[Today] toggleLike failed:', err)
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
      console.error('[Today] toggleDislike failed:', err)
    }
  },

  async onFavorite(e) {
    const { id } = e.detail
    try {
      await callFunction('toggleFavorite', { creativityId: id })
      const list = this.data.list.map(c => {
        if (c._id === id) {
          return {
            ...c,
            isFavorited: !c.isFavorited,
            favoriteCount: c.isFavorited ? c.favoriteCount - 1 : c.favoriteCount + 1
          }
        }
        return c
      })
      this.setData({ list })
    } catch (err) {
      console.error('[Today] toggleFavorite failed:', err)
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

  onSearchClick() {
    wx.navigateTo({ url: '/pages/search/index' })
  },

  onShareAppMessage() {
    return {
      title: '灵光 - 发现今日创意灵感',
      path: '/pages/today/index'
    }
  },

  onShareTimeline() {
    return { title: '灵光 - 发现今日创意灵感' }
  }
})
