const electron = require('electron')
const fs = require('fs')

const mineMap = {
    "bmp": "image/bmp",
    "gif": "image/gif",
    "heic": "image/heic",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "jpe": "image/jpeg",
    "png": "image/png",
    "svg": "image/svg+xml",
    "webp": "image/webp",
    "ico": "image/x-icon"
}

function show(payload) {
    let img = new Image();
    img.src = payload;
    img.onload = function () {
        utools.createBrowserWindow('suspend.html?a=1#' + payload, {
            title: 'img',
            width: img.width / (utools.isMacOs() ? 2 : 1),
            height: img.height / (utools.isMacOs() ? 2 : 1),
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
    }
};

function fileUrlData(path) {
    return new Promise((resolve, reject) => {
        let postfix = path.substring(path.lastIndexOf('.') + 1);
        if (mineMap[postfix]) {
            fs.readFile(path, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(`data:${mineMap[postfix]};base64,${data.toString('base64')}`)
                }
            });
        } else {
            reject("不支持的文件格式!");
        }
    })
}

window.exports = {
    "suspend": {
        mode: "none",
        args: {
            enter: (action) => {
                window.utools.hideMainWindow();
                if (action.type === 'files') {
                    for (i in action.payload) {
                        fileUrlData(action.payload[i].path).then(payload => {
                            show(payload);
                        }).catch(err=>{
                            utools.showNotification(err);
                        }).finally(()=>{
                            window.utools.outPlugin();
                        })
                    }
                } else if (action.type === 'img') {
                    show(action.payload);
                    window.utools.outPlugin();
                } else if (action.type === 'text') {
                    utools.screenCapture(base64Str => {
                        show(base64Str);
                        window.utools.outPlugin();
                    })
                }
            }
        }
    }
}