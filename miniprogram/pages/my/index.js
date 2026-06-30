// pages/my/index.js
const { callFunction, showToast, showLoading, hideLoading } = require('../../utils/cloud.js')

// 云存储默认头像 fileID（与 initUserProfile 云函数一致）
const DEFAULT_AVATAR = 'cloud://cloud1-2gt03efv3c08ce28.636c-cloud1-2gt03efv3c08ce28-1256535077/assets/default-avatar.png'

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
    // 编辑资料相关
    editVisible: false,
    editAvatarUrl: '',
    editNickName: '',
    avatarChanged: false,
    savingProfile: false,
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
    const hasLogged = wx.getStorageSync('hasLogged')
    if (hasLogged && userInfo) {
      this.setData({ hasLogin: true, userInfo })
    } else if (hasLogged && app.globalData.userInfo) {
      this.setData({ hasLogin: true, userInfo: app.globalData.userInfo })
    }
  },

  // 微信一键登录（直接登录，使用默认头像）
  onLogin() {
    const app = getApp()
    const userInfo = {
      ...(app.globalData.userInfo || {}),
      nickName: (app.globalData.userInfo && app.globalData.userInfo.nickName) || '微信用户',
      avatarUrl: (app.globalData.userInfo && app.globalData.userInfo.avatarUrl) || DEFAULT_AVATAR
    }
    app.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
    wx.setStorageSync('hasLogged', true)

    this.setData({ hasLogin: true, userInfo })
    showToast('登录成功', 'success')

    this.loadData()
    this.loadNotifications()
  },

  // 打开编辑资料弹窗
  onEditProfile() {
    const { userInfo } = this.data
    this.setData({
      editVisible: true,
      editAvatarUrl: userInfo.avatarUrl || '',
      editNickName: userInfo.nickName || '',
      avatarChanged: false
    })
  },

  // 关闭编辑资料弹窗
  onCloseEdit() {
    this.setData({ editVisible: false })
  },

  // 选择微信头像（编辑资料弹窗内）
  onEditChooseAvatar(e) {
    this.setData({
      editAvatarUrl: e.detail.avatarUrl,
      avatarChanged: true
    })
  },

  // 昵称输入
  onEditNicknameInput(e) {
    this.setData({ editNickName: e.detail.value })
  },

  // 保存个人资料
  async onSaveProfile() {
    const { editAvatarUrl, editNickName, avatarChanged } = this.data
    if (!editNickName.trim()) {
      showToast('请输入昵称')
      return
    }

    this.setData({ savingProfile: true })
    showLoading('保存中...')
    try {
      let avatarUrl = editAvatarUrl

      // 如果选择了新头像，上传到云存储
      if (avatarChanged && editAvatarUrl) {
        const cloudPath = `avatars/${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`
        const uploadRes = await new Promise((resolve, reject) => {
          wx.cloud.uploadFile({
            cloudPath,
            filePath: editAvatarUrl,
            success: resolve,
            fail: reject
          })
        })
        avatarUrl = uploadRes.fileID
      }

      // 调用云函数更新资料
      await callFunction('updateUserProfile', {
        nickName: editNickName.trim(),
        avatarUrl
      })

      // 更新缓存
      const app = getApp()
      const newUserInfo = {
        ...(app.globalData.userInfo || {}),
        nickName: editNickName.trim(),
        avatarUrl
      }
      app.globalData.userInfo = newUserInfo
      wx.setStorageSync('userInfo', newUserInfo)

      hideLoading()
      this.setData({
        hasLogin: true,
        userInfo: newUserInfo,
        editVisible: false,
        avatarChanged: false
      })
      showToast('保存成功', 'success')
    } catch (err) {
      hideLoading()
      console.error('[My] saveProfile failed:', err)
      showToast('保存失败')
    } finally {
      this.setData({ savingProfile: false })
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
