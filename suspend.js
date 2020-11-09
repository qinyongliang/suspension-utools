const { remote } = require('electron')
if (remote) {
    window.isMac = utools.isMacOs();
    let win = remote.getCurrentWindow();
    let img = window.document.querySelector("img");

    window.moveBounds = (x, y, width) => {
        let bound = win.getBounds();
        let R;
        let height;
        if (width) {
            img = window.document.querySelector("img");
            //重新计算动画所需要的最小矩形
            let scale = img.width / (img.height * 1.0)
            height = width / scale;
            R = parseInt(Math.sqrt(width * width + height * height));
            //计算与现在位置的差
            let sub = (bound.width - R) / 2;
            x += sub;
            y += sub;
        }

        let newBounds = {
            x: parseInt(bound.x + x),
            y: parseInt(bound.y + y),
            width: parseInt(R || bound.width),
            height: parseInt(R || bound.height)
        }
        window.onRender(width, height);
        win.setBounds(newBounds);
    }

    img.addEventListener('mouseenter', () => {
        win.setIgnoreMouseEvents(true, { forward: true })
    });
    img.addEventListener('mouseleave', () => {
        win.setIgnoreMouseEvents(false)
    });

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