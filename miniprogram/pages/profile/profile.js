// pages/profile/profile.js
const { callFunction, showToast, showLoading, hideLoading } = require('../../utils/cloud.js')
const { formatTime } = require('../../utils/util.js')

// 云存储默认头像 fileID（与 initUserProfile 云函数一致）
const DEFAULT_AVATAR = 'cloud://cloud1-2gt03efv3c08ce28.636c-cloud1-2gt03efv3c08ce28-1256535077/assets/default-avatar.png'

const P = 'data:image/svg+xml;base64,'
// 编辑图标（铅笔）
const EDIT_ICON = P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNMiAxMS41VjE0aDIuNWw3LjktNy45LTIuNS0yLjVMMiAxMS41eiIgZmlsbD0iI2ZmZmZmZiIvPjxwYXRoIGQ9Ik0xMi44IDMuM2wyLjEgMi4xLTEuMSAxLjEtMi4xLTIuMSAxLjEtMS4xeiIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg=='
// 菜单图标
const ICON_DRAFT = P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48cGF0aCBkPSJNMyAzaDE0djJIM3ptMCA2aDE0djJIM3ptMCA2aDEwdjJIM3oiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg=='
const ICON_FEEDBACK = P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSI4IiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMS41Ii8+PHBhdGggZD0iTTEwIDZ2NGwyLjUgMi41IiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4='
const ICON_SETTINGS = P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIzIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMS41Ii8+PHBhdGggZD0iTTE3LjUgMTBjMCA0LjEtMy40IDcuNS03LjUgNy41UzIuNSAxNC4xIDIuNSAxMCA1LjkgMi41IDEwIDIuNXM3LjUgMy40IDcuNSA3LjV6IiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMS41Ii8+PC9zdmc+'
// 列表项右侧箭头
const ARROW_ICON = P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDE0IDE0Ij48cGF0aCBkPSJNNSAyLjVMOS41IDcgNSAxMS41IiBzdHJva2U9IiNCRkJGQkYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4='

/**
 * 把云函数返回的 creativity 记录归一化为 creativity-card 期望的字段
 */
function normalizeCard(item) {
  if (!item) return null
  const author = item.author || {}
  return {
    _id: item._id,
    title: item.title || '',
    summary: item.content || '',                  // content → summary
    images: item.images || [],
    tags: item.tags || [],
    isLiked: !!item.isLiked,
    isFavorited: !!item.isFavorited,
    recommendReason: item.recommendReason || '',
    createdAt: formatTime(item.createdAt),
    author: {
      _openid: author.openid || author._openid || item.openid || item._openid || '',
      name: author.nickName || '微信用户',
      avatar: author.avatarUrl || DEFAULT_AVATAR
    },
    stats: {
      likes: item.likeCount || 0,
      comments: item.commentCount || 0,
      favorites: item.favoriteCount || 0
    }
  }
}

