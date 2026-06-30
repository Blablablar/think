// components/navbar/index.js
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
      value: 'purple'  // 默认值：紫色底
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
    },
    // 是否显示搜索框（替换标题）
    showSearch: {
      type: Boolean,
      value: false
    },
    // 搜索框占位文字
    searchPlaceholder: {
      type: String,
      value: '搜索灵感...'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight: 0,  // 状态栏高度
    navBarHeight: 0        // 导航栏总高度（状态栏 + 导航栏内容）
  },

  /**
   * 组件的生命周期
   */
  lifetimes: {
    attached() {
      // 获取系统信息
      const systemInfo = wx.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight;
      const navBarHeight = statusBarHeight + 44;  // 状态栏高度 + 导航栏内容高度（44px）

      this.setData({
        statusBarHeight,
        navBarHeight
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 返回按钮点击
    onBack() {
      this.triggerEvent('back');

      // 默认行为：返回上一页
      wx.navigateBack({
        fail() {
          // 如果没有上一页，则跳转到首页
          wx.switchTab({
            url: '/pages/home/home'
          });
        }
      });
    },

    // 右侧按钮点击
    onRightClick() {
      this.triggerEvent('rightclick');
    }
  }
});
