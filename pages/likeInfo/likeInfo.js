Page({
  data:{},

  toHomePage: function(){
    wx.switchTab({
      url: '/pages/lookResume/lookResume',
    })
  },

  toLikePhoto: function () {
    wx.navigateTo({
      url: '/pages/LikePhoto',
    })
  },

  toLikeMusic: function () {
    wx.navigateTo({
      url: '/pages/LikeMusic/LikeMusic',
    })
  },

  toLikeVideo: function () {
    wx.navigateTo({
      url: '/pages/LikeVideo/LikeVideo',
    })
  }
})