Page({
  data: {
    // 状态栏高度
    statusBarHeight: 0,
    // 登录态
    hasLogin: false,
    userInfo: {},
    // 统计数据（创意/认领/收藏/获赞）
    stats: {
      posts: 0,
      claims: 0,
      favorites: 0,
      likes: 0
    },
    // 当前激活的 Tab（0: 我的创意，1: 我的认领，2: 我的收藏）
    activeTab: 0,
    // 内容列表
    contentList: [],
    // 加载状态
    loading: false,
    // 图标
    icons: {
      edit: EDIT_ICON,
      draft: ICON_DRAFT,
      feedback: ICON_FEEDBACK,
      settings: ICON_SETTINGS,
      arrow: ARROW_ICON
    },
    // 菜单项
    menuCommon: [
      { type: 'drafts', label: '草稿箱' }
    ],
    menuOther: [
      { type: 'feedback', label: '反馈建议' },
      { type: 'settings', label: '设置' }
    ],
    // 编辑资料弹窗
    editVisible: false,
    editAvatarUrl: '',
    editNickName: '',
    avatarChanged: false,
    savingProfile: false,
    // 是否首次登录（强制填写资料）
    isFirstLogin: false
  },

  onLoad() {
    const winInfo = wx.getWindowInfo()
    this.setData({ statusBarHeight: winInfo.statusBarHeight })
    this.checkLoginStatus()
  },

  onShow() {
    // 每次显示时刷新登录态与数据
    this.checkLoginStatus()
    if (this.data.hasLogin) {
      this.loadAllData()
    }
  },

  // ─────────────────────────────────────────
  // 登录态
  // ─────────────────────────────────────────

  async checkLoginStatus() {
    const app = getApp()
    const hasLogged = wx.getStorageSync('hasLogged')

    if (!hasLogged) {
      this.setData({ hasLogin: false, userInfo: {} })
      return
    }

    // 先用本地缓存快速渲染，避免页面闪烁
    const cached = wx.getStorageSync('userInfo') || app.globalData.userInfo
    if (cached) {
      this.setData({ hasLogin: true, userInfo: cached })
    }

    // 从云函数拉取 users 表最新数据
    try {
      const userRecord = await callFunction('initUserProfile', {})
      const userInfo = {
        ...userRecord,
        nickName: userRecord.nickName || '微信用户',
        avatarUrl: userRecord.avatarUrl || DEFAULT_AVATAR
      }
      app.globalData.userInfo = userInfo
      app.globalData.openid = userRecord.openid || userRecord._openid
      wx.setStorageSync('userInfo', userInfo)
      this.setData({ hasLogin: true, userInfo })
    } catch (err) {
      console.error('[Profile] refreshUserInfo failed:', err)
    }
  },

  // 微信一键登录
  async onLogin() {
    const app = getApp()
    showLoading('登录中...')
    try {
      // 调用 initUserProfile 确保 users 表有记录
      const userRecord = await callFunction('initUserProfile', {})
      app.globalData.openid = userRecord.openid || userRecord._openid

      const userInfo = {
        ...userRecord,
        nickName: userRecord.nickName || '微信用户',
        avatarUrl: userRecord.avatarUrl || DEFAULT_AVATAR
      }
      app.globalData.userInfo = userInfo
      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('hasLogged', true)

      hideLoading()
      this.setData({ hasLogin: true, userInfo })
      showToast('登录成功', 'success')
      this.loadAllData()
    } catch (err) {
      hideLoading()
      console.error('[Profile] onLogin failed:', err)
      showToast('登录失败')
    }
  },

  // ─────────────────────────────────────────
  // 数据加载
  // ─────────────────────────────────────────

  async loadAllData() {
    await Promise.all([
      this.loadStats(),
      this.loadContentList()
    ])
  },

  // 加载统计数据
  async loadStats() {
    try {
      const [pubRes, claimRes, favRes] = await Promise.all([
        callFunction('getMyCreativities', { page: 1, pageSize: 1 }),
        callFunction('getMyClaims', { page: 1, pageSize: 1 }),
        callFunction('getMyFavorites', { page: 1, pageSize: 1 })
      ])
      // 获赞数 = 我发布的创意的 likeCount 之和，需要拉一次完整列表
      let likeTotal = 0
      try {
        const fullPub = await callFunction('getMyCreativities', { page: 1, pageSize: 100 })
        ;(fullPub.list || []).forEach(c => {
          likeTotal += (c.likeCount || 0)
        })
      } catch (e) {
        console.error('[Profile] loadLikes failed:', e)
      }
      this.setData({
        stats: {
          posts: pubRes.total || 0,
          claims: claimRes.total || 0,
          favorites: favRes.total || 0,
          likes: likeTotal
        }
      })
    } catch (err) {
      console.error('[Profile] loadStats failed:', err)
    }
  },

  // 加载内容列表
  async loadContentList() {
    const { activeTab } = this.data
    this.setData({ loading: true })
    try {
      let list = []
      if (activeTab === 0) {
        // 我的创意
        const res = await callFunction('getMyCreativities', { page: 1, pageSize: 20 })
        list = (res.list || []).map(normalizeCard)
      } else if (activeTab === 1) {
        // 我的认领（getMyClaims 返回 claim + creativity，需展平为 creativity）
        const res = await callFunction('getMyClaims', { page: 1, pageSize: 20 })
        list = (res.list || [])
          .filter(item => item.creativity)
          .map(item => normalizeCard({
            ...item.creativity,
            isLiked: false,
            isFavorited: false
          }))
      } else if (activeTab === 2) {
        // 我的收藏
        const res = await callFunction('getMyFavorites', { page: 1, pageSize: 20 })
        list = (res.list || []).map(item => normalizeCard({
          ...item,
          isFavorited: true
        }))
      }
      this.setData({ contentList: list })
    } catch (err) {
      console.error('[Profile] loadContentList failed:', err)
      showToast('加载失败')
    } finally {
      this.setData({ loading: false })
    }
  },

  // ─────────────────────────────────────────
  // 交互
  // ─────────────────────────────────────────

  onTabChange(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({ activeTab: index, contentList: [] })
    this.loadContentList()
  },

  // 编辑资料弹窗
  onEditProfile() {
    const { userInfo } = this.data
    this.setData({
      editVisible: true,
      editAvatarUrl: userInfo.avatarUrl || '',
      editNickName: userInfo.nickName || '',
      avatarChanged: false
    })
  },

  onCloseEdit() {
    this.setData({ editVisible: false })
  },

  // 阻止事件冒泡（用于编辑弹窗内部点击不关闭弹窗）
  onStopPropagation() {},

  onEditChooseAvatar(e) {
    this.setData({
      editAvatarUrl: e.detail.avatarUrl,
      avatarChanged: true
    })
  },

  onEditNicknameInput(e) {
    this.setData({ editNickName: e.detail.value })
  },

  async onSaveProfile() {
    const { editAvatarUrl, editNickName, avatarChanged, isFirstLogin } = this.data
    if (!editNickName.trim()) {
      showToast('请输入昵称')
      return
    }
    if (!editAvatarUrl) {
      showToast('请选择头像')
      return
    }

    this.setData({ savingProfile: true })
    showLoading('保存中...')
    try {
      let avatarUrl = editAvatarUrl

      // 上传新头像到云存储（首次登录或更换头像时）
      if (avatarChanged && editAvatarUrl && editAvatarUrl.indexOf('cloud://') !== 0) {
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

      // 调用 initUserProfile 直接保存资料（使用自定义 openid 字段）
      const savedRecord = await callFunction('initUserProfile', {
        nickName: editNickName.trim(),
        avatarUrl
      })

      // 更新缓存（使用云函数返回的最新数据）
      const app = getApp()
      const newUserInfo = {
        ...(app.globalData.userInfo || {}),
        ...savedRecord,
        nickName: savedRecord.nickName || editNickName.trim(),
        avatarUrl: savedRecord.avatarUrl || avatarUrl
      }
      app.globalData.userInfo = newUserInfo
      wx.setStorageSync('userInfo', newUserInfo)
      wx.setStorageSync('hasLogged', true)

      hideLoading()
      this.setData({
        userInfo: newUserInfo,
        editVisible: false,
        avatarChanged: false,
        isFirstLogin: false
      })
      showToast(isFirstLogin ? '登录成功' : '保存成功', 'success')

      // 首次登录保存后加载数据
      if (isFirstLogin) {
        this.loadAllData()
      }
    } catch (err) {
      hideLoading()
      console.error('[Profile] saveProfile failed:', err)
      showToast(err.message || '保存失败')
    } finally {
      this.setData({ savingProfile: false })
    }
  },

  onFunctionClick(e) {
    const type = e.currentTarget.dataset.type
    switch (type) {
      case 'drafts':
        showToast('草稿箱开发中')
        break
      case 'feedback':
        showToast('反馈建议开发中')
        break
      case 'settings':
        showToast('设置开发中')
        break
    }
  },

  // 卡片点击 → 跳转详情
  onCardClick(e) {
    const id = e.detail._id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  // 点赞（列表内）
  async onLike(e) {
    const id = e.detail._id
    const list = this.data.contentList.map(item => {
      if (item._id === id) {
        const isLiked = !item.isLiked
        return {
          ...item,
          isLiked,
          stats: {
            ...item.stats,
            likes: item.stats.likes + (isLiked ? 1 : -1)
          }
        }
      }
      return item
    })
    this.setData({ contentList: list })
    try {
      await callFunction('toggleLike', { creativityId: id, type: 'like' })
    } catch (err) {
      console.error('[Profile] toggleLike failed:', err)
      // 回滚
      this.loadContentList()
    }
  },

  // 收藏（列表内）
  async onFavorite(e) {
    const id = e.detail._id
    const list = this.data.contentList.map(item => {
      if (item._id === id) {
        const isFavorited = !item.isFavorited
        return {
          ...item,
          isFavorited,
          stats: {
            ...item.stats,
            favorites: item.stats.favorites + (isFavorited ? 1 : -1)
          }
        }
      }
      return item
    })
    this.setData({ contentList: list })
    try {
      await callFunction('toggleFavorite', { creativityId: id })
    } catch (err) {
      console.error('[Profile] toggleFavorite failed:', err)
      this.loadContentList()
    }
  },

  onShareAppMessage() {
    return {
      title: '灵感岛 - 我的创意主页',
      path: '/pages/profile/profile'
    }
  }
})
