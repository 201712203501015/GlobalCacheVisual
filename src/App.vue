<template>
  <div class="com-layout">
    <HomeView></HomeView>
    <!-- 显示路由 -->
    <router-view/>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue"
export default {
  components: {
    HomeView: defineAsyncComponent(() => import("@/components/HomeView/HomeView.vue"))
  }
}
</script>


<style lang="less">
/* 全屏，高度100% */
.com-layout {
  height: 100vh;
}
</style>
