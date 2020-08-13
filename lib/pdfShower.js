const pdfjsLib = window['pdfjs-dist/build/pdf']
// The workerSrc property shall be specified.
// pdfjsLib.GlobalWorkerOptions.workerSrc = './static/pdf/pdf.worker.js';

/**
 * 根据传入字符串生成node节点
 * @param {} text 
 */
function createEl(text) {
    const el = document.createElement('div');
    el.innerHTML = text;
    return el.childNodes[0];
}

export default class PdfSealer {

    constructor() {
    }

    init({
        pdfjsOpt,
        el,
        renderBefore,
        workerSrc,
        scale
    }) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc || '';
        const loadingTask = pdfjsLib.getDocument(pdfjsOpt) // 创建加载文件对象
        
        return loadingTask.promise.then((pdf) => {
            const pageNum = pdf.numPages;

            let promiseList = [];
            for (let i = 1; i <= pageNum; i ++) {
                promiseList.push(this.renderByPage({
                    num:i,
                    pdf,
                    heightOffset: 0,
                    scale
                }));
            }
            return Promise.all(promiseList).then(res => {
                if (this.el) {
                    res.forEach((canvas, index) => {
                        const $canvasBox = createEl(`<div style="overflow: hidden;"></div>`);
    
                        renderBefore($canvasBox, canvas, pageNum, index + 1)
                        $canvasBox.append(canvas);
                        el.append($canvasBox);
                    });
                } else {
                    return res;
                }
                
            });
            
        }).catch(function (reason) {
            console.error('Error: ' + reason)
        });
    }

    renderByPage({num, pdf, heightOffset, scale = 1.5}) {
        // pdf 对象是文件加载完成后转换得来的，保存了文件内容以及相关的信息，如 pdf.numPages 能获取到 pdf 的页数
        // const num = 1  // 渲染第一页
        const that = this;
        return pdf.getPage(num).then(function(page) {
            // console.log(`Page ${num} loaded`);
            let viewport = page.getViewport(scale);
            // const canvas = document.getElementById('the-canvas')
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')
            // Prepare canvas using PDF page dimensions
            canvas.height = viewport.height + heightOffset;
            canvas.width = viewport.width;
            // console.log('viewport:', viewport, page);

            // Render PDF page into canvas context
            let renderContext = {
                canvasContext: ctx,
                viewport: viewport,
            }
            let renderTask = page.render(renderContext);  // 生成 canvas 渲染任务
            return renderTask.then(function () {
                // console.log('Page rendered')  // 渲染完毕
                return canvas
            });
        });
    }
}