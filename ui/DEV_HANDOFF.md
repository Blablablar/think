# 灵感岛 · 微信小程序开发交接文档

> 基于 UI 设计稿 v2.0 | 设计稿宽度 375px | 2026-06-30  
> 设计系统文件: `design-system.css`  
> 页面效果图: `home.png` / `following.png` / `detail.png` / `publish.png` / `messages.png` / `profile.png`

---

## 一、App 配置

### 1.1 app.json — TabBar

```json
{
  "pages": [
    "pages/home/home",
    "pages/following/following",
    "pages/publish/publish",
    "pages/messages/messages",
    "pages/profile/profile",
    "pages/detail/detail"
  ],
  "window": {
    "navigationStyle": "custom",
    "backgroundTextStyle": "light"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#534AB7",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "pages/home/home",
        "text": "首页",
        "iconPath": "images/tab-home.png",
        "selectedIconPath": "images/tab-home-active.png"
      },
      {
        "pagePath": "pages/following/following",
        "text": "关注",
        "iconPath": "images/tab-heart.png",
        "selectedIconPath": "images/tab-heart-active.png"
      },
      {
        "pagePath": "pages/publish/publish",
        "text": "发布",
        "iconPath": "images/tab-publish.png",
        "selectedIconPath": "images/tab-publish.png"
      },
      {
        "pagePath": "pages/messages/messages",
        "text": "消息",
        "iconPath": "images/tab-message.png",
        "selectedIconPath": "images/tab-message-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "images/tab-profile.png",
        "selectedIconPath": "images/tab-profile-active.png"
      }
    ]
  }
}
```

**注意**: 发布 Tab 中间图标使用自定义凸起圆形按钮样式（紫色渐变 + 阴影），微信原生 tabBar 不直接支持，建议两种实现方式:
- **方案 A（推荐）**: 用 `custom-tab-bar` 自定义组件覆盖，`app.json` 设置 `"tabBar": { "custom": true }`
- **方案 B**: 中间 Tab 用普通图标，发布时跳转到独立页面

### 1.2 页面路由表

| 页面路径 | 导航栏 | TabBar | 说明 |
|---------|--------|--------|------|
| `pages/home/home` | 紫色 + 标题「首页」 | 首页高亮 | 探索发现主页 |
| `pages/following/following` | 紫色 + 标题「关注」 | 关注高亮 | 关注/收藏双 Tab |
| `pages/publish/publish` | 紫色 + 标题「发布创意」 | 发布高亮 | 富文本编辑发布 |
| `pages/messages/messages` | 白色 + 标题「消息」 | 消息高亮 | 互动/系统通知 |
| `pages/profile/profile` | 透明（沉浸式） | 我高亮 | 个人中心 |
| `pages/detail/detail` | 白色 + 返回 + 标题「创意详情」 | 无 | 创意详情子页 |

---

## 二、设计系统速查

### 2.1 核心 Design Token（详见 design-system.css）

```
品牌色:       #534AB7 (主紫) → #42389E (深紫) → #EAE6FF (浅紫背景)
微信绿:       #07C160 (成功/开关)
语义色:       成功 #07C160  |  警告 #FA9D3B  |  错误 #FA5151
文字层级:     #1A1A1A(主) → #666(次) → #999(辅助) → #BFBFBF(禁用)
输入占位:     #CCCCCC
背景层:       #F5F5F5(page) → #FFF(card) → #F7F8FA(input)
边框/分割:    #E8E8E8(default) → #F0F0F0(light)
```

### 2.2 字体

```
字体栈:  -apple-system, SF Pro Text, PingFang SC, Helvetica Neue, Microsoft YaHei
字号级:  10 / 11 / 12 / 14 / 15 / 17 / 20 / 24 / 30 (px)
字重:    400(regular) / 500(medium) / 600(semibold) / 700(bold)
行高:    1.25(tight) / 1.45(normal) / 1.6(relaxed)
```

### 2.3 间距（4px 基准）

```
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 (px)
```

### 2.4 圆角

```
sm: 4px  |  md: 8px  |  lg: 12px  |  xl: 16px  |  2xl: 20px  |  full: 50%
```

### 2.5 组件高度速查

| 组件 | 高度 | 圆角 |
|------|------|------|
| 导航栏 | 44px | — |
| TabBar | 50px + 34px(safe) | — |
| 标签 Chip | 28px (默认) / 22px (小) | 14px / 11px |
| 按钮 sm/md/lg/xl | 28 / 36 / 44 / 48 px | 8px (md以上) |
| 输入框 | 44px | 8px |
| 头像 xs/sm/md/lg/xl | 24/32/40/72/88 px | full |
| 搜索框 | 36px | 18px |

