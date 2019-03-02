const pageObject = {
  data: {
    pageTitle: '微信小程序',
    bgColor: '#fff',
    opacity: 0.8, // 标题栏透明度
    showHome: true,
    capsule: true, // 胶囊样式 or 扁平化样式


		navs: [1, 2, 3],
		isVisiable: false,
		navActiveIndex: 0,
		pos: [0, 0, 0],
		scrollTop: 0,
  },
  // 标题点击处理
  handleTitleTap() {
    // wx.showToast({
    //   title: '点击标题'
    // })
    const nav = this.selectComponent('#customNavigationBar');

    const { data, navigationData, homePath} = nav;
    console.log('data:', JSON.stringify(data, null, '\t'));
    console.log('navigationData:', JSON.stringify(navigationData, null, '\t'));
    console.log('homePath:', JSON.stringify(homePath, null, '\t'));
  },
  homeTap(event) {
    console.log('event:', event);
    console.log('homeTap:', '12345');
    return { 'b': '小强' }
  },
	onLoad() {
		this.queryNavNodeInfo().then(data => {
			let pos = data.map((item, i) => {
				const { height } = item.rect;
				return height;
			})

			// 设置scrollTop的值
			pos = pos.reduce((acc, cur, index, arr) => {
				if (index === 0) acc.push(0);
				else if (index === 1) acc.push(arr[0]);
				else acc.push(arr[index - 1] + arr[index - 2]);
				return acc;
			}, []);
			console.log(pos);
			this.setData({ pos });
		});
	},
	// 设置自定滚动
	setScrollTop(e) {
		const { index } = e.currentTarget.dataset;
		console.log(this.data.pos, e)
		this.setData({
			scrollTop: this.data.pos[index]
		})
	},
	// 滚动触发
	bindScroll(event) {
		const { scrollTop } = event.detail;
		this.setData({ isVisiable: !!(scrollTop > 2) })

		// 滚动查询节点位置
		this.queryNavNodeInfo().then(data => {
			if (data.length === 0) return;
			console.log(data);
			data.forEach((item, i) => {
				const {realRatio, rect} = item;
				const { top, bottom } = rect;
				if (top <= 0 && bottom >= 0) {
					this.setData({
						navActiveIndex: i
					})
				}
			})
		})
	},
	queryNavNodeInfo() {
		// dpr
		const screenWidth = wx.getSystemInfoSync().screenWidth || 375;
		const realRatio = 750 / screenWidth;
		if (typeof wx.createSelectorQuery !== 'function') {
			return Promise.resolve({
				realRatio,
				info: []
			});
		}
		const query = wx.createSelectorQuery();
		return Promise.all(this.data.navs.map((nav, index) => {
			return new Promise((resolve, reject) => {
				query.select(`#cont${index + 1}`).boundingClientRect(rect => {
					resolve({
						realRatio,
						rect
					})
				}).exec()
			}).then(({ realRatio, rect }) => {
				// 修正
				if (index > 0) {
					rect.top -= (80 / realRatio);
				} else {
					rect.height -= (80 / realRatio);
				}
				return { realRatio, rect };
			})
		}))
	}
}

Page(pageObject)