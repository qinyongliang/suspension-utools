const electron = require('electron')
window.exports = {
    "suspend": {
        mode: "none",
        args: {
            enter: (action) => {
                window.utools.hideMainWindow();
                let size = electron.nativeImage.createFromDataURL(action.payload).getSize();
                utools.createBrowserWindow('suspend.html?a=1#' + action.payload, {
                    title: 'img',
                    width: size.width / 2,
                    height: size.height / 2,
                    zoomToPageWidth:true,
                    useContentSize: true,
                    frame: false,
                    alwaysOnTop: true,
                })
                window.utools.outPlugin()
            }
        }
    }
}