// pages/publish/index.js
const { callFunction, showToast, showLoading, hideLoading } = require('../../utils/cloud.js')
const { compressImage } = require('../../utils/util.js')
const { MAX_CONTENT_LENGTH } = require('../../utils/constants.js')

Page({
  data: {
    content: '',
    images: [],
    selectedTags: [],
    publishing: false,
    maxContent: MAX_CONTENT_LENGTH
  },

  onLoad() {
    // 加载草稿
    const draft = wx.getStorageSync('publish_draft')
    if (draft) {
      this.setData({
        content: draft.content || '',
        images: draft.images || [],
        selectedTags: draft.tags || []
      })
    }
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value.slice(0, MAX_CONTENT_LENGTH) })
  },

  async onChooseImage() {
    try {
      const res = await wx.chooseMedia({
        count: 9 - this.data.images.length,
        mediaType: ['image'],
        sizeType: ['compressed']
      })

      // 压缩图片
      const compressedImages = await Promise.all(
        res.tempFiles.map(f => compressImage(f.tempFilePath))
      )

      this.setData({
        images: [...this.data.images, ...compressedImages].slice(0, 9)
      })
    } catch (err) {
      console.error('[Publish] chooseImage failed:', err)
    }
  },

  onDeleteImage(e) {
    const idx = e.currentTarget.dataset.index
    const images = this.data.images.filter((_, i) => i !== idx)
    this.setData({ images })
  },

  onTagsChange(e) {
    this.setData({ selectedTags: e.detail.tags })
  },

  onVoiceClick() {
    showToast('语音功能开发中')
  },

  // 上传单张图片到云存储
  uploadImage(filePath, index) {
    const ext = filePath.split('.').pop() || 'jpg'
    const cloudPath = `creativity/${Date.now()}_${index}.${ext}`
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success(res) {
          resolve(res.fileID)
        },
        fail(err) {
          console.error('[Publish] uploadFile failed:', err)
          reject(err)
        }
      })
    })
  },

  async onPublish() {
    const { content, images, selectedTags } = this.data

    if (!content.trim()) {
      showToast('请输入创意内容')
      return
    }
    if (selectedTags.length === 0) {
      showToast('请至少选择一个标签')
      return
    }

    this.setData({ publishing: true })
    showLoading('发布中...')
    try {
      // 1. 先把本地图片上传到云存储，拿到 fileID 列表
      let fileIDs = []
      if (images.length > 0) {
        fileIDs = await Promise.all(
          images.map((img, idx) => this.uploadImage(img, idx))
        )
      }

      // 2. 调用云函数发布创意
      await callFunction('publishCreativity', {
        content: content.trim(),
        images: fileIDs,
        tags: selectedTags
      })
      hideLoading()
      showToast('发布成功', 'success')
      // 清空数据和草稿
      this.setData({ content: '', images: [], selectedTags: [] })
      wx.removeStorageSync('publish_draft')
      setTimeout(() => {
        wx.switchTab({ url: '/pages/today/index' })
      }, 1500)
    } catch (err) {
      hideLoading()
      console.error('[Publish] failed:', err)
      showToast('发布失败')
    } finally {
      this.setData({ publishing: false })
    }
  },

  onSaveDraft() {
    const { content, images, selectedTags } = this.data
    wx.setStorageSync('publish_draft', { content, images, tags: selectedTags })
    showToast('草稿已保存', 'success')
  }
})
