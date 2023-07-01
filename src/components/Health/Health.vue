<template>
  <el-row :gutter="10" style="height: 100%; margin: 4px;">
    <div 
      style="border-radius: 10px;"
      :class="{
        'unhealth-text':getHealth === 'running_0',
        'running_1':getHealth === 'running_1',
        }"
    >
      <span style="font-weight: bold;">
        Node{{ this.store.state.nowNodeId }}的状态是：{{ this.showNodeState(this.store.state.nodeIsOnline,this.store.state.nodeIsIn,this.store.state.nodeIsRunning) }}
      </span>
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
      if(ss === 'NODE_STATE_INVALID') {
        return '非法状态'
      }else if( ss === 'NODE_STATE_UP') {
        return '正在启动'
      }else if( ss === 'NODE_STATE_DOWN' ) {
        return '下线状态'
      }else if( ss === 'NODE_STATE_RUNNING') {
        return '正在工作'
      }else if( ss === 'NODE_STATE_IN') {
        return '在集群中'
      }else if( ss === 'NODE_STATE_OUT') {
        return '不在集群中'
      }
      return 'ERROR' // 这就出错了
    },
    showNodeState(isOnline,isIn,isRunning) {
      if(isOnline === false) {
        return '离线状态'
      }
      let ans = this.showHealthInfo(isIn) + "," + this.showHealthInfo(isRunning)
      return ans
    }
  },
  computed: {
    getHealth () {
      if(this.store.state.nodeIsOnline === true &&
      this.store.state.nodeIsIn === 'NODE_STATE_IN' &&
      this.store.state.nodeIsRunning === 'NODE_STATE_RUNNING') {
        return 'running_1';
      } else {
        return 'running_0'
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
.unhealth-text {
  /* 字体居中 */
  display: flex;
  justify-content: center;
  align-items: center;
  font:25px arial,sans-serif;
  width: 100%;
  height: 100%;
  border: 1px solid #e1e3e7;
  background-color: white;
  color: red;
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
</style>