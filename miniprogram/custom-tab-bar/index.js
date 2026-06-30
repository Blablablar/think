// custom-tab-bar/index.js
const P = 'data:image/svg+xml;base64,'
const ICONS = {
  home: P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NCIgaGVpZ2h0PSI0NCIgdmlld0JveD0iMCAwIDIyIDIyIj48cGF0aCBkPSJNMyAxMGw4LTcuNUwxOSAxMHY4LjVjMCAuNTUtLjQ1IDEtMSAxaC00di02aC02djZINGMtLjU1IDAtMS0uNDUtMS0xVjEweiIgZmlsbD0iIzk5OTk5OSIvPjwvc3ZnPg==',
  homeActive: P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NCIgaGVpZ2h0PSI0NCIgdmlld0JveD0iMCAwIDIyIDIyIj48cGF0aCBkPSJNMyAxMGw4LTcuNUwxOSAxMHY4LjVjMCAuNTUtLjQ1IDEtMSAxaC00di02aC02djZINGMtLjU1IDAtMS0uNDUtMS0xVjEweiIgZmlsbD0iIzUzNEFCNyIvPjwvc3ZnPg==',
  heart: P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NCIgaGVpZ2h0PSI0NCIgdmlld0JveD0iMCAwIDIyIDIyIj48cGF0aCBkPSJNMTEgMTlsLTEuNDUtMS4zMkM1LjQgMTQuMzYgMiAxMS43MSAyIDguNSAyIDUuNDIgNC40MiAzIDcuNSAzYzEuNzQgMCAzLjQxLjgxIDQuNSAyLjA5QzEzLjA5IDMuODEgMTQuNzYgMyAxNi41IDMgMTkuNTggMyAyMiA1LjQyIDIyIDguNWMwIDMuMjEtMy40IDUuODYtNy41NSA5LjE4TDExIDE5eiIgZmlsbD0iIzk5OTk5OSIvPjwvc3ZnPg==',
  heartActive: P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NCIgaGVpZ2h0PSI0NCIgdmlld0JveD0iMCAwIDIyIDIyIj48cGF0aCBkPSJNMTEgMTlsLTEuNDUtMS4zMkM1LjQgMTQuMzYgMiAxMS43MSAyIDguNSAyIDUuNDIgNC40MiAzIDcuNSAzYzEuNzQgMCAzLjQxLjgxIDQuNSAyLjA5QzEzLjA5IDMuODEgMTQuNzYgMyAxNi41IDMgMTkuNTggMyAyMiA1LjQyIDIyIDguNWMwIDMuMjEtMy40IDUuODYtNy41NSA5LjE4TDExIDE5eiIgZmlsbD0iIzUzNEFCNyIvPjwvc3ZnPg==',
  msg: P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NCIgaGVpZ2h0PSI0NCIgdmlld0JveD0iMCAwIDIyIDIyIj48cGF0aCBkPSJNMTcgMTZINWMtMS4xIDAtMi0uOS0yLTJWN2MwLTEuMS45LTIgMi0yaDEyYzEuMSAwIDIgLjkgMiAydjdjMCAxLjEtLjkgMi0yIDJ6IiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMS44IiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMTEiIGN5PSI4LjUiIHI9IjEuMyIgZmlsbD0iIzk5OTk5OSIvPjwvc3ZnPg==',
  msgActive: P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NCIgaGVpZ2h0PSI0NCIgdmlld0JveD0iMCAwIDIyIDIyIj48cGF0aCBkPSJNMTcgMTZINWMtMS4xIDAtMi0uOS0yLTJWN2MwLTEuMS45LTIgMi0yaDEyYzEuMSAwIDIgLjkgMiAydjdjMCAxLjEtLjkgMi0yIDJ6IiBzdHJva2U9IiM1MzRBQjciIHN0cm9rZS13aWR0aD0iMS44IiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMTEiIGN5PSI4LjUiIHI9IjEuMyIgZmlsbD0iIzUzNEFCNyIvPjwvc3ZnPg==',
  profile: P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NCIgaGVpZ2h0PSI0NCIgdmlld0JveD0iMCAwIDIyIDIyIj48Y2lyY2xlIGN4PSIxMSIgY3k9IjgiIHI9IjQiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIxLjgiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMyAyMGMwLTQuNCAzLjYtOCA4LThzOCAzLjYgOCA4IiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMS44IiBzdHJva2UtbGluZWNhcD0icm91bmQiIGZpbGw9Im5vbmUiLz48L3N2Zz4=',
  profileActive: P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NCIgaGVpZ2h0PSI0NCIgdmlld0JveD0iMCAwIDIyIDIyIj48Y2lyY2xlIGN4PSIxMSIgY3k9IjgiIHI9IjQiIHN0cm9rZT0iIzUzNEFCNyIgc3Ryb2tlLXdpZHRoPSIxLjgiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMyAyMGMwLTQuNCAzLjYtOCA4LThzOCAzLjYgOCA4IiBzdHJva2U9IiM1MzRBQjciIHN0cm9rZS13aWR0aD0iMS44IiBzdHJva2UtbGluZWNhcD0icm91bmQiIGZpbGw9Im5vbmUiLz48L3N2Zz4='
}

Component({
  data: {
    active: 0,
    list: [
      { key: 'home', pagePath: '/pages/home/home', text: '首页', icon: ICONS.home, iconActive: ICONS.homeActive },
      { key: 'following', pagePath: '/pages/following/following', text: '关注', icon: ICONS.heart, iconActive: ICONS.heartActive },
      { key: 'publish', pagePath: '/pages/publish/index', text: '发布', icon: '', iconActive: '' },
      { key: 'messages', pagePath: '/pages/messages/index', text: '消息', icon: ICONS.msg, iconActive: ICONS.msgActive },
      { key: 'profile', pagePath: '/pages/profile/profile', text: '我的', icon: ICONS.profile, iconActive: ICONS.profileActive }
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
