export const screenshot = (id, imgType) => {
    const video = document.getElementById(id);
    const width = video.videoWidth;
    const height = video.videoHeight;
    // 创建画布准备截图
    const canvas = document.createElement('canvas');
    // 设置video属性
    video.setAttribute('crossOrigin', 'anonymous')
        // 设置画布的宽高
    canvas.width = width;
    canvas.height = height;
    // 图片绘制
    canvas.getContext('2d').drawImage(video, 0, 0, width, height)

    return new Promise((resolve, reject) => {
        try {
            let dataURL = canvas.toDataURL(imgType)
            resolve(dataURL)
        } catch (error) {
            reject(error)
        }
    })
}

export const base64ToFile = (dataurl, filename = '') => {
    let arr = dataurl.split(',')
    let mime = arr[0].match(/:(.*?);/)[1]
    let suffix = mime.split('/')[1]
    let bstr = atob(arr[1])
    let n = bstr.length
    let u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], `${filename}.${suffix}`, {
        type: mime
    })
}