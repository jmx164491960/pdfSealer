<template>
  <div class="c-pdf-seal" v-show="visible" v-loading="isLoading">
    <div class="top-btn-group">
      <el-button @click="closeHandler" size="mini">关闭</el-button>
      <el-button @click="okHandler" type="primary" size="mini">确定</el-button>
    </div>
    <div class="content-box">
      <div class="left">
        <div class="item-group" ref="dragGroup">
          <slot name="drag" ref="drag"></slot>
        </div>
      </div>
      <div class="middle">
        <div ref="pdfBox" class="pdf-box"></div>
      </div>
      <div class="right">
        <div class="pages-box">
          <div
            :class="['item', {active: currentCavasIndex === index}]"
            v-for="(item, index) in canvasArr"
            ref="pageItem"
            :key="index"
            @click="pageItemClick(index)">
            <div>页码:{{index + 1}}</div>
            <div class="preview"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PdfSealer from './pdfShower';
import Drag from './drag';


export default {
  props: {
    visible: Boolean,
    pdfjsOpt: Object,
    workerSrc: String,
  },
  data() {
    return {
      isLoading: false,
      canvasArr: [],
      currentCavasIndex: null,
      seals: []
    }
  },
  methods: {
    closeHandler() {
      this.$emit('update:visible', false);
    },

    okHandler() {
      this.$emit('ok');
      this.closeHandler();
    },

    /**
     * 每页点击事件
     */
    pageItemClick(index) {
      this.currentCavasIndex = index;
    },
    /**
     * 拖拽初始化
     * dragItemEL - 拖拽节点
     * pdfBoxEl - 背景板节点
     * index - 索引
     */
    initDrag(dragItemEL, pdfBoxEl, index) {
      setTimeout(() => {
        this.isLoading = false;
      }, 200);
      return new Drag(dragItemEL, pdfBoxEl, {
        mousedown: () => {
          if (this.seals[index]) {
            console.log('只能盖一次章');
            return false;
          }
        },
        /**
         * el: 节点
         * top: y坐标
         * left: x坐标
         */
        mouseup: (el, top, left) => {
          const child = document.createElement('span');
          child.className = 'drag-close-icon';
          child.style.position = 'absolute';
          child.style.width = '5px';
          child.style.height = '5px';
          child.style.top = '-2px';
          child.style.right = '-2px';
          child.innerText = 'x';
          child.addEventListener('click', () => {
            el['remove']();
            this.seals[index] = null;
          });
          el['append'](child);
          this.seals[index] = {
            el,
            top,
            left,
            page: this.currentCavasIndex + 1 // 页码
          };
          this.$emit('updateSeals', this.seals);
        }
      })
    }
  },
  watch: {
    currentCavasIndex(index) {
      this.$refs['pdfBox']['innerHTML'] = '';
      this.$refs['pdfBox']['append'](this.canvasArr[index].canvas);
      this.seals = []; // 重置拖拽元素
    },
    async pdfjsOpt() {
      const dragGroup = this.$refs['dragGroup']; // 拖拽对象群
      const pdfBoxEl = this.$refs['pdfBox'];
      const pdfSealer = new PdfSealer();

      this.isLoading = true;
      const pdfParams = {
        pdfjsOpt: this.pdfjsOpt,
        // el: pdfBoxEl,
        renderBefore: () => {},
        workerSrc: this.workerSrc
      };
      let canvasPreview = await pdfSealer.init(Object.assign({scale: 0.2}, pdfParams));
      let canvasMain = await pdfSealer.init(Object.assign({scale: 1}, pdfParams));

      // 如果不传el。会返回一个canvasArr,里面存放着由每一页渲染出来的canvas
      if (!canvasPreview) {
        return;
      }

      // 设置canvas列表
      this.canvasArr = canvasPreview.map((canvas, index) => {
        const preNode = canvas.cloneNode();
        // preNode.style.width = '100px';
        // preNode.style.height = '200px';
        return {
          preview: canvas,
          canvas: canvasMain[index]
        };
      });
      // 设置默认索引
      this.currentCavasIndex = 0;
      await this.$nextTick();
      this.$refs['pageItem']['forEach']((node, index) => {
        node.querySelector('.preview').append(this.canvasArr[index].preview)
      });

      if (dragGroup.childNodes && dragGroup.childNodes.length && dragGroup.childNodes.length > 0) {
        dragGroup.childNodes.forEach((dragItem, index) => {
          this.initDrag(dragItem, pdfBoxEl, index);
        });
      }

      setTimeout(() => {
        this.isLoading = false;
      }, 200);
    }
  }
}
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box;
}

.c-pdf-seal {
  position: fixed;
  background: #fff;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .top-btn-group {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    height: 60px;
    padding-right: 40px;
  }
  .pdf-box {
    display: inline-block;
    border: 1px solid #cdcdcd;
    text-align: center;
  }
  .content-box {
    display: flex;
    flex: 1;
    height: 100%;
    border: 1px solid #cdcdcd;
    .left {
      width: 200px;
      height: 100%;
      border-right: 1px solid #cdcdcd;
      padding: 20px;
    }
    .middle {
      height: 100%;
      flex: 1;
      overflow: auto;
      text-align: center;
    }
    .right {
      width: 300px;
      height: 100%;
      border-left: 1px solid #cdcdcd;
      overflow-y: auto;
      text-align: center;
      .pages-box {
        .item {
          padding: 40px 0;
          cursor: pointer;
          .preview {
            display: inline-block;
            border: 1px solid #cdcdcd;
          }
          &.active {
            .preview {
              border-color: #ff7500;
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="less">
</style>
