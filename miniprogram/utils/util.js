// utils/util.js - 通用工具函数

/**
 * 格式化时间
 */
function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return Math.floor(diff / minute) + '分钟前'
  if (diff < day) return Math.floor(diff / hour) + '小时前'
  if (diff < 7 * day) return Math.floor(diff / day) + '天前'

  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day2 = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day2}`
}

/**
 * 获取今日日期字符串 YYYY-MM-DD
 */
function getToday() {
  const d = new Date()
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 获取今日中文日期
 */
function getTodayChinese() {
  const d = new Date()
  const weekDay = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getMonth() + 1}月${d.getDate()}日 星期${weekDay}`
}

/**
 * 图片压缩（保持比例，最大宽度 1920px）
 */
function compressImage(filePath) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: filePath,
      success(info) {
        const maxWidth = 1920
        let { width, height } = info
        if (width > maxWidth) {
          height = Math.floor(height * (maxWidth / width))
          width = maxWidth
        }
        wx.compressImage({
          src: filePath,
          quality: 80,
          compressedWidth: width,
          success(res) {
            resolve(res.tempFilePath)
          },
          fail(err) {
            console.error('[util] compressImage failed:', err)
            resolve(filePath)
          }
        })
      },
      fail(err) {
        console.error('[util] getImageInfo failed:', err)
        resolve(filePath)
      }
    })
  })
}

module.exports = {
  formatTime,
  getToday,
  getTodayChinese,
  compressImage
}
