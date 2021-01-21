const { remote } = require('electron');
const fs = require('fs');

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

if (remote) {
    window.isMac = utools.isMacOs();
    let win = remote.getCurrentWindow();
    window.resize = (width, height) => {
        win.setSize(width, height);
    }
    window.moveBounds = (x, y, width, height) => {
        let bound = win.getBounds();
        let newBounds = {
            x: parseInt(bound.x + x),
            y: parseInt(bound.y + y),
            width: parseInt(width || bound.width),
            height: parseInt(height || bound.height)
        }
        win.setBounds(newBounds);
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

    win.on('will-resize', (event, newBounds) => {
        event.preventDefault();
        //只能按比例缩放图片
        let img = window.document.querySelector("img");
        img.style.width = '100%';
        img.style.height = '100%';
        let scale = img.width / (img.height * 1.0)
        let height = newBounds.width / scale;
        win.setSize(newBounds.width, Math.min(newBounds.height, height));
    })
}