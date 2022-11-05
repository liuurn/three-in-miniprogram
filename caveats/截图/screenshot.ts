import * as THREE from "three";
import flip from "./flip";

declare var wx: any;

// 用于记录屏幕宽高
let frameBuffer = new THREE.Vector2();
// 用于存储截图数据
let pixelData: Uint8Array;
// 这个对promise 的resolve回调函数的引用，用于获取像素数据之后的回调
let screenShotResolve: ((value: unknown) => void) | null = function () {};

// 初始化保存截图容器的大小
export const initBuffer = (renderer: THREE.WebGLRenderer) => {
  // 获取three renderer的宽高
  renderer.getDrawingBufferSize(frameBuffer);
  // 每一像素为rgba数据。故整体大小如下。
  pixelData = new Uint8Array(frameBuffer.x * frameBuffer.y * 4);
};

// 该函数需要在每一帧渲染执行。当触发截屏时读取像素，并通知canvas 2d去下载
export const renderForScreenShot = (gl: WebGL2RenderingContext) => {
  if (!screenShotResolve) return;
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
    gl.readPixels(
      0,
      0,
      frameBuffer.x,
      frameBuffer.y,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixelData
    );
    flip(pixelData, frameBuffer.x, frameBuffer.y, 4);
    screenShotResolve(undefined);
  }
};

// 截屏的入口函数
export const takeScreenShot = (
  canvas2d: HTMLCanvasElement & {
    createImageData: (data: Uint8Array, x: number, y: number) => any;
  }
) => {
  new Promise((r) => (screenShotResolve = r)).then(() => {
    screenShotResolve = null;
    const ctx = canvas2d.getContext("2d");
    if (!ctx) throw new Error("creat context failed");
    // 注意该API是小程序独有的 https://developers.weixin.qq.com/miniprogram/dev/api/canvas/Canvas.createImageData.html
    const img = canvas2d.createImageData(
      pixelData,
      frameBuffer.x,
      frameBuffer.y
    );
    canvas2d.height = img.height;
    canvas2d.width = img.width;
    ctx.putImageData(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, frameBuffer.x, frameBuffer.y);
    screenShotInWX(canvas2d);
  });
};

// 在微信中截屏
const screenShotInWX = (canvas2d: HTMLCanvasElement) => {
  wx.canvasToTempFilePath({
    canvas: canvas2d,
    success(res: any) {
      wx.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: function () {
          wx.showToast({
            title: "保存成功",
            icon: "success",
            duration: 2000,
          });
        },
      });
    },
  });
};
