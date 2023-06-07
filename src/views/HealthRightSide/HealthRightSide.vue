<template>
  <!-- 标题 -->
  <h3 style="margin-block-start: 0em;">集群异常状态监控</h3>
  <!-- 状态提示 -->
  <el-row>
    <!-- 正常状态 -->
    <div v-if="clusterState" class="normal-state">
      <el-icon><SuccessFilled /></el-icon>
      cluster 处于正常运行状态
    </div>
    <!-- 异常状态 -->
    <div v-if="!clusterState" class="abnormal-state">
      <el-icon><WarningFilled /></el-icon>
      cluster 处于异常运行状态
    </div>
  </el-row>
  <!-- 列表展示 -->
  <el-row>
    <el-table
      v-loading="loading"
      :data="healthList" 
      border
      style="width: 100%" 
      max-height="600"
      :header-cell-style="{height: '50px', color: 'black'}"
      :row-class-name="changeColor"
    >
      <el-table-column label="异常类型">
        <template #default="props">
          {{ props.row.abnType }}
        </template>
      </el-table-column>
      <el-table-column label="异常等级">
        <template #default="props">
          {{ props.row.abnLevel }}
        </template>
      </el-table-column>
      <el-table-column label="异常详情">
        <template #default="props">
          {{ props.row.abnDetails }}
        </template>
      </el-table-column>
      <el-table-column label="时间">
        <template #default="props">
          {{ props.row.abnTime }}
        </template>
      </el-table-column>
    </el-table>
  </el-row>
</template>

<script>
import { useStore } from 'vuex'
import { ElMessageBox,ElMessage } from 'element-plus'
import API from '@/api/ajax.js'; // 引入API
export default {
  setup () {
    // 创建store对象
    const store = useStore()
    return {
        store
    }
  },
  created () {
    // 显示左侧视图
    this.store.commit('changeView', 'healthView')
    // 发送数据
    this.webAbnInfoSend()
  },
  mounted () {
    // 10min一更新
    this.timId = setInterval(() => {
      this.webAbnInfoSend()
    },600000);
  },
  unmounted () {
    // 销毁时间戳
    if(this.timId) {
      window.clearInterval(this.timId)
      this.timId = null
    }
  },
  data () {
    return {
      // 集群总状态
      clusterState: true,
      // health数据
      healthList: null,
      loading: false,
      // 时间戳
      timId: null,
    }
  },
  methods: {
    // 发送数据
    webAbnInfoSend() {
      this.loading = true
      API({
        url: '/getHealthInfo',
        method: 'post',
        data: {
          token: this.store.state.userToken,
        }
      }).then((res) => {
        let recvdata = res.data.data
        this.healthList = recvdata.healthInfo
        this.clusterState = recvdata.clusterState
        // 不用转圈圈
        this.loading = false
      }).catch(err => {
        // 输出错误信息
        ElMessage({
          message: '网络连接失败，健康列表获取失败',
          type: 'warning',
        })
        // 5 不转圈圈
        this.loading = false
      })
    },
    // 改变颜色
    changeColor({row, rowIndex}) {
      if(row.abnLevel === "ERROR") {
        return 'error-row'
      }else if(row.abnLevel === "WARN") {
        return 'warning-row'
      }
    }
  }
}
</script>

<style>
/* 正常状态 */
.normal-state {
  color: blue;
}
/* 异常状态 */
.abnormal-state {
  color: red;
}
/* 警告状态 */
.el-table .warning-row {
  color: orange;
}
/* 错误状态 */
.el-table .error-row {
  color: red;
}
</style>