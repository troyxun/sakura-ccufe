import WeCropper from '../../utils/we-cropper/we-cropper.min.js'

const app = getApp()
const config = app.globalData.config

const device = wx.getSystemInfoSync()

Page({
  data: {
    cropperOpt: {
      id: 'cropper',
      pixelRatio: device.pixelRatio,
      width: device.windowWidth,
      height: device.windowWidth / 2 * 3,
      scale: 2.5,
      zoom: 8
    }
  },
  removeImage () {
    this.cropper.removeImage();
  },
  touchStart (e) {
    this.cropper.touchStart(e)
  },
  touchMove (e) {
    this.cropper.touchMove(e)
  },
  touchEnd (e) {
    this.cropper.touchEnd(e)
  },
  getCropperImage () {
    const context = this
    this.cropper.getCropperImage({ componentContext: context }, function (path, err) {
      if (err) {
        wx.showModal({
          title: '错误',
          content: err.message
        });
      } else {
        wx.redirectTo({
          url: `../index/index?src=${ path }`
        })
      }
    })
  },

  uploadTap () {
    const self = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        const src = res.tempFilePaths[0]
        self.cropper.pushOrign(src)
      }
    })
  },
  
  onLoad (option) {
    const { cropperOpt } = this.data;

    this.createSelectorQuery().select(`#${cropperOpt.id}`).fields({ node: true, size: true }).exec((res) => {
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      if (option.src) {
        cropperOpt.src = option.src;
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        cropperOpt.canvas = canvas;
        cropperOpt.ctx = ctx;

        this.cropper = new WeCropper(cropperOpt)
          .on('ready', function (ctx) {
            console.log(`wecropper is ready for work!`)
          })
          .on('beforeImageLoad', (ctx) => {
            wx.showToast({
              title: '上传中',
              icon: 'loading',
              duration: 20000
            })
          })
          .on('imageLoad', (ctx) => {
            console.log(`picture loaded`)
            console.log(`current canvas context:`, ctx)
            wx.hideToast()
          })
      }
    })
  }
})