---

## 三、可复用组件清单

| 组件名 | 使用页面 | CSS 类 | 变体 |
|--------|---------|--------|------|
| **NavBar** | 全部 | `.navbar` / `.navbar--white` | 紫色底/白色底/透明沉浸式 |
| **TabBar** | home/following/messages/profile | `.tabbar` | 自定义组件（中间发布按钮凸起） |
| **Tag/Chip** | home/following/publish | `.tag--default` / `.tag--active` / `.tag--green` | 默认/选中 (淡紫底紫字) / 绿色 |
| **Button** | 全部 | `.btn--primary` / `.btn--secondary` / `.btn--outline` / `.btn--ghost` / `.btn--green` | 4尺寸 × 5风格 |
| **Avatar** | detail/following/profile | `.avatar` / `.avatar--xs/sm/lg/xl` | 5尺寸 |
| **Card** | home/following | `.card` | 白色圆角卡片 |
| **Badge** | messages | `.badge-dot` (红点) / `.badge-count` (数字) | 2种 |
| **StatCard** | profile | `.stat-card` | 三栏数据卡片 |
| **CommentBar** | detail | `.comment-bar` | 固定在底部 |
| **Banner轮播** | home | 自定义 swiper | 3张自动轮播 + 圆点指示器 |
| **CategoryGrid** | home | 自定义 grid | 8宫格图标导航 |
| **EmptyState** | 全局 | `.empty-state` | 空状态占位 |

---

## 四、页面详细规格

### 4.1 首页 `pages/home/home`

**导航栏**: 紫色底 + 搜索框（36px高, 18px圆角, 浅灰底 + 放大镜图标 + 占位文字"搜索灵感..."）  
**导航栏标题**: 「首页」

**页面结构** (自上而下):
```
1. 搜索框 (在导航栏内, 不可点击跳转至搜索页)
2. Banner 轮播 (3张, 140px高, 12px圆角, 3.5s自动播放 + 圆点指示器)
   - 每张: 渐变覆盖层 + 毛玻璃标签(如"🔥 本周热门") + 标题 + 参与数据
   - 支持触摸滑动
3. 探索分类 8宫格 (图标+文字, 插画/摄影/写作/音乐/手工/生活/设计/视频)
4. 热门话题 Chip列表 (横向滚动, 🔥标记)
5. 推荐创意 Feed流 (白色圆角卡片列表)
   - 每张卡片: 作者头像+昵称+时间 | 推荐理由标签(如"你关注的人也在看") | 标题 | 摘要(2行截断) | 图片(单图全宽160px / 多图横滑) | 底部互动栏(空心星+数量 | 评论+数量)
```

**卡片图片展示规则**:
- 插画/摄影类 → 单图 160px 高全宽, 或 多图横滑 (104×104)
- 写作类 → 仅文字摘要, 无图片
- 首张图片做渐变占位效果

**状态**: 
- 加载中: 骨架屏 (shimmer)
- 空状态: 图标 + "暂无推荐内容"

### 4.2 关注 `pages/following/following`

**导航栏**: 紫色底 + 标题「关注」  
**子导航**: 关注 / 收藏 双 Tab 切换 (brand-purple 下划线指示器)

**页面结构**:
```
1. 关注 / 收藏 Tab 切换条
2. 关注Tab内容 → Feed流 (与首页卡片样式一致, 额外显示「已关注」紫色星标徽章)
3. 收藏Tab内容 → Feed流 (用户收藏的创意)
```

**交互**: 切换 Tab 时内容区域平滑过渡

### 4.3 发布 `pages/publish/publish`

**导航栏**: 紫色底 + 标题「发布创意」+ 右侧关闭/取消按钮

**页面结构**:
```
1. 正文输入区 (无边框 textarea, 灰色背景 #F5F5F5)
   - placeholder: "记录你的灵感..."
   - 支持段落间插入图片 (虚线"点击插入图片"入口)
   - 已插入图片显示为渐变预览图 + 删除按钮
2. 分类标签选择 (28px pill形 Chip列表, 横向滚动)
   - 选项: 插画/摄影/写作/音乐/手工/生活/设计/视频
   - 默认态: 灰底灰字, 选中态: 淡紫底紫字
   - 间距: 标签之间 8px, 与正文区间距 24px
3. 草稿提示: "已自动保存草稿" (灰色小字)
4. 底部发布按钮 (全宽, 46px高, 品牌紫纯色 #534AB7, 无圆角卡片包裹)
```

**已移除的功能**: ❌ 语音录制 ❌ 模式选择器 ❌ 发布设置（认领开关）❌ 附件按钮 ❌ 白色圆角卡片背景

