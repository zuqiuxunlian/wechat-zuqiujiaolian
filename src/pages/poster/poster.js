const storage = require('../../lib/storage');
const app = getApp();

Page({
  data: {
    pageFullStyle: '',
    posterData: {
      background: '#999',
      pages: [
        {
          id: 1,
          name: '第一页',
          image: [
            'http://qiniuimg.qingmang.mobi/image/orion/53b5106eaa7a4ab68597b142515e8c2e_3889_2588.jpeg',
            'http://qiniuimg.qingmang.mobi/image/orion/ef06bd41fdaa25392b2b93690fc1c90c_3130_2075.jpeg',
          ],
          description: ['记得早先少年时', '大家诚诚恳恳', '说一句', '是一句'],
          audio: '',
        },
        {
          id: 2,
          name: '第二页',
          image: ['http://qiniuimg.qingmang.mobi/image/orion/03d806068d907c629e2dcad70ee1c9bc_2932_4407.jpeg'],
          description: ['你将星球亮起', '引来', '生命潮汐'],
          audio: '',
        },
        {
          id: 3,
          name: '第三页',
          image: [
            'http://qiniuimg.qingmang.mobi/image/orion/798c4598cc44dba77adfd8250d5712c3_2173_3264.jpeg',
            'http://qiniuimg.qingmang.mobi/image/orion/abd6010ac656671a3e5b8946b2a26aa2_2175_2075.jpeg'
          ],
          description: ['你要去斯卡伯勒集市吗', '香芹、鼠尾草、迷迭香和百里香', '请代我问候住在那里的每一个人', '他曾经是我的真爱'],
          audio: '',
        },
        {
          id: 4,
          name: '第四页',
          image: ['http://qiniuimg.qingmang.mobi/image/orion/da0d8c4627fdcf13be631cd0c7b1ed90_3130_2075.jpeg'],
          description: ['谁会想起', '父亲带他去参观冰块的', '那个遥远下午'],
          audio: '',
        },
      ]
    },
    currentPage: 0,
  },
  onLoad() {
    const { windowHeight } = wx.getSystemInfoSync();
    this.setData({
      pageFullStyle: `height: ${windowHeight}px; width: 750rpx;`,
    })
  },
  onShareAppMessage() {
    return {
      title: '足球教练社区-关于我们',
      path: '/pages/about/about',
      imageUrl: 'https://static.zuqiuxunlian.com/16cc9b1362fe39cf91babbbd0bed22c9.jpg'
    }
  },
  // 纵向滚动
  verticalChange(event) {
    const { current } = event.detail;
    this.setData({
      currentPage: current
    })

    if (this.audioCtx) {
      const musicList = ['/audio/bg.mp3', 'https://static.zuqiuxunlian.com/audio/01.mp3', 'https://static.zuqiuxunlian.com/audio/02.mp3'];
      this.audioCtx.stop();
      this.audioCtx.src = musicList[current % 3];
      this.audioCtx.play();
    }
  },

  // 初始化完成添加背景音乐
  onReady(e) {
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.loop = true;
    innerAudioContext.src = '/audio/bg.mp3';
    innerAudioContext.onPlay(() => {
      // console.log('开始播放');
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })

    innerAudioContext.play();
    this.audioCtx = innerAudioContext;
  }
})
