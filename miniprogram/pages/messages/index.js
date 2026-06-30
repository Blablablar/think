// pages/messages/index.js
const { callFunction, showToast } = require('../../utils/cloud.js')
const { formatTime } = require('../../utils/util.js')
const { PAGE_SIZE } = require('../../utils/constants.js')

Page({
  data: {
    list: [],
    page: 1,
    hasMore: true,
    loading: false,
    refreshing: false
  },

  onLoad() {
    this.loadData(true)
  },

  onShow() {
    // 每次显示时刷新首屏，同步未读
    if (this.data.list.length > 0) {
      this.loadData(true)
    }
  },

  async loadData(reset = false) {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const page = reset ? 1 : this.data.page
      const res = await callFunction('getNotifications', { page, pageSize: PAGE_SIZE })
      const newList = (res.list || []).map(n => ({
        ...n,
        date: formatTime(n.createdAt),
        // 通知文案与图标
        icon: this.getNotifIcon(n.type),
        text: this.getNotifText(n.type)
      }))
      const list = reset ? newList : [...this.data.list, ...newList]
      this.setData({
        list,
        page: reset ? 1 : page + 1,
        hasMore: !!res.hasMore
      })
    } catch (err) {
      console.error('[Messages] loadData failed:', err)
      showToast('加载失败')
    } finally {
      this.setData({ loading: false, refreshing: false })
    }
  },

  getNotifIcon(type) {
    switch (type) {
      case 'claim': return '🎯'
      case 'follow': return '👥'
      case 'comment_reply': return '💬'
      case 'video_review': return '🎬'
      default: return '🔔'
    }
  },

  getNotifText(type) {
    switch (type) {
      case 'claim': return '认领了你的创意'
      case 'follow': return '关注了你'
      case 'comment_reply': return '回复了你的评论'
      case 'video_review': return '视频审核结果通知'
      default: return '收到一条新消息'
    }
  },

  async onPullDownRefresh() {
    this.setData({ refreshing: true })
    await this.loadData(true)
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadData()
    }
  },

  // 点击单条通知：标记已读 + 跳转
  async onItemClick(e) {
    const { id, creativityid, type } = e.currentTarget.dataset
    const item = this.data.list.find(n => n._id === id)
    if (item && !item.isRead) {
      // 乐观更新
      this.setData({
        list: this.data.list.map(n => n._id === id ? { ...n, isRead: true } : n)
      })
      try {
        await callFunction('markNotificationRead', { id })
      } catch (err) {
        console.error('[Messages] markRead failed:', err)
      }
    }

    if (creativityid) {
      wx.navigateTo({ url: `/pages/detail/index?id=${creativityid}` })
    } else if (type === 'follow') {
      // 关注通知暂无跳转目标
    }
  },

  // 全部标记已读
  async onMarkAllRead() {
    if (this.data.list.every(n => n.isRead)) {
      showToast('没有未读消息')
      return
    }
    try {
      await callFunction('markNotificationRead', { all: true })
      showToast('已全部标记已读', 'success')
      this.setData({
        list: this.data.list.map(n => ({ ...n, isRead: true }))
      })
    } catch (err) {
      console.error('[Messages] markAllRead failed:', err)
      showToast('操作失败')
    }
  }
})
