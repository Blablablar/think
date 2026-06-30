// pages/detail/index.js
const { callFunction, showToast, showLoading, hideLoading } = require('../../utils/cloud.js')
const { formatTime } = require('../../utils/util.js')
const { PAGE_SIZE } = require('../../utils/constants.js')

Page({
  data: {
    id: '',
    detail: null,
    author: null,
    loading: true,
    // 点赞点踩收藏状态
    isLiked: false,
    isDisliked: false,
    isFavorited: false,
    likeCount: 0,
    dislikeCount: 0,
    favoriteCount: 0,
    claimCount: 0,
    commentCount: 0,
    // 认领状态
    myClaim: null, // 当前用户在此创意上的有效认领
    // 实现成果
    implList: [],
    implTotal: 0,
    implExpanded: false,
    // 评论
    commentList: [],
    commentTotal: 0,
    commentExpanded: false,
    commentPage: 1,
    commentHasMore: false,
    commentText: '',
    sendingComment: false,
    // 评论回复
    replyTo: null, // { id, nickname }
    // 图片预览
    swiperCurrent: 0,
    // 操作中
    acting: false
  },

  onLoad(options) {
    if (!options || !options.id) {
      showToast('参数缺失')
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }
    this.setData({ id: options.id })
    this.loadAll()
  },

  onPullDownRefresh() {
    this.loadAll().finally(() => wx.stopPullDownRefresh())
  },

  async loadAll() {
    this.setData({ loading: true })
    try {
      await Promise.all([
        this.loadDetail(),
        this.loadImplementations(),
        this.loadComments(true),
        this.loadMyClaim()
      ])
    } finally {
      this.setData({ loading: false })
    }
  },

  async loadDetail() {
    try {
      const data = await callFunction('getCreativityDetail', { id: this.data.id })
      if (!data) {
        showToast('创意不存在')
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }
      const author = data.author || null
      this.setData({
        detail: {
          ...data,
          date: formatTime(data.createdAt)
        },
        author,
        isLiked: !!data.isLiked,
        isDisliked: !!data.isDisliked,
        likeCount: data.likeCount || 0,
        dislikeCount: data.dislikeCount || 0,
        favoriteCount: data.favoriteCount || 0,
        claimCount: data.claimCount || 0,
        commentCount: data.commentCount || 0
      })
    } catch (err) {
      console.error('[Detail] loadDetail failed:', err)
      showToast('加载失败')
    }
  },

  async loadImplementations() {
    try {
      const res = await callFunction('getImplementationByCreativity', {
        creativityId: this.data.id,
        page: 1,
        pageSize: 100
      })
      const list = (res.list || []).map(item => ({
        ...item,
        date: formatTime(item.createdAt)
      }))
      this.setData({ implList: list, implTotal: res.total || 0 })
    } catch (err) {
      console.error('[Detail] loadImplementations failed:', err)
    }
  },

  // 查询当前用户对此创意的有效认领
  async loadMyClaim() {
    try {
      const res = await callFunction('getMyClaims', { page: 1, pageSize: 100 })
      const claims = res.list || []
      const myClaim = claims.find(c => c.creativityId === this.data.id)
      this.setData({ myClaim: myClaim || null })
    } catch (err) {
      console.error('[Detail] loadMyClaim failed:', err)
    }
  },

  async loadComments(reset = false) {
    try {
      const page = reset ? 1 : this.data.commentPage
      const res = await callFunction('getComments', {
        creativityId: this.data.id,
        page,
        pageSize: PAGE_SIZE
      })
      const myOpenid = (getApp().globalData && getApp().globalData.openid) || ''
      const decorate = c => ({
        ...c,
        date: formatTime(c.createdAt),
        isMine: c._openid === myOpenid
      })
      const newComments = (res.list || []).map(c => ({
        ...decorate(c),
        replies: (c.replies || []).map(decorate)
      }))
      const list = reset ? newComments : [...this.data.commentList, ...newComments]
      this.setData({
        commentList: list,
        commentTotal: res.total || 0,
        commentPage: reset ? 1 : page + 1,
        commentHasMore: !!res.hasMore
      })
    } catch (err) {
      console.error('[Detail] loadComments failed:', err)
    }
  },

  onSwiperChange(e) {
    this.setData({ swiperCurrent: e.detail.current })
  },

  onPreviewImage(e) {
    const idx = e.currentTarget.dataset.index
    const images = this.data.detail.images || []
    wx.previewImage({
      current: images[idx],
      urls: images
    })
  },

  onTagClick(e) {
    const { tag } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/tag/index?tag=${tag}` })
  },

  onAuthorClick() {
    const author = this.data.author
    if (!author || !author._openid) return
    wx.navigateTo({ url: `/pages/user/index?openid=${author._openid}` })
  },

  // 点赞
  async onLike() {
    if (this.data.acting) return
    this.setData({ acting: true })
    const prev = {
      isLiked: this.data.isLiked,
      isDisliked: this.data.isDisliked,
      likeCount: this.data.likeCount,
      dislikeCount: this.data.dislikeCount
    }
    // 乐观更新
    this.setData({
      isLiked: !this.data.isLiked,
      likeCount: this.data.isLiked ? this.data.likeCount - 1 : this.data.likeCount + 1
    })
    try {
      await callFunction('toggleLike', { creativityId: this.data.id, type: 'like' })
    } catch (err) {
      console.error('[Detail] toggleLike failed:', err)
      this.setData(prev)
      showToast('操作失败')
    } finally {
      this.setData({ acting: false })
    }
  },

  // 点踩
  async onDislike() {
    if (this.data.acting) return
    this.setData({ acting: true })
    const prev = {
      isLiked: this.data.isLiked,
      isDisliked: this.data.isDisliked,
      likeCount: this.data.likeCount,
      dislikeCount: this.data.dislikeCount
    }
    this.setData({
      isDisliked: !this.data.isDisliked,
      dislikeCount: this.data.isDisliked ? this.data.dislikeCount - 1 : this.data.dislikeCount + 1
    })
    try {
      await callFunction('toggleLike', { creativityId: this.data.id, type: 'dislike' })
    } catch (err) {
      console.error('[Detail] toggleDislike failed:', err)
      this.setData(prev)
      showToast('操作失败')
    } finally {
      this.setData({ acting: false })
    }
  },

  // 收藏
  async onFavorite() {
    if (this.data.acting) return
    this.setData({ acting: true })
    const prev = {
      isFavorited: this.data.isFavorited,
      favoriteCount: this.data.favoriteCount
    }
    this.setData({
      isFavorited: !this.data.isFavorited,
      favoriteCount: this.data.isFavorited ? this.data.favoriteCount - 1 : this.data.favoriteCount + 1
    })
    try {
      await callFunction('toggleFavorite', { creativityId: this.data.id })
    } catch (err) {
      console.error('[Detail] toggleFavorite failed:', err)
      this.setData(prev)
      showToast('操作失败')
    } finally {
      this.setData({ acting: false })
    }
  },

  // 认领
  async onClaim() {
    const { confirm } = await wx.showModal({
      title: '提示',
      content: '认领后需在7天内提交实现成果，确认认领？'
    })
    if (!confirm) return

    showLoading('认领中...')
    try {
      await callFunction('claimCreativity', { creativityId: this.data.id })
      hideLoading()
      showToast('认领成功', 'success')
      this.setData({ claimCount: this.data.claimCount + 1 })
      this.loadMyClaim()
    } catch (err) {
      hideLoading()
      console.error('[Detail] claim failed:', err)
      showToast(err.message || '认领失败')
    }
  },

  // 取消认领
  async onCancelClaim() {
    const { myClaim } = this.data
    if (!myClaim) return
    const { confirm } = await wx.showModal({
      title: '提示',
      content: '确定取消认领此创意？'
    })
    if (!confirm) return

    showLoading('取消中...')
    try {
      await callFunction('unclaimCreativity', { claimId: myClaim._id })
      hideLoading()
      showToast('已取消认领', 'success')
      this.setData({
        myClaim: null,
        claimCount: Math.max(0, this.data.claimCount - 1)
      })
    } catch (err) {
      hideLoading()
      console.error('[Detail] cancelClaim failed:', err)
      showToast(err.message || '取消失败')
    }
  },

  // 跳转提交实现成果
  onSubmitImpl() {
    const { id, myClaim } = this.data
    if (!myClaim) {
      showToast('请先认领')
      return
    }
    wx.navigateTo({
      url: `/pages/submitImpl/index?creativityId=${id}&claimId=${myClaim._id}`
    })
  },

  // 展开/收起实现成果
  onToggleImpl() {
    this.setData({ implExpanded: !this.data.implExpanded })
  },

  // 预览实现成果截图
  onPreviewImplImage(e) {
    const { pidx, idx } = e.currentTarget.dataset
    const impl = this.data.implList[pidx]
    if (!impl || !impl.screenshots) return
    wx.previewImage({
      current: impl.screenshots[idx],
      urls: impl.screenshots
    })
  },

  // 展开/收起评论
  onToggleComments() {
    this.setData({ commentExpanded: !this.data.commentExpanded })
  },

  onLoadMoreComments() {
    if (this.data.commentHasMore && !this.data.loading) {
      this.loadComments(false)
    }
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value })
  },

  // 设置回复目标
  // id: 被回复评论 id，nickname: 被回复者昵称，parentId: 该评论所属根评论 id（若本身是根评论则等于 id）
  onReplyComment(e) {
    const { id, nickname, parentid } = e.currentTarget.dataset
    this.setData({
      replyTo: { id, nickname, parentId: parentid || id }
    })
  },

  // 取消回复
  onCancelReply() {
    this.setData({ replyTo: null })
  },

  // 发送评论
  async onSendComment() {
    const { commentText, replyTo, sendingComment } = this.data
    if (sendingComment) return
    if (!commentText.trim()) {
      showToast('请输入评论内容')
      return
    }

    this.setData({ sendingComment: true })
    try {
      if (replyTo) {
        // 回复评论（二级）
        await callFunction('replyComment', {
          creativityId: this.data.id,
          content: commentText.trim(),
          parentId: replyTo.parentId,
          replyTo: replyTo.id
        })
      } else {
        // 一级评论
        await callFunction('addComment', {
          creativityId: this.data.id,
          content: commentText.trim()
        })
      }
      showToast('评论成功', 'success')
      this.setData({
        commentText: '',
        replyTo: null,
        commentCount: this.data.commentCount + 1
      })
      this.loadComments(true)
    } catch (err) {
      console.error('[Detail] addComment failed:', err)
      showToast(err.message || '评论失败')
    } finally {
      this.setData({ sendingComment: false })
    }
  },

  // 删除评论
  async onDeleteComment(e) {
    const { id } = e.currentTarget.dataset
    const { confirm } = await wx.showModal({
      title: '提示',
      content: '确定删除此评论？'
    })
    if (!confirm) return

    try {
      await callFunction('deleteComment', { id })
      showToast('删除成功', 'success')
      this.setData({
        commentList: this.data.commentList.filter(c => c._id !== id),
        commentCount: Math.max(0, this.data.commentCount - 1)
      })
    } catch (err) {
      console.error('[Detail] deleteComment failed:', err)
      showToast(err.message || '删除失败')
    }
  },

  onShareAppMessage() {
    const detail = this.data.detail
    return {
      title: detail ? `灵光创意：${(detail.content || '').slice(0, 30)}` : '灵光 - 创意详情',
      path: `/pages/detail/index?id=${this.data.id}`
    }
  },

  onShareTimeline() {
    return { title: '灵光 - 创意详情' }
  }
})
