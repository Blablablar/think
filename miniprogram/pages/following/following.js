// pages/following/following.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 当前激活的 Tab（0: 关注，1: 收藏）
    activeTab: 0,

    // 关注列表
    followingList: [],

    // 收藏列表
    favoriteList: [],

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
      const followingList = this.getMockFollowingData();
      const favoriteList = this.getMockFavoriteData();

      this.setData({
        followingList,
        favoriteList,
        loading: false
      });
    }, 1000);
  },

  /**
   * 获取模拟关注数据
   */
  getMockFollowingData() {
    return [
      {
        _id: '1',
        author: {
          name: '创意小达人',
          avatar: '/images/avatar1.png',
          isFollowing: true
        },
        title: '分享一个城市摄影技巧',
        summary: '今天走在街上，突然发现光影交错的美。分享一下如何用手机拍出有质感的照片...',
        images: ['/images/photo1.png'],
        category: 'photography',
        stats: {
          likes: 128,
          comments: 32
        },
        recommendReason: '你关注的XX也在看',
        createdAt: '2026-06-30 10:30:00'
      },
      {
        _id: '2',
        author: {
          name: '插画师小美',
          avatar: '/images/avatar2.png',
          isFollowing: true
        },
        title: '治愈系插画：秋日森林',
        summary: '用温暖的颜色描绘秋天的森林，希望能给大家带来一些治愈感...',
        images: ['/images/illust1.png', '/images/illust2.png', '/images/illust3.png'],
        category: 'illustration',
        stats: {
          likes: 256,
          comments: 48
        },
        createdAt: '2026-06-29 16:45:00'
      }
    ];
  },

  /**
   * 获取模拟收藏数据
   */
  getMockFavoriteData() {
    return [
      {
        _id: '3',
        author: {
          name: '文字旅人',
          avatar: '/images/avatar3.png',
          isFollowing: false
        },
        title: '微小说：最后一班地铁',
        summary: '地铁到站的声音响起，我合上笔记本，看着窗外的隧道灯光匆匆掠过...',
        images: [],  // 纯文字卡片
        category: 'writing',
        stats: {
          likes: 89,
          comments: 15
        },
        recommendReason: '热门写作话题',
        createdAt: '2026-06-28 21:15:00'
      }
    ];
  },

  /**
   * Tab 切换
   */
  onTabChange(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({ activeTab: index });
  },

  /**
   * Swiper 切换
   */
  onSwiperChange(e) {
    const index = e.detail.current;
    this.setData({ activeTab: index });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // TODO: 加载更多数据
    console.log('加载更多数据');
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
