// components/creativity-card/index.js
const P = 'data:image/svg+xml;base64,'
const ICONS = {
  heart: P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDE0IDE0IiBmaWxsPSJub25lIj48cGF0aCBkPSJNNyAxMkw1LjgzIDEwLjk1QzMuNSA4LjkgMiA3LjU1IDIgNS41QzIgNC4xNSAzLjA1IDMgNC41IDNDNS4yNSAzIDYgMy4zNSA2LjUgMy45NUw3IDQuNUw3LjUgMy45NUM4IDMuMzUgOC43NSAzIDkuNSAzQzEwLjk1IDMgMTIgNC4xNSAxMiA1LjVDMTIgNy41NSAxMC41IDguOSA4LjE3IDEwLjk1TDcgMTJaIiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMS4zIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+',
  heartActive: P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDE0IDE0IiBmaWxsPSIjNTM0QUI3Ij48cGF0aCBkPSJNNyAxMkw1LjgzIDEwLjk1QzMuNSA4LjkgMiA3LjU1IDIgNS41QzIgNC4xNSAzLjA1IDMgNC41IDNDNS4yNSAzIDYgMy4zNSA2LjUgMy45NUw3IDQuNUw3LjUgMy45NUM4IDMuMzUgOC43NSAzIDkuNSAzQzEwLjk1IDMgMTIgNC4xNSAxMiA1LjVDMTIgNy41NSAxMC41IDguOSA4LjE3IDEwLjk1TDcgMTJaIi8+PC9zdmc+',
  comment: P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDE0IDE0IiBmaWxsPSJub25lIj48cGF0aCBkPSJNMTIgOS41YzAgLjgtLjcgMS41LTEuNSAxLjVoLTdDMi43IDExIDIgMTAuMyAyIDkuNVY0YzAtLjMuMi0uNS41LS41aDljLjMgMCAuNS4yLjUuNXY1LjV6IiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMS4zIi8+PGxpbmUgeDE9IjUiIHkxPSI2IiB4Mj0iOSIgeTI9IjYiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48bGluZSB4MT0iNSIgeTE9IjgiIHgyPSI3LjUiIHkyPSI4IiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+',
  star: P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDE0IDE0IiBmaWxsPSJub25lIj48cGF0aCBkPSJNNyAxTDguOCA1LjIgMTMgNS44bC0zIDIuOS43IDQuM0w3IDExbC0zLjcgMiAuNy00LjMtMy0yLjkgNC4yLS42TDcgMXoiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIxLjMiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=',
  starActive: P + 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDE0IDE0IiBmaWxsPSIjRkE5RDNCIj48cGF0aCBkPSJNNyAxTDguOCA1LjIgMTMgNS44bC0zIDIuOS43IDQuM0w3IDExbC0zLjcgMiAuNy00LjMtMy0yLjkgNC4yLS42TDcgMXoiLz48L3N2Zz4='
}

Component({
  properties: {
    data: {
      type: Object,
      value: {}
    }
  },

  data: {
    icons: ICONS
  },

  methods: {
    onCardClick() {
      this.triggerEvent('click', { _id: this.data.data._id })
    },
    onLike() {
      this.triggerEvent('like', { _id: this.data.data._id })
    },
    onComment() {
      this.triggerEvent('comment', { _id: this.data.data._id })
    },
    onFavorite() {
      this.triggerEvent('favorite', { _id: this.data.data._id })
    },
    onPreviewImage(e) {
      const idx = e.currentTarget.dataset.index
      const images = this.data.data.images || []
      if (images.length === 0) return
      wx.previewImage({
        current: images[idx],
        urls: images
      })
    }
  }
})
