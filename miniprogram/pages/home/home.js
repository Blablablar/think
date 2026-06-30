// pages/home/home.js
const P = 'data:image/svg+xml;base64,'
const SEARCH_ICON = P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2IiBmaWxsPSJub25lIj48Y2lyY2xlIGN4PSI3IiBjeT0iNyIgcj0iNC41IiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMS4zIi8+PGxpbmUgeDE9IjEwLjUiIHkxPSIxMC41IiB4Mj0iMTQuNSIgeTI9IjE0LjUiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIxLjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg=='

Page({
  /**
   * 页面的初始数据
   */
  data: {
    searchIcon: SEARCH_ICON,

    // Banner 数据 - 按高保真四色渐变
    banners: [
      {
        id: '1',
        tag: '🔥 本周热门',
        title: '「城市孤独症」摄影企划',
        meta: '68位创作者参与 · 1.2k 作品',
        gradient: 'linear-gradient(135deg, #534AB7 0%, #7C6FD4 30%, #A599E0 60%, #FF6B6B 100%)'
      },
      {
        id: '2',
        tag: '✏️ 限时活动',
        title: '「夏日创作马拉松」写作挑战',
        meta: '连续7天创作 · 赢取限定徽章',
        gradient: 'linear-gradient(135deg, #0D7377 0%, #14A3A8 40%, #32BFC6 70%, #FFA940 100%)'
      },
      {
        id: '3',
        tag: '🎨 征集令',
        title: '「我的城市一角」插画征集',
        meta: '投稿截止7月15日 · 42人已参与',
        gradient: 'linear-gradient(135deg, #6B2C6E 0%, #B04BB5 35%, #E070A0 65%, #FF9A8B 100%)'
      }
    ],

    // 探索分类数据 - 按高保真彩色渐变背景
    categories: [
      { id: 'illustration', name: '插画', icon: '🎨', bg: 'linear-gradient(135deg, #FFE4C4, #FFDAB9)' },
      { id: 'photography', name: '摄影', icon: '📷', bg: 'linear-gradient(135deg, #D4EFFC, #B0E0E6)' },
      { id: 'writing', name: '写作', icon: '✍️', bg: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)' },
      { id: 'music', name: '音乐', icon: '🎵', bg: 'linear-gradient(135deg, #F3E5F5, #E1BEE7)' },
      { id: 'handcraft', name: '手工', icon: '🧶', bg: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)' },
      { id: 'lifestyle', name: '生活', icon: '🌱', bg: 'linear-gradient(135deg, #FFEBEE, #FFCDD2)' },
      { id: 'design', name: '设计', icon: '🎯', bg: 'linear-gradient(135deg, #E0F2F1, #B2DFDB)' },
      { id: 'video', name: '视频', icon: '🎬', bg: 'linear-gradient(135deg, #E8EAF6, #C5CAE9)' }
    ],

    // 热门话题数据
    topics: [
      { id: '1', name: '夏日创作计划', hot: true },
      { id: '2', name: '每日一画挑战', hot: true },
      { id: '3', name: '城市速写', hot: false },
      { id: '4', name: '胶片复兴', hot: false },
      { id: '5', name: '诗歌创作', hot: false },
      { id: '6', name: '手工皮具', hot: false },
      { id: '7', name: '水彩入门', hot: false }
    ],

    // 推荐创意列表
    list: [],

    // 加载状态
    loading: false,
    hasMore: true,
    refreshing: false,
    page: 1
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
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    // 模拟网络请求延迟
    setTimeout(() => {
      const newList = this.getMockData();

      this.setData({
        list: [...this.data.list, ...newList],
        loading: false,
        hasMore: this.data.page < 3,  // 模拟只有3页数据
        page: this.data.page + 1
      });
    }, 1000);
  },

  /**
   * 获取模拟数据
   */
  getMockData() {
    const mockData = [
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
      },
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

    return mockData;
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.loadData();
  },

  /**
   * 页面下拉刷新
   */
  onPullDownRefresh() {
    this.setData({
      refreshing: true,
      list: [],
      hasMore: true,
      page: 1
    });

    setTimeout(() => {
      const newList = this.getMockData();

      this.setData({
        list: newList,
        refreshing: false,
        page: 2
      });
    }, 1000);
  },

  /**
   * 卡片点击
   */
  onCardClick(e) {
    const id = e.detail._id;
    wx.navigateTo({
      url: `/pages/detail/index?id=${id}`
    });
  },

  /**
   * 点赞
   */
  onLike(e) {
    const id = e.detail._id;
    console.log('点赞创意:', id);

    // 更新本地数据
    const list = this.data.list;
    const index = list.findIndex(item => item._id === id);
    if (index !== -1) {
      list[index].stats.likes += 1;
      this.setData({ list });
    }
  },

  /**
   * 收藏
   */
  onFavorite(e) {
    const id = e.detail._id;
    console.log('收藏创意:', id);
  },

  /**
   * 分类点击
   */
  onCategoryClick(e) {
    const id = e.currentTarget.dataset.id;
    console.log('点击分类:', id);
    // TODO: 跳转到分类筛选页面
  },

  /**
   * 话题点击
   */
  onTopicClick(e) {
    const id = e.currentTarget.dataset.id;
    console.log('点击话题:', id);
    // TODO: 筛选该话题下的创意
  }
});
