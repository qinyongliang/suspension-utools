const {
    ipcRenderer
} = require('electron')
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

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
 
function show(payload, filePath) {
    let img = new Image();
    img.src = payload;
    img.onload = function () {
        let width = img.width / (utools.isMacOs() ? 2 : 1)
        let height = img.height / (utools.isMacOs() ? 2 : 1)
        let scale = width / (height * 1.0)
        //图片大小不能超过当前显示器80%，否则缩放
        let display = utools.getDisplayNearestPoint(utools.getCursorScreenPoint())
        if (display) {
            width = Math.min(width, display.size.width * 0.8);
            height = width / scale;
            height = Math.min(height, display.size.height * 0.8);
            width = height * scale;
        }
        let imgKey = uuidv4();
        //通过localStorage传参,解决url传参的大小限制问题
        localStorage.setItem(imgKey, payload);
        localStorage.setItem(imgKey + "_file", filePath);
        let imgWin = utools.createBrowserWindow('suspend.html?#' + imgKey, {
            title: 'img',
            width: parseInt(width),
            height: parseInt(height),
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
                preload: 'suspend.js',
                // devTools: true
            }
        }, () => {
            // imgWin.webContents.openDevTools();
            ipcRenderer.sendTo(imgWin.webContents.id, 'init');
            for (var i = 1; i <= 5; i++) {
                setTimeout(() => ipcRenderer.sendTo(imgWin.webContents.id, 'init'), i * 200);
            }
            ipcRenderer.on('resize', (event, width, height) => {
                if (event.senderId == imgWin.webContents.id) {
                    console.log('resize', width, height);
                    imgWin.setSize(parseInt(width), parseInt(height));
                }
            });
            ipcRenderer.on('moveBounds', (event, x, y, width, height) => {
                if (event.senderId == imgWin.webContents.id) {
                    let bound = imgWin.getBounds();
                    let newBounds = {
                        x: parseInt(bound.x + x),
                        y: parseInt(bound.y + y),
                        width: parseInt(width || bound.width),
                        height: parseInt(height || bound.height)
                    }
                    imgWin.setBounds(newBounds);
                }
            });
            imgWin.on('will-resize', (event, newBounds) => {
                event.preventDefault();
                ipcRenderer.sendTo(imgWin.webContents.id, 'will-resize', newBounds);
            });

        });
    }
};

function fileUrlData(path) {
    return new Promise((resolve, reject) => {
        let postfix = path.substring(path.lastIndexOf('.') + 1);
        if (mineMap[postfix.toLowerCase()]) {
            fs.readFile(path, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(`data:${mineMap[postfix.toLowerCase()]};base64,${data.toString('base64')}`)
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
                            show(payload, action.payload[i].path);
                        }).catch(err => {
                            utools.showNotification(err);
                        }).finally(() => {
                            window.utools.outPlugin();
                        })
                    }
                } else if (action.type === 'img') {
                    show(action.payload);
                    window.utools.outPlugin();
                }
            }
        }
    },
    "suspend-screenshot": {
        mode: "none",
        args: {
            enter: (action) => {
                //解决用户反馈的截图并识别容易截取到utools黑屏的问题
                utools.hideMainWindow()
                utools.screenCapture(base64Str => {
                    utools.copyImage(base64Str);
                    show(base64Str);
                    utools.outPlugin();
                })
            }
        }
    },
    "suspend-base64": {
        mode: "none",
        args: {
            enter: (action) => {
                show(action.payload);
                window.utools.outPlugin();
            }
        }
    },
    "suspend-svg": {
        mode: "none",
        args: {
            enter: (action) => {
                var base64 = btoa(action.payload);
                show(`data:image/svg+xml;base64,${base64}`);
                window.utools.outPlugin();
            }
        }
    }
}