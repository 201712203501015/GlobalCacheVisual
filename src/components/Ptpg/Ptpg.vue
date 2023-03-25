<template>

    <el-row style="margin-top: 20px;display: flex; justify-content: center;align-items: center; height: 100%;">
      <el-col :span="12" class="center-flex">
        <el-tooltip effect="dark" content="转到PT视图" placement="top">
          <el-button class="button-size" @click="goto(0)"
            >Node{{ this.store.state.nowNodeId }}的PT</el-button
          >
        </el-tooltip>
      </el-col>
      <el-col :span="12" class="center-flex">
        <el-tooltip effect="dark" content="转到PG视图" placement="top">
          <el-button class="button-size" @click="goto(1)"
            >Node{{ this.store.state.nowNodeId }}的PG</el-button
          >
        </el-tooltip>
      </el-col>
    </el-row>

  
</template>

<script>
import { useStore } from "vuex";
export default {
  setup() {
    // 创建store对象
    const store = useStore();
    return {
      store,
    };
  },
  methods: {
    goto(ret) {
      if (ret === 0) {
        // PT
        this.$router.push({
          name: "ptRightSide",
          query: {
            nodeId: this.store.state.nowNodeId,
          },
        });
      } else if (ret === 1) {
        // PG
        this.$router.push({
          name: "pgRightSide",
          query: {
            nodeId: this.store.state.nowNodeId,
          },
        });
      }
    },
  },
};
</script>

<style>
.text-style {
  /* 字体居中 */
  display: flex;
  justify-content: center;
  align-items: center;
  font: 25px arial, sans-serif;
  width: 95%;
  height: 100%;
  border: 2px solid;
}
.button-size {
  height: 100%;
  width: 95%;
  font:25px arial,sans-serif;
  font-weight: bold;
  color:   black;
  background:  #a0cfff;
}
/* 居中样式 */
.center-flex {
  margin: auto;
  display: flex; 
  justify-content: center;
  align-items: center;
  height: 90%;
}
</style>