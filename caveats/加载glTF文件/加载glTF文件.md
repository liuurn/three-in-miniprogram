# 加载 glTF/glb 文件

## 不能加载包含 Texture 的文件

小程序官方 demo 提供了 gltf-loader.js，但在加载 glTF 格式文件的时候，若模型含有 Texture，则会报错。纠其原因，是因为其官方 demo 中的 loader 代码中使用了 URL/Blob 对象。而小程序中是不能访问这两个 API 的。

```javascript
if (source.bufferView !== undefined) {
  sourceURI = parser
    .getDependency("bufferView", source.bufferView)
    .then(function (bufferView) {
      isObjectURL = true;
      var blob = new global.Blob([bufferView], {
        type: source.mimeType,
      });
      sourceURI = URL.createObjectURL(blob);
      return sourceURI;
    });
}
```

以上，代码片段来自于[gltf-loader.js](https://github.com/wechat-miniprogram/miniprogram-demo/blob/master/miniprogram/packageAPI/pages/ar/loaders/gltf-loader.js)

错误可能是 `Cannot read property 'URL' of undefined` 或者 `Blob is not defined`

## 解决方式

开源社区不难找到`Blob`的替代包，但`createObjectURL`这个 API 是没有对应 polyfill 的。

其实此处之所以使用`Blob`以及`createObjectURL`是为了将 Texture 的`bufferView`转换为可引用的内存地址。实际上，对于一段字节数据，我们还可以使用`base64`表示。所以不妨将代码做如下调整：

```javascript
if (source.bufferView !== undefined) {
  sourceURI = parser
    .getDependency("bufferView", source.bufferView)
    .then(function (bufferView) {
      return `data:${source.mimeType};base64,${base64ArrayBuffer(bufferView)}`;
    });
}
```

其中，`base64ArrayBuffer`需要自行实现，微信自带了[arrayBufferToBase64](https://developers.weixin.qq.com/miniprogram/dev/api/base/wx.arrayBufferToBase64.html)，但截止目前，已经停止维护了。Web API `btoa`也可以实现，但小程序中并不支持。所以可以使用第三方库，或者参考这个[gist](https://gist.github.com/jonleighton/958841)

**最终调整好的`gltf-loader.js`在[这里](https://github.com/liuurn/three-in-miniprogram/blob/main/caveats/%E5%8A%A0%E8%BD%BDglTF%E6%96%87%E4%BB%B6/gltf-loader.js)**。注意，文件中引用了`arrayBufferToBase64`但没有实现，请参考上文。
