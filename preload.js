const electron = require('electron')

function show(size, payload) {
    utools.createBrowserWindow('suspend.html?a=1#' + payload, {
        title: 'img',
        width: size.width / (utools.isMacOs() ? 2 : 1),
        height: size.height / (utools.isMacOs() ? 2 : 1),
        useContentSize: true,
        //不能最大最小化
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        //背景透明，防止放大缩小时出现白框
        transparent: true,
        backgroundColor: '#00000000',
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            preload: 'suspend.js'
        }
    })
    window.utools.outPlugin()
}

window.exports = {
    "suspend": {
        mode: "none",
        args: {
            enter: (action) => {
                window.utools.hideMainWindow();
                let payload, size;
                if (action.type === 'files') {
                    let img = electron.nativeImage.createFromPath(action.payload[0].path);
                    size = img.getSize();
                    payload = img.toDataURL();
                    show(size, payload);
                } else if (action.type === 'img') {
                    size = electron.nativeImage.createFromDataURL(action.payload).getSize();
                    payload = action.payload;
                    show(size, payload)
                } else if (action.type === 'text') {
                    utools.screenCapture(base64Str => {
                        size = electron.nativeImage.createFromDataURL(base64Str).getSize();
                        show(size, base64Str);
                    })
                }
            }
        }
    }
}