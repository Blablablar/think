// pages/my/index.js
const { callFunction, showToast, showLoading, hideLoading } = require('../../utils/cloud.js')

Page({
  data: {
    hasLogin: false,
    userInfo: {},
    activeTab: 'published',
    interactionTab: 'liked',
    list: [],
    implList: [],
    loading: false,
    unreadCount: 0,
    publishedCount: 0,
    implCount: 0,
    likeCount: 0,
    tabs: [
      { key: 'published', label: '我发布的' },
      { key: 'implemented', label: '我实现的' },
      { key: 'interaction', label: '我的互动' },
      { key: 'favorites', label: '我的收藏' },
      { key: 'followed', label: '我关注的' }
    ]
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    if (this.data.hasLogin) {
      this.loadData()
      this.loadNotifications()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const app = getApp()
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.nickName && userInfo.nickName !== '微信用户') {
      this.setData({ hasLogin: true, userInfo })
    } else if (app.globalData.userInfo && app.globalData.userInfo.nickName !== '微信用户') {
      this.setData({ hasLogin: true, userInfo: app.globalData.userInfo })
    }
  },

  // 微信一键登录
  async onLogin(e) {
    // 兼容 getUserInfo 回调
    if (e.detail.errMsg && e.detail.errMsg.indexOf('deny') !== -1) {
      showToast('您取消了授权')
      return
    }

    // 优先使用 wx.getUserProfile（推荐方式，会弹窗确认）
    try {
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善个人资料',
        lang: 'zh_CN'
      })

      showLoading('登录中...')
      // 调用云函数更新用户资料
      await callFunction('updateUserProfile', {
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      })

      // 缓存用户信息
      const app = getApp()
      const newUserInfo = {
        ...app.globalData.userInfo,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      }
      app.globalData.userInfo = newUserInfo
      wx.setStorageSync('userInfo', newUserInfo)

      hideLoading()
      this.setData({ hasLogin: true, userInfo: newUserInfo })
      showToast('登录成功', 'success')

      // 登录后加载数据
      this.loadData()
      this.loadNotifications()
    } catch (err) {
      hideLoading()
      console.error('[My] login failed:', err)
      if (err.errMsg && err.errMsg.indexOf('deny') !== -1) {
        showToast('您取消了授权')
      } else {
        showToast('登录失败')
      }
    }
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      const { activeTab, interactionTab } = this.data

      if (activeTab === 'published') {
        const res = await callFunction('getMyCreativities', { page: 1, pageSize: 20 })
        this.setData({
          list: res.list || [],
          implList: [],
          publishedCount: res.total || 0
        })
      } else if (activeTab === 'implemented') {
        const res = await callFunction('getMyImplementations', { page: 1, pageSize: 20 })
        this.setData({
          implList: res.list || [],
          list: [],
          implCount: res.total || 0
        })
      } else if (activeTab === 'interaction') {
        const fn = interactionTab === 'liked' ? 'getMyLikedCreativities' : 'getMyCommentedCreativities'
        const res = await callFunction(fn, { page: 1, pageSize: 20 })
        this.setData({ list: res.list || [], implList: [] })
      } else if (activeTab === 'favorites') {
        const res = await callFunction('getMyFavorites', { page: 1, pageSize: 20 })
        this.setData({ list: res.list || [], implList: [] })
      } else if (activeTab === 'followed') {
        const res = await callFunction('getFollowedCreativities', { page: 1, pageSize: 20 })
        this.setData({ list: res.list || [], implList: [] })
      }
    } catch (err) {
      console.error('[My] loadData failed:', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  async loadNotifications() {
    try {
      const res = await callFunction('getNotifications', { page: 1, pageSize: 100 })
      const unread = (res.list || []).filter(n => !n.isRead).length
      this.setData({ unreadCount: unread })
    } catch (err) {
      console.error('[My] loadNotifications failed:', err)
    }
  },

  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key }, () => {
      this.loadData()
    })
  },

  onInteractionTabChange(e) {
    this.setData({ interactionTab: e.currentTarget.dataset.key }, () => {
      this.loadData()
    })
  },

  onEditProfile() {
    showToast('编辑资料功能开发中')
  },

  onMsgClick() {
    wx.navigateTo({ url: '/pages/messages/index' })
  },

  onCardClick(e) {
    const { id } = e.detail
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` })
  },

  onEditImpl(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/submitImpl/index?id=${id}` })
  },

  async onDeleteImpl(e) {
    const { id } = e.currentTarget.dataset
    const { confirm } = await wx.showModal({ title: '提示', content: '确定删除此实现成果？' })
    if (!confirm) return

    try {
      await callFunction('deleteImplementation', { id })
      showToast('删除成功', 'success')
      this.setData({
        implList: this.data.implList.filter(i => i._id !== id)
      })
    } catch (err) {
      console.error('[My] deleteImpl failed:', err)
      showToast('删除失败')
    }
  },

  onShareAppMessage() {
    return {
      title: '灵光 - 我的创意主页',
      path: '/pages/my/index'
    }
  }
})
