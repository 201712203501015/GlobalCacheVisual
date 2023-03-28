<template>
  <!-- 确认界面 -->
  <div class="affirmSet-com">
    <el-row class="affirmSet-top">
      <span style="background-color: #ead086; border-radius: 4px;"><el-icon><Bell /></el-icon> 请核对并确认配置信息！！！</span>
    </el-row>
    <el-row>
      <el-col :span="24">
        <table>
          <!-- clusterSet -->
          <tr>
            <td>
              <b>网络信息：</b>
            </td>
          </tr>
          <tr>
            <td>Public network: </td>
            <td>{{ this.pnet }}</td>
          </tr>
          <tr>
            <td>Cluster network: </td>
            <td>{{ this.cnet }}</td>
          </tr>
          <tr>
            <td>Network mask: </td>
            <td>{{ this.netMask }}</td>
          </tr>
          <tr>
            <td>
              <b>PT与PG信息：</b>
            </td>
          </tr>
          <tr>
            <td>PT数量： </td>
            <td>{{ this.ptNum }}</td>
          </tr>
          <tr>
            <td>PG数量： </td>
            <td>{{ this.pgNum }}</td>
          </tr>
          <!-- ceph1信息 -->
          <tr>
            <td>
              <b>Ceph1节点信息： </b>
            </td>
          </tr>
          <tr>
            <td>节点ip： </td>
            <td>{{ this.ceph1.name }}</td>
          </tr>
          <tr>
            <td>Data盘： </td>
            <td>{{ this.getNameToString(this.ceph1.dataList) }}</td>
          </tr>
          <tr>
            <td>Cache盘： </td>
            <td>{{ this.getNameToString(this.ceph1.cacheList) }}</td>
          </tr>
          <!-- client信息 -->
          <tr>
            <td>
              <b>client节点:</b>
            </td>
            <td>{{ this.getNameToString(this.client) }}</td>
          </tr>
        </table>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <table style="width: 100%;">
          <!-- 其他ceph信息 -->
          <tr>
            <td>
              <b>其他ceph信息：</b>
            </td>
          </tr>
          <tr>
            <td>
              <el-table 
                :header-cell-style="{height: '50px', color: 'black'}"
                style="height: 300px;" v-if="this.ceph.length > 0" :data="this.ceph">
                <!-- 节点名称 -->
                <el-table-column>
                  <template #header>
                      <span>节点名称</span>
                  </template>
                  <template #default="scope">
                    <el-tag>{{ scope.row.roleName }}</el-tag>
                  </template>
                </el-table-column>
                <!-- 节点IP -->
                <el-table-column>
                  <template #header>
                      <span>节点IP</span>
                  </template>
                  <template #default="scope">
                    <el-tag>{{ scope.row.name }}</el-tag>
                  </template>
                </el-table-column>
                <!-- Local IP -->
                <el-table-column>
                  <template #header>
                      <span>Local IP</span>
                  </template>
                  <template #default="scope">
                    <el-tag>{{ scope.row.localIPv4 }}</el-tag>
                  </template>
                </el-table-column>
                <!-- Cluster IP -->
                <el-table-column>
                  <template #header>
                      <span>Cluster IP</span>
                  </template>
                  <template #default="scope">
                    <el-tag>{{ scope.row.clusterIPv4 }}</el-tag>
                  </template>
                </el-table-column>
                <!-- Data盘 -->
                <el-table-column>
                  <template #header>
                      <span>Data盘</span>
                  </template>
                  <template #default="scope">
                    <el-tag>{{ this.getNameToString(scope.row.dataList) }}</el-tag>
                  </template>
                </el-table-column>
                <!-- Cache盘 -->
                <el-table-column>
                  <template #header>
                      <span>Cache盘</span>
                  </template>
                  <template #default="scope">
                    <el-tag>{{ this.getNameToString(scope.row.cacheList) }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </td>
          </tr>
        </table>
      </el-col>
    </el-row>
    <!-- 下一步按钮 -->
    <el-row>
      <el-col :span="12">
        <el-button @click="nextStep(-1)" type="primary">上一步</el-button>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="nextStep(1)">开始安装</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import API from '@/api/ajax.js'; // 引入API
import { ElMessageBox,ElMessage } from 'element-plus'
export default {
  setup(){
    // 创建store对象
    const store = useStore()
    return {
      store
    }
  },
  data() {
    return {
      // 1 clusterSet
      pnet: null,
      cnet: null,
      netMask: null,
      ptNum: 0,
      pgNum: 0,
      // 2 ceph1信息
      ceph1:{
        name: null,
        dataList: [],
        cacheList: []
      },
      // 3 其他ceph信息
      ceph: [],
      // 4 client信息
      client: [],
    }
  },
  mounted() {
    // 获取IP列表
    API({
      url: '/getAffirmSet',
      method: 'post',
      data: {
        token: this.store.state.userToken,
      }
    }).then((res) => {
      let recvdata = res.data.data
      // console.log('aa',recvdata)
      // 1 更新clusterSet
      this.pnet = recvdata.pnet
      this.cnet = recvdata.cnet
      this.netMask = recvdata.netMask
      this.ptNum = recvdata.ptNum
      this.pgNum = recvdata.pgNum
      // 2 更新ceph1信息
      this.ceph1.name = recvdata.ceph1[0].name,
      this.ceph1.dataList = recvdata.ceph1[0].dataList
      this.ceph1.cacheList = recvdata.ceph1[0].cacheList
      // 3 更新其他ceph信息
      this.ceph = recvdata.ceph
      // 4 更新client信息
      this.client = recvdata.client
    }).catch(err => {
      // 输出错误信息
      // console.log(err.message)
      ElMessageBox.alert('请求失败', '警告', {
        confirmButtonText: 'OK'
      })
    })
  },
  methods:{
    // 下一步
    nextStep(ret) {
      // ret = 1 前进；ret = -1 后退；，要存为vuex，防止回撤
      let newVal = this.store.state.activeStep + ret
      // console.log('newVal = ',newVal)
      if(newVal >= 0 && newVal <= 7) {
        // 更新数据
        this.store.commit('changeActiveStep', newVal)
      }else{
        // alert('到头了，不要点了')
        ElMessage({
          message: '到头了，不要点了',
          type: 'warning',
        })
      }
    },
    // 提取出name属性,并转化为string类型
    getNameToString(arr) {
      let ans = ""
      for(let i=0;i<arr.length;i++) {
        if(i > 0) ans += ","
        ans += arr[i].name
      }
      return ans;
    },
  }
}
</script>

<style>
.affirmSet-com {
  margin: 20px;
  width: 100%;
}
.affirmSet-top {
  width: 100%;
  align-items: center;
  justify-content: center;
}
.affirmSet-border {
  box-shadow: 0 4px 2px -2px rgb(223, 225, 230);
}
</style>