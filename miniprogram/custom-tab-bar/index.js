Component({
  data: {
    active: 0,
    list: [
      { pagePath: '/pages/today/index', text: '今日', icon: '🏠' },
      { pagePath: '/pages/hot/index', text: '热门', icon: '🔥' },
      { pagePath: '/pages/publish/index', text: '发布', icon: '' },
      { pagePath: '/pages/recommend/index', text: '推荐', icon: '🎲' },
      { pagePath: '/pages/my/index', text: '我的', icon: '👤' }
    ]
  },

  attached() {
    this.updateActive()
  },

  pageLifetimes: {
    show() {
      this.updateActive()
    }
  },

  methods: {
    updateActive() {
      const pages = getCurrentPages()
      if (pages.length === 0) return
      const currentPage = pages[pages.length - 1]
      const path = '/' + currentPage.route
      const index = this.data.list.findIndex(item => item.pagePath === path)
      if (index !== -1) {
        this.setData({ active: index })
      }
    },

    switchTab(e) {
      const index = e.currentTarget.dataset.index
      const item = this.data.list[index]
      if (!item) return
      wx.switchTab({ url: item.pagePath })
      this.setData({ active: index })
    }
  }
})
