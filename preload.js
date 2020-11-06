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
    });
};

window.exports = {
    "suspend": {
        mode: "none",
        args: {
            enter: (action) => {
                window.utools.hideMainWindow();
                if (action.type === 'files') {
                    for(i in action.payload){
                        const img = electron.nativeImage.createFromPath(action.payload[i].path);
                        const size = img.getSize();
                        const payload = img.toDataURL();
                        show(size, payload);
                    }
                    window.utools.outPlugin();
                } else if (action.type === 'img') {
                    const size = electron.nativeImage.createFromDataURL(action.payload).getSize();
                    const payload = action.payload;
                    show(size, payload)
                    window.utools.outPlugin();
                } else if (action.type === 'text') {
                    utools.screenCapture(base64Str => {
                        const size = electron.nativeImage.createFromDataURL(base64Str).getSize();
                        show(size, base64Str);
                        window.utools.outPlugin();
                    })
                }
            }
        }
    }
}