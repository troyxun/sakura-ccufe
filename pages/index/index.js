Page({
  onShareAppMessage() {
    return {
      title: '长财 2022 樱花透卡',
      path: '/pages/index/index',
      imageUrl: 'https://static.itroy.cc/sakura-ccufe/share.webp'
    }
  },
  onShareTimeline(){

  },

  data: {
    save: false,
    pictureSrc: '',
    cardSrc: 'https://static.itroy.cc/sakura-ccufe/1.webp',
    canvasWidth: '',
    canvasHeight: '',
  },

  /**
   * 透卡切换
   */
  tap(e) {
    const that = this;
    const cardID = e.currentTarget.id;
    const query = wx.createSelectorQuery();
    query.select('#' + cardID + ' .card-image')
    .fields({
      properties: ['src']
    }, function (res) {
      that.setData({
        cardSrc: res.src
      });
    }).exec();

    that.drawCard();
  },

  onLoad: function(option) {
    const that = this;

    const pictureSrc = option.src;
    if (pictureSrc) {
      this.setData({
        pictureSrc: pictureSrc,
        save: true
      });
    };

    const query = wx.createSelectorQuery();
    query.select('#card')
    .boundingClientRect(rect => {
       this.setData({
        canvasWidth: rect.width,
        canvasHeight: rect.width / 2 * 3
      });
      that.drawCard();
    }).exec();

    wx.getSystemInfoAsync({
      success (res) {
        that.setData({
          statusBarHeight: res.statusBarHeight,
          bottom: res.windowHeight - res.safeArea.bottom
        })
      }
    })
  },

  /**
   * 上传图片
   */
  upload() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        const src = res.tempFilePaths[0];
        wx.redirectTo({
          url: `../we-cropper/index?src=${src}`
        })
      }
    })
  },

  /**
   * 绘制透卡
   */
  drawCard() {
    wx.showLoading({
      title: '正在生成...'
    });

    const query = wx.createSelectorQuery();
    query.select('#card')
    .fields({ node: true, size: true })
    .exec(async (res) => {
      const dpr = wx.getSystemInfoSync().pixelRatio;
      const canvas = res[0].node;
      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.scale(dpr, dpr);
     
      // 绘制图片
      const pictureImg = canvas.createImage();
      pictureImg.src = this.data.pictureSrc;
      pictureImg.onload = () => {
        ctx.drawImage(pictureImg, 0, 0, res[0].width, res[0].height);
      }

      // 绘制卡面
      const cardImg = canvas.createImage();
      cardImg.src = this.data.cardSrc;
      cardImg.onload = () => {
        ctx.drawImage(cardImg, 0, 0, res[0].width, res[0].height);
      }

      wx.hideLoading();
    });
  },

  /**
   * 获取用户保存相册权限
   */
  getPhotosAuthorize: function () {
    let self = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              self.saveImg();
            },
            fail() {
              console.log('getPhotoAuthorize Failed.');
            }
          })
        } else {
          self.saveImg();
        }
      }
    })
  },

  /**
   * 保存到相册
   */
  async saveImg() {
    const query = wx.createSelectorQuery();
    const canvasObj = await new Promise((resolve, reject) => {
      query.select('#card')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        resolve(res[0].node);
      })
    });
    wx.canvasToTempFilePath({
      // fileType: 'jpg',
      canvas: canvasObj,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            wx.showToast({
              title: '已保存到相册',
              icon: 'success',
              duration: 1000
            });
          },
          fail: function (err) {
            console.log(err);
            if (err.errMsg === 'saveImageToPhotosAlbum:fail auth deny') {
              console.log('auth deny')
            } else {
              wx.showToast({
                title: '请截屏保存',
                icon: 'error',
                duration: 2000
              });
            }
          },
          complete(res) {
            console.log(res);
          }
        })
      },
      fail(res) {
        console.log(res);
      }
    }, this)
  }
})
