// pages/submitImpl/index.js
const { callFunction, showToast, showLoading, hideLoading } = require('../../utils/cloud.js')
const { compressImage } = require('../../utils/util.js')

const MAX_DESC_LENGTH = 500
const MAX_SCREENSHOTS = 9
const MAX_VIDEO_DURATION = 30 // 秒

Page({
  data: {
    mode: 'create', // create | edit
    creativityId: '',
    claimId: '',
    implId: '',
    description: '',
    screenshots: [],
    videoUrl: '', // 云存储 fileID（编辑模式预填）
    videoTempPath: '', // 本地临时路径（新建/替换时）
    videoChanged: false,
    maxDesc: MAX_DESC_LENGTH,
    submitting: false
  },

  onLoad(options) {
    if (!options) {
      showToast('参数缺失')
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    if (options.id) {
      // 编辑模式：从我的实现成果进入
      this.setData({
        mode: 'edit',
        implId: options.id
      })
      this.loadImpl(options.id)
    } else if (options.creativityId && options.claimId) {
      // 新建模式：从详情页认领后进入
      this.setData({
        creativityId: options.creativityId,
        claimId: options.claimId
      })
    } else {
      showToast('参数缺失')
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  // 编辑模式：加载已有实现成果
  async loadImpl(id) {
    try {
      showLoading('加载中...')
      // 复用 getMyImplementations 拿到我的成果列表，再过滤
      const res = await callFunction('getMyImplementations', { page: 1, pageSize: 100 })
      const list = res.list || []
      const impl = list.find(i => i._id === id)
      hideLoading()
      if (!impl) {
        showToast('成果不存在')
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }
      this.setData({
        creativityId: impl.creativityId,
        claimId: impl.claimId,
        description: impl.description || '',
        screenshots: impl.screenshots || [],
        videoUrl: impl.videoUrl || ''
      })
    } catch (err) {
      hideLoading()
      console.error('[SubmitImpl] loadImpl failed:', err)
      showToast('加载失败')
    }
  },

  onDescInput(e) {
    this.setData({ description: e.detail.value.slice(0, MAX_DESC_LENGTH) })
  },

  // 选择截图
  async onChooseImage() {
    const remain = MAX_SCREENSHOTS - this.data.screenshots.length
    if (remain <= 0) {
      showToast('最多上传9张截图')
      return
    }
    try {
      const res = await wx.chooseMedia({
        count: remain,
        mediaType: ['image'],
        sizeType: ['compressed']
      })
      const compressed = await Promise.all(
        res.tempFiles.map(f => compressImage(f.tempFilePath))
      )
      this.setData({
        screenshots: [...this.data.screenshots, ...compressed].slice(0, MAX_SCREENSHOTS)
      })
    } catch (err) {
      console.error('[SubmitImpl] chooseImage failed:', err)
    }
  },

  onDeleteImage(e) {
    const idx = e.currentTarget.dataset.index
    const screenshots = this.data.screenshots.filter((_, i) => i !== idx)
    this.setData({ screenshots })
  },

  // 预览截图
  onPreviewImage(e) {
    const idx = e.currentTarget.dataset.index
    wx.previewImage({
      current: this.data.screenshots[idx],
      urls: this.data.screenshots
    })
  },

  // 选择视频
  async onChooseVideo() {
    try {
      const res = await wx.chooseMedia({
        count: 1,
        mediaType: ['video'],
        maxDuration: MAX_VIDEO_DURATION,
        camera: 'back'
      })
      const file = res.tempFiles[0]
      if (!file) return
      if (file.duration > MAX_VIDEO_DURATION) {
        showToast(`视频不能超过${MAX_VIDEO_DURATION}秒`)
        return
      }
      this.setData({
        videoTempPath: file.tempFilePath,
        videoUrl: '',
        videoChanged: true
      })
    } catch (err) {
      console.error('[SubmitImpl] chooseVideo failed:', err)
    }
  },

  onDeleteVideo() {
    this.setData({
      videoTempPath: '',
      videoUrl: '',
      videoChanged: true
    })
  },

  // 上传单张截图到云存储
  uploadScreenshot(filePath, index) {
    const ext = filePath.split('.').pop() || 'jpg'
    const cloudPath = `implementation/${Date.now()}_${index}.${ext}`
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success(res) {
          resolve(res.fileID)
        },
        fail(err) {
          console.error('[SubmitImpl] uploadScreenshot failed:', err)
          reject(err)
        }
      })
    })
  },

  // 上传视频到云存储
  uploadVideo(filePath) {
    const cloudPath = `implementation/video_${Date.now()}.mp4`
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success(res) {
          resolve(res.fileID)
        },
        fail(err) {
          console.error('[SubmitImpl] uploadVideo failed:', err)
          reject(err)
        }
      })
    })
  },

  // 判断是否为云存储 fileID / http 链接（编辑模式预填的图片无需重新上传）
  isRemotePath(p) {
    return typeof p === 'string' && (p.indexOf('cloud://') === 0 || p.indexOf('http') === 0)
  },

  async onSubmit() {
    const { mode, description, screenshots, videoTempPath, videoUrl, videoChanged } = this.data

    if (!description.trim()) {
      showToast('请输入成果描述')
      return
    }
    if (screenshots.length === 0 && !videoTempPath && !videoUrl) {
      showToast('请至少上传一张截图或一段视频')
      return
    }

    this.setData({ submitting: true })
    showLoading('提交中...')
    try {
      // 上传截图：本地路径才需要上传
      const uploadTasks = screenshots.map((s, idx) =>
        this.isRemotePath(s) ? Promise.resolve(s) : this.uploadScreenshot(s, idx)
      )
      const screenshotFileIDs = await Promise.all(uploadTasks)

      // 上传视频
      let finalVideoUrl = ''
      if (videoChanged) {
        if (videoTempPath) {
          finalVideoUrl = await this.uploadVideo(videoTempPath)
        } else {
          finalVideoUrl = ''
        }
      } else {
        finalVideoUrl = videoUrl || ''
      }

      if (mode === 'create') {
        await callFunction('submitImplementation', {
          creativityId: this.data.creativityId,
          claimId: this.data.claimId,
          description: description.trim(),
          screenshots: screenshotFileIDs,
          videoUrl: finalVideoUrl
        })
      } else {
        await callFunction('updateImplementation', {
          id: this.data.implId,
          description: description.trim(),
          screenshots: screenshotFileIDs,
          videoUrl: finalVideoUrl
        })
      }

      hideLoading()
      showToast('提交成功', 'success')
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) {
      hideLoading()
      console.error('[SubmitImpl] submit failed:', err)
      showToast(err.message || '提交失败')
    } finally {
      this.setData({ submitting: false })
    }
  }
})
