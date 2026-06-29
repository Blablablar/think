// components/creativity-card/index.js
Component({
  properties: {
    data: {
      type: Object,
      value: {}
    },
    showAuthor: {
      type: Boolean,
      value: true
    }
  },

  methods: {
    onCardClick() {
      this.triggerEvent('click', { id: this.data.data._id })
    },

    onLike() {
      this.triggerEvent('like', { id: this.data.data._id })
    },

    onDislike() {
      this.triggerEvent('dislike', { id: this.data.data._id })
    },

    onFavorite() {
      this.triggerEvent('favorite', { id: this.data.data._id })
    },

    onTagClick(e) {
      this.triggerEvent('tagclick', { tag: e.currentTarget.dataset.tag })
    },

    onPreviewImage(e) {
      const idx = e.currentTarget.dataset.index
      const images = this.data.data.images
      wx.previewImage({
        current: images[idx],
        urls: images
      })
    }
  }
})
