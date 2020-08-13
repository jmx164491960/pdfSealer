export default class Drag {

    constructor(el, background, event) {
        this.limit = {};
        this.el = el;
        this.event = event;
        this.background = background;
        if (!this.background.style.position) {
            this.background.style.position = 'relative';
        }
        this.limit = this.getLimit();
        this.setEvent();
    }
    getLimit() {
        const bcr = this.background.getBoundingClientRect();
        let limit = this.limit;
        limit.minTop = bcr.top;
        limit.minLeft = bcr.left;
        
        limit.maxTop = this.background.clientHeight + bcr.top;
        limit.maxLeft = this.background.clientWidth + bcr.left;
        return limit;
    }

    cloneNode(node) {
        const cloneEl = node.cloneNode();
        cloneEl.innerHTML = node.innerHTML;
        return cloneEl;
    }

    setEvent() {
        // document.addEventListener('mousemove', (e) => {
        //     console.log('mousemove')
        //     this.mousemoveEvent = e;
        //     if (this.isDrag) {
        //         // const offset = this.getOffset();
        //         this.dragEL.style.transform = `translate(${this.mousemoveEvent.clientX}px, ${this.mousemoveEvent.clientY}px)`;
        //     }
        // });

        const that = this;
        this.onmousemove = function(e) {
            // console.log('onmousemove')
            that.mousemoveEvent = e;
            if (that.isDrag) {
                that.dragEL.style.transform = `translate(${that.mousemoveEvent.clientX}px, ${that.mousemoveEvent.clientY}px)`;
                // console.log('that.dragEL.style.transform:', that.dragEL.style.transform);
            }
        }

        this.el.addEventListener('ondragenter', (e) => e.preventDefault());
        this.el.addEventListener('ondragover', (e) => e.preventDefault());

        this.el.addEventListener('mousedown', (e) => {
            console.log('mousedown')
            if (this.event && this.event.mousedown() === false) {
                return;
            }

            this.isDrag = true;
            const dragEL = this.createDragEl(this.el);
            this.dragEL = dragEL;
            document.body.append(dragEL);
            document.addEventListener('mousemove', this.onmousemove);

            dragEL.addEventListener('mouseup', (e) => {
                console.log('mouseup');
                this.onmouseup(e);
                document.removeEventListener('mousemove', this.onmousemove);
            });
        });
    }

    onmousemove(e) {}

    onmouseup(e) {
        if (this.isDrag) {
            const offset = this.getOffset();
            this.dragEL.remove();
            console.log('offset.isInBackground:', offset.isInBackground);
            if (offset.isInBackground) {
                const cloneEl = this.cloneNode(this.el);
                this.background.append(cloneEl);
                cloneEl.style.setProperty('position', 'absolute');

                cloneEl.style.top = `${offset.top}px`;
                cloneEl.style.left = `${offset.left}px`;

                // 执行钩子函数
                if (this.event.mouseup) {
                    this.event.mouseup(cloneEl, offset.top, offset.left);
                }
            }
            
            this.isDrag = false;
        }
    }

    /**
     * 根据传入节点创造一个可拖拽节点
     * @param  el 
     */
    createDragEl(el) {
        const dragEL = this.cloneNode(el);
        const bcr = el.getBoundingClientRect();
        dragEL.style.position = 'absolute';
        dragEL.style.zIndex = '99';
        dragEL.style.top = '0';
        dragEL.style.left = '0';
        dragEL.style.transform = `translate(${bcr.left}px, ${bcr.top}px)`;
        return dragEL;
    }
    getOffset() {
        const bounding = this.background.getBoundingClientRect();
        // 修复偏移后的坐标
        let top = this.mousemoveEvent.clientY - bounding.top;
        const left = this.mousemoveEvent.clientX - bounding.left;
        let isInBackground = this.mousemoveEvent.clientY >= this.limit.minTop
            && this.mousemoveEvent.clientY <= this.limit.maxTop
            && this.mousemoveEvent.clientX >= this.limit.minLeft
            && this.mousemoveEvent.clientX <= this.limit.maxLeft

        const scrollTop = this.background.scrollTop || 0;
        top = top + scrollTop;
        return {
            top,
            left,
            isInBackground
        }
    }
}