### 4.4 消息 `pages/messages/messages`

**导航栏**: 白色底 + 标题「消息」

**页面结构**:
```
1. 互动 / 系统 双 Tab 切换
   - 系统Tab显示未读红点（有未读时）
2. 时间分组: 刚刚 / 今天 / 昨天
3. 消息类型:
   - 评论消息: 头像 + 昵称 + "评论了你的创意" + 引用预览(灰色截断) + 时间
   - 多人点赞: N个重叠头像 + "张三、李四等5人赞了你的创意" + 时间
   - 认领通过: 头像 + "你的认领已通过" + 绿色"已通过"徽章 + 时间
   - 关注消息: 头像 + 昵称 + "关注了你" + 时间
   - 回复消息: 头像 + 昵称 + "回复了你的评论" + 引用预览 + 时间
4. 未读标记: 蓝色圆点 + 行左侧浅紫色背景
5. 系统通知:
   - 🔔 图标 + 标题 + 描述 + 时间
   - 创意推荐到首页 / 获得优质原创标签 / 版本更新 / 活动提醒
```

**交互**: 
- Tab 切换时 JavaScript 控制内容面板显隐
- 系统Tab红点随切换消失

### 4.5 个人中心 `pages/profile/profile`

**导航栏**: 透明沉浸式（背景图延伸至导航栏区域）  
**页面结构**:
```
1. 顶部渐变背景区 (brand-purple → 白色)
2. 头像 + 昵称 + ID + 简介
3. 右上角编辑按钮 (36×36 正圆形, 白色半透明底 + 编辑图标)
4. 数据卡片 (发布 | 关注 | 粉丝, 三栏, 数值加粗)
5. 内容Tab: 我的创意 / 认领 / 收藏 (下划线切换)
6. 创意/认领/收藏 列表 (卡片流)
7. 常用功能: 创作灵感 | 草稿箱 | 浏览记录 | 设置
8. 其他: 关于我们 | 意见反馈
```

**已移除**: ❌ 连续创作 ❌ 获认领数 ❌ 影响力 ❌ 月度精选 ❌ 消息入口

### 4.6 创意详情 `pages/detail/detail`

**导航栏**: 白色底 + 返回按钮 + 标题「创意详情」  
**底部栏**: 固定评论输入区（position: fixed, bottom: 0）

**页面结构**:
```
1. 创意主体:
   - 作者信息行 (头像 + 昵称 + 关注按钮 + 更多菜单)
   - 正文内容（富文本, 图文混排）
   - 底部互动区 (点赞❤ | 评论 | 分享)
2. 评论区:
   - 评论列表 (时间倒序)
   - 多轮回复 (紫色竖线缩进 + 24px小头像 + 作者徽章)
   - 折叠入口: "展开更多回复"
3. 底部评论输入栏:
   - 圆角输入框 placeholder: "说点什么吧..."
   - 右侧「发布」按钮 (36px高, 18px圆角, 品牌紫底白字)
```

**交互**: 
- 点赞: 点击爱心切换填充/空心
- 评论回复: 点击某条评论 → 输入框聚焦 → placeholder 变为"回复 @昵称"
- 多轮回复展开/折叠

---

## 五、数据模型参考

### 5.1 创意 Card 数据结构

```ts
interface CreativeCard {
  id: string;
  author: {
    name: string;
    avatar: string;
    isFollowing: boolean;       // 关注页显示"已关注"标记
  };
  title: string;
  summary: string;              // 2行截断
  images: string[];             // 空数组 = 纯文字卡片, 1张 = 单图, 多张 = 横滑
  category: 'illustration' | 'photography' | 'writing' | 'music' | 'handcraft' | 'lifestyle' | 'design' | 'video';
  stats: {
    likes: number;
    comments: number;
  };
  recommendReason?: string;     // 推荐理由标签, e.g. "你关注的XX也在看"
  createdAt: string;            // ISO datetime
}
```

### 5.2 评论数据结构

```ts
interface Comment {
  id: string;
  author: { name: string; avatar: string; isAuthor: boolean };
  content: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];          // 多轮回复
}
```

### 5.3 消息数据结构

```ts
type MsgType = 'comment' | 'like_batch' | 'claim_approved' | 'follow' | 'reply' | 'system';

interface Message {
  id: string;
  type: MsgType;
  read: boolean;
  users: { name: string; avatar: string }[];
  title: string;                // 标题
  preview?: string;             // 引用预览(评论/回复类)
  badge?: string;               // e.g. "已通过"
  createdAt: string;
}
```

### 5.4 Banner 数据结构

