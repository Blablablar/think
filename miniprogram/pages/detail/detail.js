// pages/detail/detail.js
const { callFunction, showToast, showLoading, hideLoading } = require('../../utils/cloud.js')
const { formatTime } = require('../../utils/util.js')

// 云存储默认头像 fileID
const DEFAULT_AVATAR = 'cloud://cloud1-2gt03efv3c08ce28.636c-cloud1-2gt03efv3c08ce28-1256535077/assets/default-avatar.png'

const P = 'data:image/svg+xml;base64,'
// 右上角三点
const MORE_ICON = P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjMiIHI9IjEuNSIgZmlsbD0iIzY2NiIvPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEuNSIgZmlsbD0iIzY2NiIvPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTciIHI9IjEuNSIgZmlsbD0iIzY2NiIvPjwvc3ZnPg=='
// 评论点赞（心）
const HEART_ICON = P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBkPSJNNiAxMC41bC0uNy40Yy0uNC0xLTEuMi0xLjgtMi4xLTIuNEMxLjYgNy42LjUgNi40LjUgNS4xLjUgMy4zIDEuOSAxLjkgMy43IDEuOWMuOCAwIDEuNi4zIDIuMy45LjctLjYgMS41LS45IDIuMy0uOSAxLjggMCAzLjIgMS40IDMuMiAzLjIgMCAxLjMtMS4xIDIuNS0yLjcgMy40LS45LjYtMS43IDEuNC0yLjEgMi40TDYgMTAuNXoiIHN0cm9rZT0iIzk5OSIgc3Ryb2tlLXdpZHRoPSIwLjkiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbGw9Im5vbmUiLz48L3N2Zz4='
// 展开/收起箭头
const CHEVRON_DOWN = P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDE0IDE0Ij48cGF0aCBkPSJNMyA1bDQgNCA0LTQiIHN0cm9rZT0iIzUzNEFCNyIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSIvPjwvc3ZnPg=='

/**
 * 把云函数返回的评论记录归一化
 */
function normalizeComment(comment, authorOpenidMap, creativityAuthorOpenid) {
  const author = comment.author || {}
  const isAuthor = comment._openid === creativityAuthorOpenid
  return {
    _id: comment._id,
    _openid: comment._openid,
    name: author.nickName || '微信用户',
    avatar: author.avatarUrl || DEFAULT_AVATAR,
    text: comment.content,
    time: formatTime(comment.createdAt),
    likeCount: 0,
    isAuthor,
    replies: (comment.replies || []).map(r => normalizeReply(r, authorOpenidMap, creativityAuthorOpenid)),
    replyTotal: (comment.replies || []).length,
    showAllReplies: false
  }
}

function normalizeReply(reply, authorOpenidMap, creativityAuthorOpenid) {
  const author = reply.author || {}
  const isAuthor = reply._openid === creativityAuthorOpenid
  // replyTo 字段是被回复评论的 _id，需要查找对应评论作者名
  let replyToName = ''
  if (reply.replyTo && authorOpenidMap[reply.replyTo]) {
    replyToName = authorOpenidMap[reply.replyTo]
  }
  return {
    _id: reply._id,
    _openid: reply._openid,
    name: author.nickName || '微信用户',
    avatar: author.avatarUrl || DEFAULT_AVATAR,
    text: reply.content,
    time: formatTime(reply.createdAt),
    likeCount: 0,
    isAuthor,
    replyTo: replyToName
  }
}

