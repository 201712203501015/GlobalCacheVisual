<template>
  <div class="role-set">
    <el-row class="roleSet-top">
      <span style="background-color: #ead086; border-radius: 4px;">
        <el-icon><Bell /></el-icon> 请确保Ceph1只有1个，Ceph至少选择2个，Client至少选择1个！！！
      </span>
    </el-row>
    <!-- 表格 -->
    <el-row>
      <el-table 
        :header-cell-style="{height: '50px', color: 'black'}"
        style="height: 500px;" v-if="this.ipList.length > 0" :data="this.ipList"
      >
        <!-- 节点IP -->
        <el-table-column>
          <template #header>
              <span>节点IP</span>
          </template>
          <template #default="scope">
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <!-- ceph -->
        <el-table-column>
          <template #header>
              <span @click="selectCephAll">ceph</span>
          </template>
          <template #default="scope">
            <el-tag :class="{'button-select':scope.row.ceph === true}" @click="selectCeph(scope.row.id)">ceph</el-tag>
          </template>
        </el-table-column>
        <!-- client -->
        <el-table-column>
          <template #header>
              <span @click="selectClientAll">client</span>
          </template>
          <template #default="scope">
            <el-tag :class="{'button-select':scope.row.client === true}" @click="selectClient(scope.row.id)">client</el-tag>
          </template>
        </el-table-column>
        <!-- ceph1 -->
        <el-table-column>
          <template #header>
              <span>ceph1</span>
          </template>
          <template #default="scope">
            <el-tag :class="{'button-select':scope.row.ceph1 === true}" @click="selectCeph1(scope.row.id)">ceph1</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <!-- 下一步按钮 -->
    <el-row>
      <el-col :span="12">
        <el-button @click="nextStep(-1)" type="primary">上一步</el-button>
      </el-col>
      <el-col :span="12">
        <el-button v-loading="loading" @click="beforeNextStep(1)" type="primary">下一步</el-button>
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
      ipList: [], // IP的列表
      loading: false,
    }
  },
  mounted() {
    // 获取IP列表
    API({
      url: '/getIpList',
      method: 'post',
      token: this.store.state.userToken
    }).then((res) => {
      let recvdata = res.data.data
      this.ipList = [] // 清空数组
      let tpipList = recvdata.ipList
      // 3-10 写到了这里，不清楚tpipList的ceph1结构，问问铮姐再写
      for(let i=0;i<tpipList.length;i++) {
        this.ipList.push({
          id: i,
          name: tpipList[i].name,
          ceph: tpipList[i].ceph,
          client: tpipList[i].client,
          ceph1: tpipList[i].ceph1,
          roleName: null, // 这里始终是null
        })
      }
    }).catch(err => {
      // 输出错误信息
      console.log(err.message)
    })
  },
  methods: {
    // 配置角色前，设置角色，进行判断
    beforeNextStep(ret) {
      if(ret === 1) { // 前进一步，需要设置角色，发给后端
        let fg = true
        let ceph1Num = 0
        let cephNum = 0
        let clientNum = 0
        // 检查是否对所有IP设置角色
        for(let i=0;i<this.ipList.length;i++) {
          if(this.ipList[i].ceph === false && this.ipList[i].client === false && this.ipList[i].ceph1 === false) {
            fg = false
            break
          }
          if(this.ipList[i].ceph1 === true) { // 只有1个ceph1
            ceph1Num += 1
          }
          if(this.ipList[i].ceph === true) { // 至少2个ceph
            cephNum += 1
          }
          if(this.ipList[i].client === true) { // 至少1个client
            clientNum += 1
          }
        }
        if(ceph1Num != 1 || cephNum < 2 || clientNum < 1) {
          fg = false
        }
        if(fg === false) {
          // alert('请给每个IP设置角色，并保证只有1个ceph1，至少2个ceph，至少1个client')
          ElMessage({
            message: '请给每个IP设置角色，并保证只有1个ceph1，至少2个ceph，至少1个client',
            type: 'warning',
          })
          return ;
        }
        // 配置角色
        let ceph = 2
        let client = 1
        let ipList = []
        for(let i=0;i<this.ipList.length;i++) {
          if(this.ipList[i].ceph1 === true) {
            this.ipList[i].roleName = 'ceph1'
          }else if(this.ipList[i].ceph === true) {
            this.ipList[i].roleName = 'ceph' + ceph.toString()
            ceph += 1
          }else if(this.ipList[i].client === true) {
            this.ipList[i].roleName = 'client' + client.toString()
            client += 1
          }
          ipList.push({
            name: this.ipList[i].name,
            roleName: this.ipList[i].roleName,
            ceph: this.ipList[i].ceph,
            client: this.ipList[i].client,
            ceph1: this.ipList[i].ceph1,
          })
        }
        // 向后台发送数据
        this.loading = true
        API({
          url: '/getRoleSet',
          method:'post',
          data: {
            ipList: ipList,
            token: this.store.state.userToken
          }
        }).then((res) => {
          let recvdata = res.data.data
          this.loading = false
          if(recvdata.isSuccessed === false){ // 发送失败
            // alert('发送失败，请重新发送')
            ElMessage.error('发送失败，请重新发送')
            return ;
          }
          this.nextStep(ret);
        })
        // 结束变为false
        this.loading = false
      }else{ // 后退一步
        this.nextStep(ret);
      }
    },
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
    // 选择ceph
    selectCeph(ret) {
      this.ipList[ret].ceph = true
      this.ipList[ret].client = false
      this.ipList[ret].ceph1 = false
    },
    // 选择client
    selectClient(ret) {
      this.ipList[ret].client = true
      this.ipList[ret].ceph = false
      this.ipList[ret].ceph1 = false
    },
    // 选择client1
    selectCeph1(ret) {
      this.ipList[ret].ceph1 = true
      this.ipList[ret].ceph = false
      this.ipList[ret].client = false
    },
    // 选择全部ceph
    selectCephAll() {
      for(let i=0;i<this.ipList.length;i++) {
        this.ipList[i].ceph = true
        this.ipList[i].ceph1 = false
        this.ipList[i].client = false
      }
    },
    // 选择全部client
    selectClientAll() {
      for(let i=0;i<this.ipList.length;i++) {
        this.ipList[i].client = true
        this.ipList[i].ceph = false
        this.ipList[i].ceph1 = false
      }
    }
  }
}
</script>

<style>
.role-set {
  margin: 20px;
}
/* 选中状态 */
.button-select {
  color: white;
  background-color: #409EFF;
}
.roleSet-top {
  width: 100%;
  align-items: center;
  justify-content: center;
}
</style>