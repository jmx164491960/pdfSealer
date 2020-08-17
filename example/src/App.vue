<template>
  <div id="app">
    <el-button @click="open">打开</el-button>
    <pdfSealer
      :visible.sync="dialog.visible"
      :pdfjsOpt="pdfjsOpt"
      :workSrc="pdfjsWorkSrc"
      @updateSeals="updateHandler"
    >
      <div slot="drag" class="drag-item">传入的签章组件1</div>
      <div slot="drag" class="drag-item">传入的签章组件2</div>
      <div slot="drag" class="drag-item">传入的签章组件3</div>
    </pdfSealer>
  </div>
</template>

<script>
import pdfSealer from 'pdfsealer';
export default {
  name: 'App',
  components: {
    pdfSealer
  },
  data() {
    return {
      pdfjsOpt: {},
      pdfjsWorkSrc: './static/pdfjs/pdf.worker.js',
      dialog: {
        visible: false
      }
    }
  },
  methods: {
    open() {
      this.pdfjsOpt = {
        url: './static/test.pdf',
        withCredentials: true,
        httpHeaders: {
          origin: window.location.origin
        }
      }
      this.dialog.visible = true;
    },
    updateHandler(data) {
      console.log('data:', data);
    }
  }
}
</script>

<style>
@import url('./assets/css/base.css');
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #222;
}
.drag-item {
  cursor: pointer;
  background: #fff;
  padding: 20px;
  border: 1px solid #cdcdcd;
  margin-bottom: 20px;
}

</style>
