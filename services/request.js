
const app = getApp()

const request = (url, obj = {}) => {
    if (!obj.data) {
      obj.data = {}
    }
    let page = this; // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.serverUrl + url,
        header: obj.header || {
          'content-type': 'application/x-www-form-urlencoded', // 不加这行代码的话 POST 请求报错
          'tctoken': wx.getStorageSync('tctoken') // 只有请求头部带上这个信息的，我才认为是合法的请求，才把数据返回出去
        }, 
        data: obj.data || {}, //发送给后台的数据
        method: obj.method || "GET",
        dataType: obj.dataType || "json",

        success: function (res) {
          resolve(res.data) // res.data相当于ajax里面的data,为后台返回的数据
        },

        fail: function (res) {
          reject(res)
        }
      })
    })
  }

  const getCredentials = (url, obj = {}) => {
    let page = this
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.fileServer + url,
        header: {
          // 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          'Content-Type': 'multipart/form-data'
        }, 
        data: obj || {},
        method: 'POST',

        success: function (res) {
          resolve(res.data)
        },

        fail: function (res) {
          reject(res)
        }
      })
    })
  }

  function json2Form(json) {  
    var str = [];  
    for(let p in json){  
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));  
    }  
    return str.join("&");  
}
  // decodeURIComponent 编码  encodeURIComponent 解码
  // JSON.parse(decodeURIComponent(JSON.stringify(res.data)))


  module.exports = {
    request,
    getCredentials
  }