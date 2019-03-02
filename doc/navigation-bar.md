# navigation-bar

自定义导航组件, 项目参考[mp-navigation-bar](https://github.com/moesuiga/mp-navigation-bar#readme).

## 使用方法

### 导航配置及组件引用

在`app.json`配置文件中将导航栏样式设置为**自定义导航栏**。[微信小程序官方说明](https://developers.weixin.qq.com/miniprogram/dev/framework/config.html#window)

```js
// app.json
{
  "window": {
    "navigationStyle": "custom"
  }
}
```

将组件添加到项目中, 在页面对应`page.json`或`app.json`添加组件引用配置, 注意检查引用路径是否正确。

```js
// app.json 或 page.json
{
  "usingComponents": {
    "navigation-bar": "./components/navigation-bar/index"
  }
}
```

#### homePath设置使用方法

组件回到首页按钮中 **首页的默认值为 `/pages/index/index`，可以在`app.js`进行自定义配置**。如果页面原本就是`/pages/index/index`, 可忽略此配置。

```js
// app.js
App({
  onLaunch () {},
  globalData: {},
  appConfig: {
    appHomePath: '/pages/artical/list', // 自定义导航首页路径
  }
})
```

## 示例代码

下面是一个简单的完整示例：

```html
<navigation-bar
  title="{{pageTitle}}"
  bg-color="{{bgColor}}"
  show-home="{{showHome}}"
  opacity="{{opacity}}"
  capsule="{{capsule}}"
  bindhome="homeTap"
  bindtitletap="handleTitleTap">
  <view slot="action">分享</view>

  <view>
    页面内容
  </view>
</navigation-bar>
```

wxml 使用中需要将页面内容放在组件中作为组件内容，注意组件的嵌套是否正确。

```javascript
Page({
  data() {
    pageTitle: '微信小程序',
    bgColor: '#fff',
    opacity: 0.8, // 标题栏透明度
    showHome: false,
    capsule: true, // 胶囊样式 or 扁平化样式
  },
  // 标题点击处理
  handleTitleTap() {
    wx.showToast({
      title: '点击标题'
    })
  },
  // 首页点击处理事件
  homeTap() {}
})
```

## 组件说明

### 组件属性

| 属性名称　　　　　  | 类型    | 默认值     | 必须 | 说明                                                                                         |
| :--------------- | ------- | ---------- | ---- | -------------------------------------------------------------------------------------------- |
| title        | String  | 未命名标题 | 否   | 导航栏标题                                                                                   |
| prevent-home | Boolean | false      | 否   | 是否阻止点击首页默认跳转事件                                                                 |
| prevent-back | Boolean | false      | 否   | 是否阻止点击返回按钮默认跳转事件                                                             |
| delta        | Number  | 1          | 否   | 返回的页面数                                                                                 |
| show-home    | Boolean | true       | 否   | 是否显示首页按钮                                                                             |
| hide-back    | Boolean | false      | 否   | 是否隐藏返回按钮                                                                             |
| bg-color     | String  | white      | 否   | 导航栏背景色                                                                                 |
| opacity   | String  | 1          | 否   | 透明度(可配合实现滚动淡入效果)                                                               |
| text-style   | String  | dark       | 否   | 导航栏标题文字颜色 (dark/light)                                                              |
| capsule      | Boolean | false      | 否   | 是否是胶囊样式; 为`false`是为扁平化按钮，没有胶囊边框/背景/中线分割等                        |
| auto-capsule | Boolean | true       | 否   | 是否根据 `text-style` 自动更改小程序默认胶囊颜色                                             |
| auto-height  | Boolean | true       | 否   | 是否由内容自动撑开高度, 为 `false` 时，会设置 `height: 100%`，请注意给父组件设置高度 (0.0.6) |

### 事件介绍

| 事件名称     | 参数   | 说明               |
| ------------ | ------ | ------------------ |
| bindback     | Object | 点击返回按钮的事件 |
| bindhome     | Object | 点击主页按钮的事件 |
| bindtitletap | Object | 标题点击事件       |

### slot

组件有两个 slot。默认 slot 为方便使用者装载页面内容使用。 由于导航为 fixed 定位，故不占用文档流位置，使用时需要在页面顶部留足相应的边距。 该插槽已经留出这部分边距，避免用户每个页面都手动设置一次。

第二个为用户自定义左上角位置的slot，name=action 该部分通过 absolute 定位在左侧。 使用时，建议设置 show-home=false hide-back=true 来隐藏默认 action 胶囊。

### 补充说明

为了方便当前页面处理，可以通过自定义导航组件属性方法获取相关数据, 相关用法参考[小程序组件间通信与事件](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/events.html)

```html
<navigation-bar id="customNavigationBar" title="{{pageTitle}}">
  <view>页面内容</view>
</navigation-bar>
```

```javascript
Page({
  data() {
    pageTitle: '微信小程序',
  },
  // 获取自定导航相关信息
  getNavigationData() {
    const { homePath, data, navigationData} = this.selectComponent('#customNavigationBar');
    /* homePath: 首页路径的值
      {
        homePath: '/pages/index/index'
      }
    */

    /* data 组件属性配置。格式如下：
    {
      data: {
        "isIOS": true,
        "justOnePage": true,
        "barHeight": 20,
        "refresh": false,
        "maxWidth": 177,
        "title": "微信小程序",
        "delta": 1,
        "showHome": true,
        "hideBack": false,
        "bgColor": "#fff",
        "textStyle": "dark",
        "autoCapsule": true,
        "autoHeight": true,
        "capsule": true,
        "opacity": 0.8,
        "preventHome": true,
        "preventBack": false
      }
    }
    */

    /* 这部分数据页面定位布局、设置顶部高度时可以用到。数据格式如下：
    {
      navigationData: {
        "windowWidth": 375, // 页面宽度
        "windowHeight": 667, // 页面高度
        "statusBarHeight": 20, // 状态栏高度
        "capsuleWidth": 87, // 胶囊宽度
        "barTitleHeight": 44, // 标题栏高度
        "barTitleMaxWidth": 177, // 标题栏最大宽度(文字够多显示...)
        "barTopHeight": 64 // 标题栏下边界距离屏幕最顶部距离(含状态栏高度)
      }
    }
    */
  }
})
```