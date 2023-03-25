<template>
  <div class="com-manage">
    <div class="com-manage-top">
      <el-steps :active="activeStep" finish-status="success">
        <el-step title="添加节点" />
        <!-- <el-step title="硬件监测" /> -->
        <el-step title="角色设置" />
        <el-step title="IP设置" />
        <el-step title="磁盘分类" />
        <el-step title="集群设置" />
        <el-step title="确认配置" />
      </el-steps>
    </div>
    <div class="com-manage-bottom">
      <!-- <el-button @click="nextStep(1)">我是按钮</el-button> -->
      <addNode v-if="this.activeStep === 0" :key="activeStep"></addNode>
      <!-- <hardwareDetect v-if="this.activeStep === 1" :key="activeStep"></hardwareDetect> -->
      <roleSet v-if="this.activeStep === 1" :key="activeStep"></roleSet>
      <ipSet v-if="this.activeStep === 2" :key="activeStep"></ipSet>
      <diskClassification v-if="this.activeStep === 3" :key="activeStep"></diskClassification>
      <clusterSet v-if="this.activeStep === 4" :key="activeStep"></clusterSet>
      <affirmSet v-if="this.activeStep === 5" :key="activeStep"></affirmSet>
      <install v-if="this.activeStep === 6" :key="activeStep"></install>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { defineAsyncComponent } from "vue"
export default {
  setup () {
    // 创建store对象
    const store = useStore()
    return {
        store
    }
  },
  data(){
    return {
      // activeStep: 0, // 当前步骤
    }
  },
  components: {
      addNode: defineAsyncComponent(() => import("@/components/addNode/addNode.vue")),
      // hardwareDetect: defineAsyncComponent(() => import("@/components/hardwareDetect/hardwareDetect.vue")),
      roleSet: defineAsyncComponent(() => import("@/components/roleSet/roleSet.vue")),
      ipSet: defineAsyncComponent(() => import("@/components/ipSet/ipSet.vue")),
      diskClassification: defineAsyncComponent(() => import("@/components/diskClassification/diskClassification.vue")),
      clusterSet: defineAsyncComponent(() => import("@/components/clusterSet/clusterSet.vue")),
      affirmSet: defineAsyncComponent(() => import("@/components/affirmSet/affirmSet.vue")),
      install: defineAsyncComponent(() => import("@/components/install/install.vue")),
    },
  methods:{
    
  },
  computed: {
    activeStep() {
      return this.store.state.activeStep
    }
  }
}
</script>

<style>
.com-manage {
  width: 100%;
  height: 100%;
  display: relative;
}
.com-manage-top {
  margin-top: 35px;
  height: 15%;
}
.com-manage-bottom {
  height: 85%;
}
</style>