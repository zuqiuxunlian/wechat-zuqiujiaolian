const parser = require('./parser');
const getRichTextNodes = require('./richtext').getRichTextNodes;

Component({
  properties: {
    md: {
      type: String,
      value: '',
      observer() {
        this.parseMd();
      }
    },
    type: {
      type: String,
      value: 'wemark'
    },
    link: {
      type: Boolean,
      value: false
    },
    highlight: {
      type: Boolean,
      value: false
    },
    tapable: {
      type: Boolean,
      value: false
    }
  },
  data: {
    parsedData: {},
    richTextNodes: []
  },
  methods: {
    parseMd() {
      if (this.data.md) {
        var parsedData = parser.parse(this.data.md, {
          link: this.data.link,
          highlight: this.data.highlight
        });

        // 文章中图片
        const images = [];
        parsedData.forEach(data => {
          if (data.isArray) {
            data.content.forEach(cont => {
              if (cont.type === 'image') {
                images.push(/^https?:/gi.test(cont.src) ? cont.src : `https:${cont.src}`);
              }
            })
          }
        })
        this.previewImages = images;

        // console.log('parsedData:', parsedData);
        if (this.data.type === 'wemark') {
          this.setData({
            parsedData
          });
        } else {
          // var inTable = false;
          var richTextNodes = getRichTextNodes(parsedData);
          this.setData({
            richTextNodes
          });

          /* // 分批更新
          var update = {};
          var batchLength = 1000;
          console.log(batchLength);
          for(var i=0; i<richTextNodes.length; i++){
          update['richTextNodes.' + i] = richTextNodes[i];
          if(i%batchLength === batchLength - 1){
          console.log(update);
          this.setData(update);
          update = {};
          }
          }
          this.setData(update);
          update = {}; */
        }

      }
    },
    // 图片预览
    previewImage(event) {
      if (!this.data.tapable) return;
      let { url } = event.currentTarget.dataset;
      if (!/^https?:/gi.test(url)) url = `https:${url}`

      wx.previewImage({
        current: url,
        urls: this.previewImages
      })
    },
    // 图片加载错误
    loadImageError(event) {
      const { iindex, bindex } = event.currentTarget.dataset;
      // this.setData({
      //   [`parsedData[${bindex}].content[${iindex}].src`]: '../../image/load-error.jpg'
      // })
    },
    // 复制链接
    copyLink(event) {
      if (!this.data.tapable) return;
      const { url } = event.currentTarget.dataset;

      // 公众号文章 or 业务域名文章
      if (/mp\.weixin\.qq.com/gi.test(url) || /bbs\.zuqiuxunlian\.com/gi.test(url)) {
        wx.safeNavigateTo({
          url: `/pages/webview/webview?jumpUrl=${encodeURIComponent(url)}`
        })
      } else {
        wx.setClipboardData({
          data: url,
          success(res) {
            wx.showToast({
              title: '链接复制成功',
              icon: 'none',
              duration: 2000
            })
          }
        })
      }
    }
  }
});
