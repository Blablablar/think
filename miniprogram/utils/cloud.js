// utils/cloud.js - 云函数调用封装

/**
 * 调用云函数
 * @param {string} name 云函数名
 * @param {object} data 入参
 * @returns {Promise<any>}
 */
function callFunction(name, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success(res) {
        const result = res.result
        if (result && result.code === 0) {
          resolve(result.data)
        } else {
          console.error(`[Cloud] ${name} failed:`, result && result.message)
          reject(new Error((result && result.message) || '请求失败'))
        }
      },
      fail(err) {
        console.error(`[Cloud] ${name} error:`, err)
        reject(err)
      }
    })
  })
}

/**
 * 显示 toast
 */
function showToast(title, icon = 'none') {
  wx.showToast({ title, icon })
}

/**
 * 显示 loading
 */
function showLoading(title = '加载中') {
  wx.showLoading({ title, mask: true })
}

function hideLoading() {
  wx.hideLoading()
}

module.exports = {
  callFunction,
  showToast,
  showLoading,
  hideLoading
}
