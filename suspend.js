const { remote } = require('electron')
if (remote) {
    let win = remote.getCurrentWindow();
    window.resize = (x, y) => {
        win.setSize(x, y);
    }
    window.mv = (x, y, width, height) => {
        let bound = win.getBounds();
        let newBounds = {
            x: parseInt(bound.x + x),
            y: parseInt(bound.y + y),
            width: parseInt(width || bound.width),
            height: parseInt(height || bound.height)
        }
        win.setBounds(newBounds);
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