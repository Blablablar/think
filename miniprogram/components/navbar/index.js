// components/navbar/index.js
const P = 'data:image/svg+xml;base64,'
// 返回箭头 SVG（默认白色，用于紫色导航栏）
const BACK_ICON_WHITE = P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cGF0aCBkPSJNMjAgMTZIOE04IDE2bDUtNU04IDE2bDUgNSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjIuMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIi8+PC9zdmc+'
// 返回箭头 SVG（深色，用于白色/透明导航栏）
const BACK_ICON_DARK = P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cGF0aCBkPSJNMjAgMTZIOE04IDE2bDUtNU04IDE2bDUgNSIgc3Ryb2tlPSIjMWExYTFhIiBzdHJva2Utd2lkdGg9IjIuMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIi8+PC9zdmc+'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 标题文字
    title: {
      type: String,
      value: ''
    },
    // 导航栏类型：purple（紫色底）、white（白色底）、transparent（透明沉浸式）
    type: {
      type: String,
      value: 'purple'
    },
    // 是否显示返回按钮
    showBack: {
      type: Boolean,
      value: false
    },
    // 右侧按钮文字
    rightText: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight: 0,
    navBarHeight: 0,
    backIcon: BACK_ICON_WHITE
  },

  /**
   * 组件的生命周期
   */
  lifetimes: {
    attached() {
      const winInfo = wx.getWindowInfo()
      const statusBarHeight = winInfo.statusBarHeight
      const navBarHeight = statusBarHeight + 44

      // 根据导航栏类型选择返回箭头颜色
      const backIcon = this.data.type === 'purple' ? BACK_ICON_WHITE : BACK_ICON_DARK

      this.setData({
        statusBarHeight,
        navBarHeight,
        backIcon
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 返回按钮点击
    onBack() {
      this.triggerEvent('back')
      wx.navigateBack({
        fail() {
          wx.switchTab({
            url: '/pages/home/home'
          })
        }
      })
    },

    // 右侧按钮点击
    onRightClick() {
      this.triggerEvent('rightclick')
    }
  }
})