```ts
interface Banner {
  id: string;
  tag: string;                  // e.g. "🔥 本周热门"
  title: string;                // e.g. "「城市孤独症」摄影企划"
  meta: string;                 // e.g. "68位创作者参与 · 1.2k 作品"
  gradient: string;             // CSS gradient 值
  link?: string;                // 可选的跳转路径
}
```

---

## 六、图标资源清单

以下图标需要准备 SVG 或 PNG 资源（建议用 iconfont 或 SVG sprite）：

| 图标 | 用途 | 页面 |
|------|------|------|
| 🔍 搜索(放大镜) | 搜索框 | home |
| 🏠 首页(房子) | TabBar | 全局 |
| ♥ 爱心(空心) | 关注 Tab + 点赞 | 全局 |
| ➕ 发布(加号) | 发布按钮 | 全局 (custom tabbar) |
| 💬 消息(聊天气泡) | TabBar | 全局 |
| 👤 我的(人像) | TabBar | 全局 |
| ⬅ 返回箭头 | 导航栏返回 | detail |
| ⭐ 收藏(空心星) | Feed卡片 | home / following |
| 💬 评论(气泡) | Feed卡片 + 评论区 | home / detail |
| ↗ 分享 | 详情页 | detail |
| ⋯ 更多(三点) | 卡片菜单 | detail / profile |
| ✏️ 编辑 | 个人中心编辑按钮 | profile |
| 🔔 通知 | 系统消息 | messages |
| 📷 图片 | 发布页插入图片 | publish |
| ❌ 删除/关闭 | 图片删除 / 页面关闭 | publish / detail |

---

## 七、微信小程序适配要点

### 7.1 自定义导航栏
所有页面均使用 `"navigationStyle": "custom"`，需要手动处理：
- 状态栏高度: `wx.getSystemInfoSync().statusBarHeight` (iOS 约 44px, Android 约 24-32px)
- 导航栏内容高度: 44px
- 总顶栏高度 = 状态栏 + 44px
- 底部安全区: `wx.getSystemInfoSync().safeArea.bottom`

### 7.2 rpx 换算
设计稿基准宽度 375px → **2rpx = 1px**

| 设计稿 px | rpx |
|-----------|-----|
| 12px | 24rpx |
| 14px | 28rpx |
| 16px | 32rpx |
| 24px | 48rpx |
| 375px | 750rpx |

### 7.3 轮播
首页 Banner 轮播使用微信原生 `<swiper>` 组件:
```html
<swiper autoplay circular interval="3500" indicator-dots>
  <swiper-item wx:for="{{banners}}" wx:key="id">...</swiper-item>
</swiper>
```

### 7.4 条件编译（如需要适配其他平台）
暂无多端需求，直接使用微信小程序原生 API。

### 7.5 图片懒加载
Feed 列表较长时使用 `<image lazy-load>` 属性。

### 7.6 触控反馈
所有可点击元素建议添加 `hover-class` 实现按下态反馈。

---

## 八、页面效果图索引

| 文件 | 页面 | 尺寸 |
|------|------|------|
| `home.html` / `home.png` | 首页（搜索+Banner+分类+Feed） | 375×812 @2x |
| `following.html` / `following.png` | 关注（关注/收藏双Tab+Feed流） | 375×812 @2x |
| `detail.html` / `detail.png` | 创意详情（正文+评论+回复） | 375×812 @2x |
| `publish.html` / `publish.png` | 发布创意（富文本+标签+发布） | 375×812 @2x |
| `messages.html` / `messages.png` | 消息（互动/系统双Tab） | 375×812 @2x |
| `profile.html` / `profile.png` | 个人中心（数据+内容+功能） | 375×812 @2x |
| `design-system.css` | 设计系统 CSS 变量 + 基础组件 | — |

---

## 九、建议开发顺序

```
Phase 1: Design System → 全局样式变量 + 基础组件 (NavBar/TabBar/Button/Tag/Card/Avatar)
Phase 2: 首页 (home) → 搜索框 + Banner轮播 + 分类网格 + Feed卡片
Phase 3: 关注 (following) → Tab切换 + Feed流 + 已关注标记
Phase 4: 创意详情 (detail) → 正文渲染 + 评论列表 + 多轮回复 + 底部输入栏
Phase 5: 发布 (publish) → 富文本输入 + 图文混排 + 标签选择 + 发布按钮
Phase 6: 消息 (messages) → 双Tab + 时间分组 + 消息类型 + 未读状态
Phase 7: 个人中心 (profile) → 沉浸式头部 + 数据卡 + 内容Tab + 功能菜单
Phase 8: 联调 + 细节打磨
```

---

_文档生成时间: 2026-06-30 | UI Designer_
