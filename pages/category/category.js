// pages/category/category.js
Page({
  data: {
    // 三级分类数据
    // 一级分类（左侧菜单）
    firstLevel: [
      { id: 1, name: '手机通讯', icon: '📱' },
      { id: 2, name: '电脑办公', icon: '💻' },
      { id: 3, name: '影音娱乐', icon: '🎵' },
      { id: 4, name: '智能穿戴', icon: '⌚' },
      { id: 5, name: '摄影摄像', icon: '📷' },
      { id: 6, name: '外设配件', icon: '🔌' }
    ],
    
    // 当前选中的一级分类
    currentFirstId: 1,
    
    // 二三级分类（右侧内容）
    // 结构: { 一级id: [二级分类列表] }
    // 每个二级分类包含三级分类
    categoryTree: {
      1: [ // 手机通讯
        {
          id: 11,
          name: '智能手机',
          children: [
            { id: 111, name: 'iPhone' },
            { id: 112, name: '安卓手机' },
            { id: 113, name: '老人机' }
          ]
        },
        {
          id: 12,
          name: '手机配件',
          children: [
            { id: 121, name: '手机壳' },
            { id: 122, name: '充电器' },
            { id: 123, name: '数据线' },
            { id: 124, name: '移动电源' }
          ]
        }
      ],
      2: [ // 电脑办公
        {
          id: 21,
          name: '笔记本电脑',
          children: [
            { id: 211, name: '游戏本' },
            { id: 212, name: '轻薄本' },
            { id: 213, name: '商务本' }
          ]
        },
        {
          id: 22,
          name: '台式电脑',
          children: [
            { id: 221, name: '整机' },
            { id: 222, name: 'DIY配件' },
            { id: 223, name: '显示器' }
          ]
        },
        {
          id: 23,
          name: '办公设备',
          children: [
            { id: 231, name: '打印机' },
            { id: 232, name: '投影仪' },
            { id: 233, name: '扫描仪' }
          ]
        }
      ],
      3: [ // 影音娱乐
        {
          id: 31,
          name: '耳机音响',
          children: [
            { id: 311, name: '蓝牙耳机' },
            { id: 312, name: '有线耳机' },
            { id: 313, name: '音响' },
            { id: 314, name: '降噪耳机' }
          ]
        },
        {
          id: 32,
          name: '平板电视',
          children: [
            { id: 321, name: '智能电视' },
            { id: 322, name: '投影仪' },
            { id: 323, name: '盒子' }
          ]
        }
      ],
      4: [ // 智能穿戴
        {
          id: 41,
          name: '智能手表',
          children: [
            { id: 411, name: 'Apple Watch' },
            { id: 412, name: '安卓手表' },
            { id: 413, name: '儿童手表' }
          ]
        },
        {
          id: 42,
          name: '智能手环',
          children: [
            { id: 421, name: '运动手环' },
            { id: 422, name: '健康监测' }
          ]
        },
        {
          id: 43,
          name: 'VR/AR',
          children: [
            { id: 431, name: 'VR头盔' },
            { id: 432, name: 'AR眼镜' }
          ]
        }
      ],
      5: [ // 摄影摄像
        {
          id: 51,
          name: '数码相机',
          children: [
            { id: 511, name: '单反相机' },
            { id: 512, name: '微单相机' },
            { id: 513, name: '卡片相机' }
          ]
        },
        {
          id: 52,
          name: '摄像设备',
          children: [
            { id: 521, name: '运动相机' },
            { id: 522, name: '无人机' },
            { id: 523, name: '云台' }
          ]
        }
      ],
      6: [ // 外设配件
        {
          id: 61,
          name: '键鼠套装',
          children: [
            { id: 611, name: '机械键盘' },
            { id: 612, name: '游戏鼠标' },
            { id: 613, name: '无线套装' }
          ]
        },
        {
          id: 62,
          name: '存储设备',
          children: [
            { id: 621, name: 'U盘' },
            { id: 622, name: '移动硬盘' },
            { id: 623, name: '固态硬盘' }
          ]
        }
      ]
    },
    
    // 当前二级分类列表
    currentSecondLevel: [],
    
    // 选中的二级分类
    currentSecondId: null,
    
    // 选中的三级分类（用于高亮）
    currentThirdId: null
  },

  onLoad() {
    // 初始化加载第一个一级分类的二级分类
    this.loadSecondLevel(this.data.currentFirstId);
  },

  // 切换一级分类
  onFirstLevelTap(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.currentFirstId) return;
    
    this.setData({
      currentFirstId: id,
      currentSecondId: null,
      currentThirdId: null
    });
    
    this.loadSecondLevel(id);
  },

  // 加载二级分类
  loadSecondLevel(firstId) {
    const secondLevel = this.data.categoryTree[firstId] || [];
    this.setData({
      currentSecondLevel: secondLevel,
      currentSecondId: secondLevel.length > 0 ? secondLevel[0].id : null
    });
  },

  // 切换二级分类
  onSecondLevelTap(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      currentSecondId: id,
      currentThirdId: null
    });
  },

  // 点击三级分类
  onThirdLevelTap(e) {
    const { secondId, thirdId, name } = e.currentTarget.dataset;
    
    this.setData({
      currentSecondId: secondId,
      currentThirdId: thirdId
    });
    
    // 跳转到首页并筛选该分类
    wx.switchTab({
      url: '/pages/index/index',
      success: () => {
        // 可以通过全局事件或storage传递筛选条件
        wx.setStorageSync('filterCategory', {
          firstId: this.data.currentFirstId,
          secondId: secondId,
          thirdId: thirdId,
          name: name
        });
      }
    });
  }
});