Page({
  data: {
    id: '',
    // 创意详情
    detail: null,
    // 作者信息（适配 wxml 渲染）
    author: {
      name: '',
      avatar: '',
      timeLabel: '',
      isFollowing: false,
      _openid: ''
    },
    // 标签
    tags: [],
    // 认领成果（暂留空，待后续接 getImplementationByCreativity）
    claimResults: [],
    // 评论列表
    comments: [],
    commentTotal: 0,
    // 输入框
    commentInput: '',
    // 当前回复的评论
    replyTo: null,
    // 图标
    icons: {
      more: MORE_ICON,
      heart: HEART_ICON,
      chevronDown: CHEVRON_DOWN
    },
    loading: true,
    // 当前用户 openid（用于判断是否是作者）
    currentOpenid: '',
    // 是否已认领
    hasClaimed: false,
    claiming: false
  },

  onLoad(options) {
    const app = getApp()
    this.setData({ currentOpenid: app.globalData.openid || '' })
    if (options.id) {
      this.setData({ id: options.id })
      this.loadDetail(options.id)
    }
  },

  // 加载详情
  async loadDetail(id) {
    showLoading('加载中...')
    try {
      const data = await callFunction('getCreativityDetail', { id })
      const author = data.author || {}
      const tags = (data.tags || []).map(tag => ({
        text: tag,
        type: 'default'
      }))

      this.setData({
        detail: {
          _id: data._id,
          _openid: data._openid,
          title: data.title || '',         // 数据库当前未存 title，留空
          content: data.content || '',
          images: data.images || [],
          likeCount: data.likeCount || 0,
          commentCount: data.commentCount || 0,
          claimCount: data.claimCount || 0,
          isLiked: !!data.isLiked,
          createdAt: formatTime(data.createdAt)
        },
        author: {
          name: author.nickName || '微信用户',
          avatar: author.avatarUrl || DEFAULT_AVATAR,
          timeLabel: formatTime(data.createdAt),
          isFollowing: false,
          _openid: author._openid || data._openid
        },
        tags
      })
      hideLoading()
      // 并行加载评论
      this.loadComments(id)
      // 设置 navbar 标题
      wx.setNavigationBarTitle({ title: '创意详情' })
    } catch (err) {
      hideLoading()
      console.error('[Detail] load failed:', err)
      showToast('加载失败')
    }
  },

  // 加载评论
  async loadComments(creativityId) {
    const cid = creativityId || this.data.id
    try {
      const res = await callFunction('getComments', { creativityId: cid, page: 1, pageSize: 50 })
      const rawList = res.list || []
      const creativityAuthorOpenid = this.data.author._openid

      // 构建 commentId → authorName 映射（用于楼中楼 replyTo 查找）
      const authorOpenidMap = {}
      rawList.forEach(c => {
        if (c._id && c.author) {
          authorOpenidMap[c._id] = c.author.nickName || '微信用户'
        }
        ;(c.replies || []).forEach(r => {
          if (r._id && r.author) {
            authorOpenidMap[r._id] = r.author.nickName || '微信用户'
          }
        })
      })

      const comments = rawList.map(c => normalizeComment(c, authorOpenidMap, creativityAuthorOpenid))
      this.setData({
        comments,
        commentTotal: res.total || comments.length
      })
    } catch (err) {
      console.error('[Detail] loadComments failed:', err)
    }
  },

  // 关注/取消关注作者
  async onToggleFollow() {
    const targetOpenid = this.data.author._openid
    if (!targetOpenid) {
      showToast('作者信息异常')
      return
    }
    if (targetOpenid === this.data.currentOpenid) {
      showToast('不能关注自己')
      return
    }
    // 乐观更新
    this.setData({ 'author.isFollowing': !this.data.author.isFollowing })
    try {
      const res = await callFunction('toggleFollow', { targetOpenid })
      this.setData({ 'author.isFollowing': res.isFollowing })
      showToast(res.isFollowing ? '已关注' : '已取消', 'none')
    } catch (err) {
      console.error('[Detail] toggleFollow failed:', err)
      // 回滚
      this.setData({ 'author.isFollowing': !this.data.author.isFollowing })
      showToast('操作失败')
    }
  },

  // 我要认领
  async onClaim() {
    if (this.data.hasClaimed) {
      showToast('已认领过此创意')
      return
    }
    const { confirm } = await wx.showModal({
      title: '认领创意',
      content: '确认认领这个创意？认领后请尽快产出实现作品。',
      confirmText: '确认认领'
    })
    if (!confirm) return

    this.setData({ claiming: true })
    try {
      await callFunction('claimCreativity', { creativityId: this.data.id })
      this.setData({
        hasClaimed: true,
        'detail.claimCount': (this.data.detail.claimCount || 0) + 1
      })
      showToast('认领成功', 'success')
    } catch (err) {
      console.error('[Detail] claim failed:', err)
      showToast(err.message || '认领失败')
    } finally {
      this.setData({ claiming: false })
    }
  },

  // 输入评论
  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value })
  },

  // 发布评论
  async onPublishComment() {
    const text = this.data.commentInput.trim()
    if (!text) {
      showToast('请输入评论内容')
      return
    }
    const { replyTo, id } = this.data
    showLoading('发布中...')
    try {
      let newId
      if (replyTo) {
        // 回复某条评论
        const res = await callFunction('replyComment', {
          creativityId: id,
          content: text,
          parentId: replyTo.id,
          replyTo: replyTo.replyToCommentId || null
        })
        newId = res._id
      } else {
        // 一级评论
        const res = await callFunction('addComment', {
          creativityId: id,
          content: text
        })
        newId = res._id
      }
      hideLoading()

      // 重新加载评论列表
      this.loadComments(id)
      this.setData({
        commentInput: '',
        replyTo: null,
        'detail.commentCount': (this.data.detail.commentCount || 0) + 1
      })
      showToast('评论成功', 'success')
    } catch (err) {
      hideLoading()
      console.error('[Detail] publishComment failed:', err)
      showToast(err.message || '评论失败')
    }
  },

  // 点击回复（设置 replyTo 状态）
  onReply(e) {
    const { id, name, replyCommentId } = e.currentTarget.dataset
    this.setData({
      replyTo: {
        id,
        name,
        replyToCommentId: replyCommentId || null
      }
    })
  },

  // 取消回复
  onCancelReply() {
    this.setData({ replyTo: null })
  },

  // 展开全部回复
  onToggleReplies(e) {
    const idx = e.currentTarget.dataset.index
    const key = `comments[${idx}].showAllReplies`
    this.setData({
      [key]: !this.data.comments[idx].showAllReplies
    })
  },

  // 评论点赞（前端无对应云函数，提示开发中）
  onLikeComment(e) {
    showToast('评论点赞开发中')
  },

  // 右上角更多
  onMore() {
    wx.showActionSheet({
      itemList: ['分享', '举报', '不感兴趣'],
      success: (res) => {
        if (res.tapIndex === 1) {
          showToast('感谢反馈，我们会尽快处理')
        } else if (res.tapIndex === 2) {
          wx.navigateBack()
        }
      }
    })
  },

  // 预览图片
  onPreviewImage(e) {
    const idx = e.currentTarget.dataset.index
    const images = this.data.detail.images || []
    if (images.length === 0) return
    wx.previewImage({
      current: images[idx],
      urls: images
    })
  },

  onShareAppMessage() {
    return {
      title: this.data.detail && this.data.detail.content
        ? this.data.detail.content.slice(0, 30)
        : '灵感岛',
      path: `/pages/detail/detail?id=${this.data.id}`
    }
  }
})
