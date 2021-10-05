const fs = require('fs');
const { ipcRenderer } = require('electron')

const mineMap = {
    "image/bmp" : "bmp",
    "image/gif" : "gif",
    "image/heic" : "heic",
    "image/jpeg" : "jpeg",
    "image/jpeg" : "jpg",
    "image/jpeg" : "jpe",
    "image/png" : "png",
    "image/svg+xml" : "svg",
    "image/webp" : "webp",
    "image/x-icon" : "ico"
}

window.isMac = utools.isMacOs();
let winId;
ipcRenderer.on('init', (event) => {
    winId = event.senderId;
});
window.toEdit = () => {
    ipcRenderer.sendTo(winId, 'toEdit');
}
window.resize = (width, height) => {
    ipcRenderer.sendTo(winId, 'resize', width, height);
}
window.moveBounds = (x, y, width, height) => {
    ipcRenderer.sendTo(winId, 'moveBounds', x, y, width, height);
}

window.copyImage = (img, filePath = null) => {
    if (filePath) {
        utools.copyFile(filePath)
    }
    utools.copyImage(img.src)
    window.utools.showNotification('图片已经拷贝至剪切板')
}

window.save = (img) => {
    var [src, type, base64] = img.src.match(/^data:(image\/.+);base64,(.*)/)
    let suffix = mineMap[type]

    let defaultPath = utools.getPath('downloads') + "/suspend_" + new Date().getTime() + "." + suffix
    let savePath = utools.showSaveDialog({
        title: '保存图片',
        defaultPath: defaultPath,
        buttonLabel: '保存'
    })
    if (savePath) {
        var dataBuffer = Buffer.from(base64, 'base64');
        fs.writeFileSync(savePath, dataBuffer);
        utools.showNotification("保存成功")
    }
}

ipcRenderer.on('will-resize', (event, newBounds) => {
    //只能按比例缩放图片
    let img = window.document.querySelector("img");
    img.style.width = '100%';
    img.style.height = '100%';
    let scale = img.width / (img.height * 1.0)
    let height = newBounds.width / scale;
    window.setSize(newBounds.width, Math.min(newBounds.height, height));
})
