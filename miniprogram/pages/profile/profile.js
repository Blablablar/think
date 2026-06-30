// pages/profile/profile.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    userInfo: {
      avatar: '/images/avatar1.png',
      name: '创意小达人',
      id: '123456',
      bio: '热爱生活，喜欢用创意记录美好瞬间'
    },

    // 统计数据
    stats: {
      posts: 12,
      following: 48,
      followers: 120
    },

    // 当前激活的 Tab（0: 我的创意，1: 认领，2: 收藏）
    activeTab: 0,

    // 内容列表
    contentList: [],

    // 加载状态
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadData();
  },

  /**
   * 加载数据
   */
  loadData() {
    this.setData({ loading: true });

    // 模拟网络请求延迟
    setTimeout(() => {
      const contentList = this.getMockData();

      this.setData({
        contentList,
        loading: false
      });
    }, 1000);
  },

  /**
   * 获取模拟数据
   */
  getMockData() {
    return [
      {
        _id: '1',
        author: {
          name: '创意小达人',
          avatar: '/images/avatar1.png',
          isFollowing: false
        },
        title: '分享一个城市摄影技巧',
        summary: '今天走在街上，突然发现光影交错的美。分享一下如何用手机拍出有质感的照片...',
        images: ['/images/photo1.png'],
        category: 'photography',
        stats: {
          likes: 128,
          comments: 32
        },
        createdAt: '2026-06-30 10:30:00'
      }
    ];
  },

  /**
   * Tab 切换
   */
  onTabChange(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({ activeTab: index });

    // 根据不同的 Tab 加载不同的数据
    // TODO: 根据 Tab 类型加载数据
  },

  /**
   * 编辑按钮点击
   */
  onEdit() {
    console.log('编辑个人信息');
    // TODO: 跳转到编辑页面
  },

  /**
   * 统计数据点击
   */
  onStatsClick(e) {
    const type = e.currentTarget.dataset.type;
    console.log('点击统计数据:', type);
    // TODO: 跳转到对应的列表页面
  },

  /**
   * 功能按钮点击
   */
  onFunctionClick(e) {
    const type = e.currentTarget.dataset.type;
    console.log('点击功能按钮:', type);
    // TODO: 跳转到对应的功能页面
  },

  /**
   * 卡片点击
   */
  onCardClick(e) {
    const id = e.detail._id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  /**
   * 点赞
   */
  onLike(e) {
    const id = e.detail._id;
    console.log('点赞创意:', id);
  },

  /**
   * 收藏
   */
  onFavorite(e) {
    const id = e.detail._id;
    console.log('收藏创意:', id);
  }
});
