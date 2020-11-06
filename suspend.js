const { remote } = require('electron')
if (remote) {
    window.isMac = utools.isMacOs();
    let win = remote.getCurrentWindow();
    window.resize = (x, y) => {
        win.setSize(x, y);
    }
    win.on('will-resize', (event, newBounds) => {
        event.preventDefault();
        //只能按比例缩放图片
        let img = window.document.querySelector("img");
        img.style.width = '100%';
        let scale = img.width / (img.height * 1.0)
        let height = newBounds.width / scale;
        win.setSize(newBounds.width, Math.min(newBounds.height, height));
    })
}