// pages/publish/index.js
const { callFunction, showToast, showLoading, hideLoading } = require('../../utils/cloud.js')
const { compressImage } = require('../../utils/util.js')
const { MAX_CONTENT_LENGTH } = require('../../utils/constants.js')

Page({
  data: {
    title: '',
    content: '',
    images: [],
    selectedTags: [],
    publishing: false,
    maxContent: MAX_CONTENT_LENGTH,
    maxTitle: 30,
    showDraftTip: false,
    tagOptions: ['插画', '摄影', '写作', '音乐', '手工', '生活', '设计', '视频']
  },

  onLoad() {
    // 加载草稿
    const draft = wx.getStorageSync('publish_draft')
    if (draft) {
      this.setData({
        title: draft.title || '',
        content: draft.content || '',
        images: draft.images || [],
        selectedTags: draft.tags || [],
        showDraftTip: true
      })
      // 3秒后隐藏草稿提示
      setTimeout(() => {
        this.setData({ showDraftTip: false })
      }, 3000)
    }
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value.slice(0, this.data.maxTitle) })
    this.autoSaveDraft()
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value.slice(0, MAX_CONTENT_LENGTH) })
    this.autoSaveDraft()
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
      this.autoSaveDraft()
    } catch (err) {
      console.error('[Publish] chooseImage failed:', err)
    }
  },

  onDeleteImage(e) {
    const idx = e.currentTarget.dataset.index
    const images = this.data.images.filter((_, i) => i !== idx)
    this.setData({ images })
    this.autoSaveDraft()
  },

  onToggleTag(e) {
    const tag = e.currentTarget.dataset.tag
    let selectedTags = [...this.data.selectedTags]

    const index = selectedTags.indexOf(tag)
    if (index > -1) {
      selectedTags.splice(index, 1)
    } else {
      selectedTags.push(tag)
    }

    this.setData({ selectedTags })
    this.autoSaveDraft()
  },

  onCancel() {
    // 如果有内容，提示是否保存草稿
    if (this.data.title.trim() || this.data.content.trim() || this.data.images.length > 0) {
      wx.showModal({
        title: '提示',
        content: '是否保存草稿？',
        confirmText: '保存',
        cancelText: '不保存',
        success: (res) => {
          if (res.confirm) {
            this.saveDraft()
          }
          wx.navigateBack()
        }
      })
    } else {
      wx.navigateBack()
    }
  },

  // 自动保存草稿
  autoSaveDraft() {
    const { title, content, images, selectedTags } = this.data
    wx.setStorageSync('publish_draft', { title, content, images, tags: selectedTags })
  },

  // 手动保存草稿
  saveDraft() {
    const { title, content, images, selectedTags } = this.data
    wx.setStorageSync('publish_draft', { title, content, images, tags: selectedTags })
    this.setData({ showDraftTip: true })
    setTimeout(() => {
      this.setData({ showDraftTip: false })
    }, 3000)
    showToast('草稿已保存', 'success')
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
    const { title, content, images, selectedTags } = this.data

    if (!title.trim()) {
      showToast('请输入标题')
      return
    }
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
        title: title.trim(),
        content: content.trim(),
        images: fileIDs,
        tags: selectedTags
      })
      hideLoading()
      showToast('发布成功', 'success')
      // 清空数据和草稿
      this.setData({ title: '', content: '', images: [], selectedTags: [] })
      wx.removeStorageSync('publish_draft')
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/home' })
      }, 1500)
    } catch (err) {
      hideLoading()
      console.error('[Publish] failed:', err)
      showToast('发布失败')
    } finally {
      this.setData({ publishing: false })
    }
  }
})
