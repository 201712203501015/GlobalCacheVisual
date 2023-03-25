<template>
  <el-row :gutter="10" style="height: 100%; margin: 4px;">
    <div 
      style="border-radius: 10px;"
      :class="{
        'unhealth-text':getHealth === 'running_0',
        'running_1':getHealth === 'running_1',
        'running_2':getHealth === 'running_2',
        'running_3':getHealth === 'running_3',
        'running_4':getHealth === 'running_4',
        'running_5':getHealth === 'running_5',
        'running_6':getHealth === 'running_6',
        'running_7':getHealth === 'running_7',
        'running_8':getHealth === 'running_8',
        'running_9':getHealth === 'running_9',
        'running_10':getHealth === 'running_10',
        }"
    >
      <span style="font-weight: bold;"> Node{{ this.store.state.nowNodeId }}的健康状态是：{{ this.showHealthInfo(this.store.state.nowNodeHealth) }}</span>
      <!-- this.store.state.nowHealthState是CPU的值 -->
      <!-- nodeCPU值 {{ this.store.state.nowHealthState }} -->
    </div>
    <!-- <el-col :span="12" style="height: 100%;">Health左侧</el-col>
    <el-col :span="12" style="height: 100%;">Health右侧</el-col> -->
  </el-row>
</template>

<script>
import { useStore } from 'vuex'
export default {
  setup () {
    // 创建store对象
    const store = useStore()
    return {
        store
    }
  },
  methods: {
    // 根据node状态，在页面实现不同的文字
    showHealthInfo(ss) {
      if(ss === 'NODE_STATE_RUNNING') {
        return '节点正常'
      }else if( ss === 'NODE_STATE_DOWN') {
        return '节点DOWN，无法正常工作'
      }else if( ss === 'NODE_STATE_INVALID' ) {
        return '无效节点'
      }
      return 'ERROR' // 这就出错了
    }
  },
  computed: {
    getHealth () {
      if(this.store.state.nowNodeHealth === 'NODE_STATE_DOWN') {
        return 'running_0';
      } else {
        return 'running_1'
        // if(0 <= this.store.state.nowHealthState < 0.25){
        //   return 'running_1'
        // }else if(0.25 <= this.store.state.nowHealthState < 0.5){
        //   return 'running_2'
        // }else if(0.5 <= this.store.state.nowHealthState < 0.75){
        //   return 'running_3'
        // }else if(0.75 <= this.store.state.nowHealthState <= 1.0){
        //   return 'running_4'
        // }
      }
    }
  }
}
</script>

<style>
.health-text {
  /* 字体居中 */
  display: flex;
  justify-content: center;
  align-items: center;
  font:25px arial,sans-serif;
  width: 100%;
  height: 100%;
  border: 1px solid #e1e3e7;
  background-color: white;
  color: black;
}
.unhealth-text {
  /* 字体居中 */
  display: flex;
  justify-content: center;
  align-items: center;
  font:25px arial,sans-serif;
  width: 100%;
  height: 100%;
  border: 1px solid #e1e3e7;
  background-color: red;
  color: black;
}
.running_1{
  display: flex;
  justify-content: center;
  align-items: center;
  font:25px arial,sans-serif;
  width: 100%;
  height: 100%;
  border: 1px solid #e1e3e7;
  background-color: white;
  color: black;
}
.running_2{
  display: flex;
  justify-content: center;
  align-items: center;
  font:25px arial,sans-serif;
  width: 100%;
  height: 100%;
  border: 2px solid;
  background-color: #98BAFE;
  color: black;
}
.running_3{
  display: flex;
  justify-content: center;
  align-items: center;
  font:25px arial,sans-serif;
  width: 100%;
  height: 100%;
  border: 2px solid;
  background-color: #5F94FD;
  color: black;
}
.running_4{
  display: flex;
  justify-content: center;
  align-items: center;
  font:25px arial,sans-serif;
  width: 100%;
  height: 100%;
  border: 2px solid;
  background-color: #023EB6;
  color: black;
}
.running_5{
  display: flex;
  justify-content: center;
  align-items: center;
  font:25px arial,sans-serif;
  width: 100%;
  height: 100%;
  border: 2px solid;
  background-color: #3300FF;
  color: white;
}
.running_6{
  display: flex;
  justify-content: center;
  align-items: center;
  font:25px arial,sans-serif;
  width: 100%;
  height: 100%;
  border: 2px solid;
  background-color: #9933FF;
  color: white;
}
.running_7{
  display: flex;
  justify-content: center;
  align-items: center;
  font:25px arial,sans-serif;
  width: 100%;
  height: 100%;
  border: 2px solid;
  background-color: #FF0099;
  color: white;
}
.running_8{
  display: flex;
  justify-content: center;
  align-items: center;
  font:25px arial,sans-serif;
  width: 100%;
  height: 100%;
  border: 2px solid;
  background-color: #CC0099;
  color: white;
}
.running_9{
  display: flex;
  justify-content: center;
  align-items: center;
  font:25px arial,sans-serif;
  width: 100%;
  height: 100%;
  border: 2px solid;
  background-color: #FF6633;
  color: white;
}
.running_10{
  display: flex;
  justify-content: center;
  align-items: center;
  font:25px arial,sans-serif;
  width: 100%;
  height: 100%;
  border: 2px solid;
  background-color: #CC3300;
  color: white;
}
</style>