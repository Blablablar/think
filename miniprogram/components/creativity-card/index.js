// components/creativity-card/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 创意数据
    data: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 卡片点击
     */
    onCardClick() {
      this.triggerEvent('click', { _id: this.data.data._id });
    },

    /**
     * 点赞
     */
    onLike() {
      this.triggerEvent('like', { _id: this.data.data._id });
    },

    /**
     * 评论
     */
    onComment() {
      this.triggerEvent('comment', { _id: this.data.data._id });
    },

    /**
     * 收藏
     */
    onFavorite() {
      this.triggerEvent('favorite', { _id: this.data.data._id });
    },

    /**
     * 预览图片
     */
    onPreviewImage(e) {
      const idx = e.currentTarget.dataset.index;
      const images = this.data.data.images;
      wx.previewImage({
        current: images[idx],
        urls: images
      });
    }
  }
});
