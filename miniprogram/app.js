// app.js
App({
  globalData: {
    userInfo: null,
    openid: '',
    cloudEnv: 'cloud1-2gt03efv3c08ce28'
  },

  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: this.globalData.cloudEnv,
        traceUser: true
      })
    }

    // 初始化用户信息
    this.initUser()
  },

  // 初始化用户
  async initUser() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'initUserProfile'
      })
      if (res.result && res.result.code === 0) {
        this.globalData.userInfo = res.result.data
        this.globalData.openid = res.result.data._openid
        // 缓存标记
        wx.setStorageSync('hasInit', true)
      }
    } catch (err) {
      console.error('[App] initUser failed:', err)
    }
  }
})
