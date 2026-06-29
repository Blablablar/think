// pages/recommend/index.js
const { callFunction } = require('../../utils/cloud.js')

Page({
  data: {
    list: [],
    shownIds: [],
    loading: false
  },

  onLoad() {
    this.loadData()
  },

  async loadData() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const res = await callFunction('getRecommendList', {
        shownIds: this.data.shownIds,
        pageSize: 3
      })
      const newList = res.list || []
      this.setData({
        list: newList,
        shownIds: [...this.data.shownIds, ...newList.map(c => c._id)]
      })
    } catch (err) {
      console.error('[Recommend] loadData failed:', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  async onLike(e) {
    const { id } = e.currentTarget.dataset
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
      console.error('[Recommend] toggleLike failed:', err)
    }
  },

  async onDislike(e) {
    const { id } = e.currentTarget.dataset
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
      console.error('[Recommend] toggleDislike failed:', err)
    }
  },

  onRefresh() {
    this.loadData()
  },

  onCardClick(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` })
  },

  onShareAppMessage() {
    return {
      title: '灵光 - 探索创意灵感',
      path: '/pages/recommend/index'
    }
  },

  onShareTimeline() {
    return { title: '灵光 - 探索创意灵感' }
  }
})
