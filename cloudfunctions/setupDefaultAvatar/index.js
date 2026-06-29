// 生成默认头像并上传到云存储
const cloud = require('wx-server-sdk')
const zlib = require('zlib')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// CRC32 计算（用于 PNG 校验）
function crc32(buf) {
  let crc = 0xFFFFFFFF
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xEDB88320 ^ (c >>> 1)
      else c = c >>> 1
    }
    table[n] = c
  }
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function buildChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcData = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcData), 0)
  return Buffer.concat([length, typeBuf, data, crc])
}

// 生成 200x200 默认头像 PNG（灰色背景 + 白色人形）
function createDefaultAvatar() {
  const width = 200
  const height = 200
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // color type: RGB
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const rowSize = 1 + width * 3
  const rawData = Buffer.alloc(height * rowSize)
  const cx = width / 2

  // 人形参数
  const headY = height * 0.38
  const headR = height * 0.18
  const bodyY = height * 0.95
  const bodyR = height * 0.38

  for (let y = 0; y < height; y++) {
    const offset = y * rowSize
    rawData[offset] = 0 // filter: none
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 3
      const dx = x - cx
      const dyHead = y - headY
      const dyBody = y - bodyY
      const headDist = Math.sqrt(dx * dx + dyHead * dyHead)
      const bodyDist = Math.sqrt(dx * dx + dyBody * dyBody)

      if (headDist < headR || bodyDist < bodyR) {
        // 白色人形
        rawData[px] = 255
        rawData[px + 1] = 255
        rawData[px + 2] = 255
      } else {
        // 灰色背景 #b2bec3
        rawData[px] = 178
        rawData[px + 1] = 190
        rawData[px + 2] = 195
      }
    }
  }

  const compressed = zlib.deflateSync(rawData)
  const ihdrChunk = buildChunk('IHDR', ihdr)
  const idatChunk = buildChunk('IDAT', compressed)
  const iendChunk = buildChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

exports.main = async (event, context) => {
  try {
    const pngBuffer = createDefaultAvatar()

    const result = await cloud.uploadFile({
      cloudPath: 'assets/default-avatar.png',
      fileContent: pngBuffer
    })

    return {
      code: 0,
      fileID: result.fileID,
      message: '默认头像上传成功'
    }
  } catch (err) {
    console.error('setupDefaultAvatar error:', err)
    return { code: -1, message: String(err), fileID: null }
  }
}
