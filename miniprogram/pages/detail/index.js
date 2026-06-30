// pages/detail/index.js

Page({
  data: {
    detail: null,
    loading: true,
    isLiked: false,
    likeCount: 0,
    commentCount: 0,
    comments: [],
    commentText: '',
    replyTo: null
  },

  onLoad(options) {
    if (options.id) {
      this.loadDetail(options.id)
    }
  },

  // 加载模拟数据
  loadDetail(id) {
    // 模拟详情数据
    const detail = {
      id: id || '1',
      title: '城市孤独症',
      content: '在这个快节奏的城市里，我们常常感到孤独。但其实，孤独也是一种力量。它让我们有时间思考，有空间创作。\n\n这张照片拍摄于上周五的傍晚，当时我独自走在回家的路上，看到夕阳洒在建筑上，突然有了灵感。',
      images: [
        '/images/demo1.png',
        '/images/demo2.png',
        '/images/demo3.png'
      ],
      author: {
        name: '小明',
        avatar: '/images/avatar1.png',
        isFollowing: false
      },
      recommendReason: '你关注的小红也在看',
      timeLabel: '2小时前',
      stats: {
        likes: 128,
        comments: 32
      }
    }

    // 模拟评论数据
    const comments = [
      {
        id: 'c1',
        author: {
          name: '小红',
          avatar: '/images/avatar2.png',
          isAuthor: false
        },
        content: '太有共鸣了！孤独确实是一种力量',
        timeLabel: '1小时前',
        replies: [
          {
            id: 'r1',
            author: {
              name: '小明',
              avatar: '/images/avatar1.png',
              isAuthor: true
            },
            content: '谢谢你的理解❤️',
            timeLabel: '1小时前'
          }
        ],
        repliesExpanded: false
      },
      {
        id: 'c2',
        author: {
          name: '小刚',
          avatar: '/images/avatar3.png',
          isAuthor: false
        },
        content: '照片拍得真好，氛围感拉满',
        timeLabel: '30分钟前',
        replies: [],
        repliesExpanded: false
      },
      {
        id: 'c3',
        author: {
          name: '小花',
          avatar: '/images/avatar4.png',
          isAuthor: false
        },
        content: '期待看到更多你的作品！',
        timeLabel: '10分钟前',
        replies: [
          {
            id: 'r2',
            author: {
              name: '小明',
              avatar: '/images/avatar1.png',
              isAuthor: true
            },
            content: '会继续努力的！',
            timeLabel: '8分钟前'
          },
          {
            id: 'r3',
            author: {
              name: '小红',
              avatar: '/images/avatar2.png',
              isAuthor: false
            },
            content: '对啊对啊，期待！',
            timeLabel: '5分钟前'
          }
        ],
        repliesExpanded: false
      }
    ]

    this.setData({
      detail,
      loading: false,
      likeCount: detail.stats.likes,
      commentCount: detail.stats.comments,
      comments
    })
  },

  // 返回
  onBack() {
    wx.navigateBack()
  },

  // 更多菜单
  onMoreClick() {
    wx.showActionSheet({
      itemList: ['举报', '分享'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.showToast({ title: '已举报', icon: 'success' })
        } else if (res.tapIndex === 1) {
          this.onShare()
        }
      }
    })
  },

  // 作者点击
  onAuthorClick() {
    wx.navigateTo({ url: '/pages/profile/profile' })
  },

  // 关注点击
  onFollowClick() {
    const { detail } = this.data
    detail.author.isFollowing = !detail.author.isFollowing
    this.setData({ detail })
    wx.showToast({
      title: detail.author.isFollowing ? '已关注' : '已取消关注',
      icon: 'success'
    })
  },

  // 点赞
  onLike() {
    const { isLiked, likeCount } = this.data
    this.setData({
      isLiked: !isLiked,
      likeCount: isLiked ? likeCount - 1 : likeCount + 1
    })
  },

  // 滚动到评论区
  onScrollToComment() {
    wx.pageScrollTo({ selector: '#comment-section' })
  },

  // 分享
  onShare() {
    wx.showToast({ title: '分享功能开发中', icon: 'none' })
  },

  // 预览图片
  onPreviewImage(e) {
    const index = e.currentTarget.dataset.index
    wx.previewImage({
      current: this.data.detail.images[index],
      urls: this.data.detail.images
    })
  },

  // 回复评论
  onReplyComment(e) {
    const { id, name } = e.currentTarget.dataset
    this.setData({
      replyTo: { id, name },
      commentText: ''
    })
  },

  // 取消回复
  onCancelReply() {
    this.setData({
      replyTo: null,
      commentText: ''
    })
  },

  // 评论输入
  onCommentInput(e) {
    this.setData({ commentText: e.detail.value })
  },

  // 发送评论
  onSendComment() {
    const { commentText, replyTo, comments } = this.data
    if (!commentText.trim()) return

    if (replyTo) {
      // 回复评论
      const comment = comments.find(c => c.id === replyTo.id)
      if (comment) {
        comment.replies = comment.replies || []
        comment.replies.push({
          id: 'r_' + Date.now(),
          author: {
            name: '我',
            avatar: '/images/avatar_me.png',
            isAuthor: false
          },
          content: commentText,
          timeLabel: '刚刚'
        })
        this.setData({ comments, replyTo: null, commentText: '' })
      }
    } else {
      // 新评论
      comments.unshift({
        id: 'c_' + Date.now(),
        author: {
          name: '我',
          avatar: '/images/avatar_me.png',
          isAuthor: false
        },
        content: commentText,
        timeLabel: '刚刚',
        replies: [],
        repliesExpanded: false
      })
      this.setData({
        comments,
        commentCount: this.data.commentCount + 1,
        commentText: ''
      })
    }

    wx.showToast({ title: '评论成功', icon: 'success' })
  },

  // 展开回复
  onExpandReplies(e) {
    const id = e.currentTarget.dataset.id
    const comments = this.data.comments.map(c => {
      if (c.id === id) {
        c.repliesExpanded = true
      }
      return c
    })
    this.setData({ comments })
  },

  // 分享给朋友
  onShareAppMessage() {
    const { detail } = this.data
    return {
      title: detail?.title || '创意详情',
      path: `/pages/detail/index?id=${detail?.id}`
    }
  }
})
