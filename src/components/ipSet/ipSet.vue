<template>
  <div class="ip-set">
    <el-row class="ip-top">
      <span style="background-color: #ead086; border-radius: 4px;">
        <el-icon><Bell /></el-icon> 请确保每个IP都set完毕！！！
      </span>
    </el-row>
    <!-- 表格 -->
    <el-row>
      <el-table 
        :header-cell-style="{height: '50px', color: 'black'}"
        style="height: 500px;" v-if="this.ipList.length > 0" :data="this.ipList"
      >
        <!-- 节点IP -->
        <el-table-column width="150">
          <template #header>
              <span>节点IP</span>
          </template>
          <template #default="scope">
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <!-- 节点名称 -->
        <el-table-column width="150">
          <template #header>
              <span>节点名称</span>
          </template>
          <template #default="scope">
            <el-tag>{{ scope.row.roleName }}</el-tag>
          </template>
        </el-table-column>
        <!-- Local IPv4 -->
        <el-table-column>
          <template #header>
              <span>Local IPv4</span>
          </template>
          <template #default="scope">
            <!-- <el-tag>{{ scope.row.localIPv4 }}</el-tag> -->
            <el-input 
              v-model="this.ipList[ scope.row.id ].localIPv4" 
              :disabled="this.ipList[ scope.row.id ].localIPv4State === 0 ? true: false"
              style="width: 200px;"
              ></el-input>
            &nbsp;
            <el-tag @click="changeState('localIPv4',1,scope.row.id)" :class="{'button-select':this.ipList[ scope.row.id ].localIPv4State === 1}">edit</el-tag>
            &nbsp;
            <el-tag @click="changeState('localIPv4',0,scope.row.id)" :class="{'button-select':this.ipList[ scope.row.id ].localIPv4State === 0}">set</el-tag>
          </template>
        </el-table-column>
        <!-- Cluster IPv4 -->
        <el-table-column>
          <template #header>
              <span>Cluster IPv4</span>
          </template>
          <template #default="scope">
            <!-- <el-tag>{{ scope.row.clusterIPv4 }}</el-tag> -->
            <!-- <el-input v-model="this.ipList[ scope.row.id ].clusterIPv4"></el-input> -->
            <el-input 
              v-model="this.ipList[ scope.row.id ].clusterIPv4" 
              :disabled="this.ipList[ scope.row.id ].clusterIPv4State === 0 ? true: false"
              style="width: 200px;"
            ></el-input>
            &nbsp;
            <el-tag @click="changeState('clusterIPv4',1,scope.row.id)" :class="{'button-select':this.ipList[ scope.row.id ].clusterIPv4State === 1}">edit</el-tag>
            &nbsp;
            <el-tag @click="changeState('clusterIPv4',0,scope.row.id)" :class="{'button-select':this.ipList[ scope.row.id ].clusterIPv4State === 0}">set</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <!-- 下一步按钮 -->
    <el-row>
      <el-col :span="12">
        <el-button @click="beforeNextStep(-1)" type="primary">上一步</el-button>
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
import { ElMessage,ElMessageBox } from 'element-plus'
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
      data: {
        token: this.store.state.userToken
      }
    }).then((res) => {
      let recvdata = res.data.data
      this.ipList = [] // 清空数组
      let tpipList = recvdata.ipList
      let j = 0;
      for(let i=0;i<tpipList.length;i++) {
        if(tpipList[i].ceph === true || tpipList[i].ceph1 === true) { // 筛选ceph节点
          this.ipList.push({
            id: j,
            name: tpipList[i].name,
            roleName: tpipList[i].roleName,
            localIPv4: tpipList[i].localIPv4,
            clusterIPv4: tpipList[i].clusterIPv4,
            localIPv4State: 0, // 0表示不能更改，1表示可以更改
            clusterIPv4State: 0,
          })
          j += 1
        }
      }
      // console.log("====================-----------------------------",this.ipList)
    }).catch(err => {
      // 输出错误信息
      console.log(err.message)
    })
  },
  methods: {
    // 确保每个ip修改完毕
    beforeNextStep(ret) {
      let fg = true
      for(let i=0;i<this.ipList.length;i++) {
        if(this.ipList[i].localIPv4State === 1 || this.ipList[i].clusterIPv4State === 1) {
          fg = false
        }
      }
      if(fg === false){
        // alert('请确保每个ip都set了')
        ElMessage({
          message: '请确保每个ip都set了',
          type: 'warning',
        })
        return ;
      }
      // 发给后台
      let ipList = []
      for(let i=0;i<this.ipList.length;i++) {
        ipList.push({
          name: this.ipList[i].name,
          roleName: this.ipList[i].roleName,
          localIPv4: this.ipList[i].localIPv4,
          clusterIPv4: this.ipList[i].clusterIPv4
        })
      }
      this.loading = true
      API({
        url: '/getIPSet',
        method: 'post',
        data:{
          ipList:ipList,
          token: this.store.state.userToken
        }
      }).then((res) => {
        let recvdata = res.data.data
        this.loading = false
        if(recvdata.isSuccessed === false) {
          // alert('发送失败，请重新发送')
          ElMessage.error('发送失败，请重新发送')
          return ;
        }
        // 跳转到下一步
        this.nextStep(ret)
      }).catch(err => {
        // 输出错误信息
        console.log(err.message)
      })
      // 结束变为false
      this.loading = false
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
    // 检验是否是合格的ip
    isValidIP(ss) {
      let fg = true
      let cntDot = 0
      // 检测有没有异常字符
      for(let i=0;i<ss.length;) {
        if((ss[i] >= '0' && ss[i] <= '9') || ss[i] === '.'){
          i += 1
          if(ss[i] === '.') {
            cntDot += 1
          }
        }else{
          fg = false
          break;
        }
      }
      if(fg === true && cntDot === 3) { // （1）0~9，有3个.
        let arr = ss.split('.')
        if(arr.length === 4) { // （2）3个.分为4个数字
          if(arr[0].length > 0 && arr[1].length > 0 && arr[2].length > 0 && arr[3].length > 0) { // （3）每个数字都存在
            let ffg = true
            for(let i=0;i<4;i++) {
              let p = parseInt(arr[i])
              if(p<0 || p>255){ // （4）每个数字范围0~255
                ffg = false
                break;
              }
            }
            if(ffg === true){ // 满足（1）~（4）是正确的ip
              return true;
            }
          }
        }
      }
      return false;
    },
    // 修改状态
    changeState(name,state,id) {
      if(name === 'localIPv4') {
        // 修改localIPv4
        if(state === 0) {
          // 检验是否合格
          if(this.isValidIP(this.ipList[id].localIPv4) === true) {
            this.ipList[id].localIPv4State = 0
          }else{
            // alert('输入的ip不合法，请重新输入')
            ElMessage.error('输入的ip不合法，请重新输入')
          }
        }else{
          this.ipList[id].localIPv4State = 1
        }
      }else if(name === 'clusterIPv4') {
        // 修改clusterIPv4
        if(state === 0) {
          // 检验是否合格
          if(this.isValidIP(this.ipList[id].clusterIPv4) === true) {
            this.ipList[id].clusterIPv4State = 0
          }else{
            // alert('输入的ip不合法，请重新输入')
            ElMessage.error('输入的ip不合法，请重新输入')
          }
        }else{
          this.ipList[id].clusterIPv4State = 1
        }
      }
    }
  }
}
</script>

<style>
.ip-set {
  margin: 20px;
}
.ip-top {
  width: 100%;
  align-items: center;
  justify-content: center;
}
/* 选中状态 */
.button-select {
  color: white;
  background-color:  #409EFF;
}
</style>