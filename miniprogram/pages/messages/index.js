// pages/messages/index.js

Page({
  data: {
    activeTab: 'interaction',
    interactionMessages: [],
    systemMessages: [],
    groupedMessages: [],
    groupedSystemMessages: [],
    interactionUnread: 0,
    systemUnread: 0,
    loading: false,
    refreshing: false,
    page: 1,
    hasMore: true
  },

  onLoad() {
    this.loadMockData()
  },

  onShow() {
    // 切换Tab时清除未读红点
    if (this.data.activeTab === 'system') {
      this.setData({ systemUnread: 0 })
    } else {
      this.setData({ interactionUnread: 0 })
    }
  },

  // 加载模拟数据
  loadMockData() {
    const interactionMessages = [
      {
        id: '1',
        type: 'comment',
        read: false,
        user: { name: '小明', avatar: '/images/avatar1.png' },
        title: '小明评论了你的创意',
        preview: '这个创意太棒了，我也想尝试一下...',
        timeLabel: '刚刚',
        createdAt: new Date()
      },
      {
        id: '2',
        type: 'like_batch',
        read: false,
        users: [
          { name: '小红', avatar: '/images/avatar2.png' },
          { name: '小刚', avatar: '/images/avatar3.png' }
        ],
        title: '小明、小红等5人赞了你的创意',
        timeLabel: '刚刚',
        createdAt: new Date()
      },
      {
        id: '3',
        type: 'claim_approved',
        read: true,
        user: { name: '创意官方', avatar: '/images/avatar_official.png' },
        title: '你的认领已通过',
        timeLabel: '今天',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '4',
        type: 'follow',
        read: true,
        user: { name: '小花', avatar: '/images/avatar4.png' },
        title: '小花关注了你',
        timeLabel: '今天',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        id: '5',
        type: 'reply',
        read: true,
        user: { name: '小强', avatar: '/images/avatar5.png' },
        title: '小强回复了你的评论',
        preview: '我觉得这个想法很有创意，可以继续深化...',
        timeLabel: '昨天',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ]

    const systemMessages = [
      {
        id: 's1',
        type: 'system',
        read: false,
        title: '创意推荐到首页',
        desc: '你的创意《城市孤独症》被推荐到首页热门，获得更多曝光机会',
        timeLabel: '今天',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: 's2',
        type: 'system',
        read: true,
        title: '获得优质原创标签',
        desc: '恭喜！你的创意《春日序曲》获得优质原创标签',
        timeLabel: '昨天',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 's3',
        type: 'system',
        read: true,
        title: '版本更新通知',
        desc: '新版本已发布，快来体验新功能吧！',
        timeLabel: '昨天',
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000)
      }
    ]

    const interactionUnread = interactionMessages.filter(m => !m.read).length
    const systemUnread = systemMessages.filter(m => !m.read).length

    this.setData({
      interactionMessages,
      systemMessages,
      interactionUnread,
      systemUnread
    })

    this.groupMessages()
  },

  // 按时间分组消息
  groupMessages() {
    const groupedMessages = this.groupByTime(this.data.interactionMessages)
    const groupedSystemMessages = this.groupByTime(this.data.systemMessages)

    this.setData({
      groupedMessages,
      groupedSystemMessages
    })
  },

  // 时间分组逻辑
  groupByTime(messages) {
    const groups = []
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    messages.forEach(msg => {
      const msgDate = new Date(msg.createdAt)
      let timeLabel = ''

      if (msgDate >= today) {
        timeLabel = '今天'
      } else if (msgDate >= yesterday) {
        timeLabel = '昨天'
      } else {
        timeLabel = `${msgDate.getMonth() + 1}月${msgDate.getDate()}日`
      }

      let group = groups.find(g => g.timeLabel === timeLabel)
      if (!group) {
        group = { timeLabel, messages: [] }
        groups.push(group)
      }
      group.messages.push(msg)
    })

    return groups
  },

  // Tab切换
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })

    // 切换Tab时清除未读红点
    if (tab === 'system') {
      this.setData({ systemUnread: 0 })
    } else {
      this.setData({ interactionUnread: 0 })
    }
  },

  // 点击消息
  onMsgClick(e) {
    const { id, type } = e.currentTarget.dataset
    const tab = this.data.activeTab
    const messages = tab === 'interaction' ? this.data.interactionMessages : this.data.systemMessages

    const item = messages.find(m => m.id === id)
    if (item && !item.read) {
      // 标记已读
      item.read = true
      this.setData({
        [tab === 'interaction' ? 'interactionMessages' : 'systemMessages']: messages
      })
      this.groupMessages()

      // 更新未读计数
      if (tab === 'interaction') {
        this.setData({
          interactionUnread: messages.filter(m => !m.read).length
        })
      } else {
        this.setData({
          systemUnread: messages.filter(m => !m.read).length
        })
      }
    }

    // 跳转逻辑（根据实际业务补充）
    console.log('点击消息:', id, type)
  },

  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({ refreshing: true })
    // 模拟加载
    setTimeout(() => {
      this.setData({ refreshing: false })
    }, 1000)
  },

  // 上拉加载
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ loading: true })
      // 模拟加载
      setTimeout(() => {
        this.setData({ loading: false, hasMore: false })
      }, 1000)
    }
  }
})
