Component({
  data: {
    selected: 0,
    color: "#666666",
    selectedColor: "#0D2B5B",
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        icon: "🏠"
      },
      {
        pagePath: "/pages/category/category",
        text: "分类",
        icon: "📋"
      },
      {
        pagePath: "/pages/auction/auction",
        text: "竞拍",
        icon: "⚡"
      },
      {
        pagePath: "/pages/profile/profile",
        text: "我的",
        icon: "👤"
      }
    ]
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      this.setData({
        selected: data.index
      })
      wx.switchTab({ url })
    }
  }
})
