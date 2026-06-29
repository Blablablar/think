// utils/constants.js - 常量定义

// 22个应用市场分类标签
const CREATIVITY_TAGS = [
  '游戏', '社交', '购物', '教育', '工具', '生活', '娱乐', '新闻',
  '音乐', '视频', '摄影', '效率', '健康', '美食', '旅游', '金融',
  '图书', '导航', '体育', '商务', '天气', '医疗'
]

// 内容字数限制
const MAX_CONTENT_LENGTH = 400

// 分页大小
const PAGE_SIZE = 10

// 认领时效（7天，单位毫秒）
const CLAIM_EXPIRE_MS = 7 * 24 * 60 * 60 * 1000

module.exports = {
  CREATIVITY_TAGS,
  MAX_CONTENT_LENGTH,
  PAGE_SIZE,
  CLAIM_EXPIRE_MS
}
