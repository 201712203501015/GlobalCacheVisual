<template>
  <div class="clusterSet-com">
    <el-row class="clusterSet-top">
      <span style="background-color: #ead086; border-radius: 4px;"><el-icon><Bell /></el-icon> 请设置网络信息、PT和PG信息！！！</span>
    </el-row>
    <el-row style="height: 500px;">
      <el-col :span="24">
        <table>
          <!-- 网络信息： -->
          <tr>
            <td>
              <b>网络信息：</b>
            </td>
          </tr>
          <!-- Public network ： -->
          <tr>
            <td> Public network ： </td>
            <td>
              <el-input v-model="pnet.ipNum1" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" />
            </td>
            <td> . </td>
            <td>
              <el-input v-model="pnet.ipNum2" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" /> 
            </td>
            <td> . </td>
            <td>
              <el-input v-model="pnet.ipNum3" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" />
            </td>
            <td> . </td>
            <td>
              <el-input v-model="pnet.ipNum4" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" />
            </td>
          </tr>
          <!-- Cluster network ： -->
          <tr>
            <td> Cluster network ： </td>
            <td>
              <el-input v-model="cnet.ipNum1" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" />
            </td>
            <td> . </td>
            <td>
              <el-input v-model="cnet.ipNum2" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" /> 
            </td>
            <td> . </td>
            <td>
              <el-input v-model="cnet.ipNum3" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" />
            </td>
            <td> . </td>
            <td>
              <el-input v-model="cnet.ipNum4" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" />
            </td>
          </tr>
          <!-- Network Mask： -->
          <tr>
            <td> Network Mask： </td>
            <td>
              <el-input v-model="netMask.ipNum1" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" />
            </td>
            <td> . </td>
            <td>
              <el-input v-model="netMask.ipNum2" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" /> 
            </td>
            <td> . </td>
            <td>
              <el-input v-model="netMask.ipNum3" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" />
            </td>
            <td> . </td>
            <td>
              <el-input v-model="netMask.ipNum4" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" />
            </td>
          </tr>
          <!-- PT与PG设置：-->
          <tr>
            <td>
              <b>PT与PG设置：</b>
            </td>
          </tr>
          <!-- PT数： -->
          <tr>
            <td>
              PT数：
            </td>
            <td>
              <el-input v-model="ptNum" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" />
            </td>
          </tr>
          <!-- PG数： -->
          <tr>
            <td>
              PG数：
            </td>
            <td>
              <el-input v-model="pgNum" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" />
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
      pnet:{
        ipNum1: 0,
        ipNum2: 0,
        ipNum3: 0,
        ipNum4: 0
      },
      cnet:{
        ipNum1: 0,
        ipNum2: 0,
        ipNum3: 0,
        ipNum4: 0
      },
      netMask:{
        ipNum1: 0,
        ipNum2: 0,
        ipNum3: 0,
        ipNum4: 0
      },
      ptNum: 0,
      pgNum: 0,
      loading: false,
    }
  },
  mounted() {
    // 从后台获取已有信息
    this.SetInfo()
  },
  methods:{
    // 拆分IP地址
    getIP(ret) {
      let arr = ret.split('.');
      return {
        ipNum1: parseInt(arr[0]),
        ipNum2: parseInt(arr[1]),
        ipNum3: parseInt(arr[2]),
        ipNum4: parseInt(arr[3])
      }
    },
    // 获取已有的网络信息
    SetInfo() {
      API({
        url: '/getClusterInfo',
        method: 'post',
        data: {
          token: this.store.state.userToken,
        }
      }).then((res) => {
        let recvdata = res.data.data;
        let pnet = this.getIP(recvdata.pnet)
        let cnet = this.getIP(recvdata.cnet)
        let netMask = this.getIP(recvdata.netMask)
        // pnet
        this.pnet.ipNum1 = pnet.ipNum1
        this.pnet.ipNum2 = pnet.ipNum2
        this.pnet.ipNum3 = pnet.ipNum3
        this.pnet.ipNum4 = pnet.ipNum4
        // cnet
        this.cnet.ipNum1 = cnet.ipNum1
        this.cnet.ipNum2 = cnet.ipNum2
        this.cnet.ipNum3 = cnet.ipNum3
        this.cnet.ipNum4 = cnet.ipNum4
        // netMask
        this.netMask.ipNum1 = netMask.ipNum1
        this.netMask.ipNum2 = netMask.ipNum2
        this.netMask.ipNum3 = netMask.ipNum3
        this.netMask.ipNum4 = netMask.ipNum4
        // pnum
        this.ptNum = recvdata.ptNum
        this.pgNum = recvdata.pgNum
      }).catch(err => {
        // 输出错误信息
        console.log(err.message)
      })
    },
    // 判断IP是否合法
    isValidIP(ret) {
      if(ret.ipNum1 >= 0 && ret.ipNum1 <= 255 &&
        ret.ipNum2 >= 0 && ret.ipNum2 <= 255 &&
        ret.ipNum3 >= 0 && ret.ipNum3 <= 255 &&
        ret.ipNum4 >= 0 && ret.ipNum4 <= 255
      ){
        return true
      }
      return false
    },
    // 拼接为IP字符串
    IPToString(ret) {
      let ss = Number(ret.ipNum1).toString() + "."
      + Number(ret.ipNum2).toString() + "."
      + Number(ret.ipNum3).toString() + "."
      + Number(ret.ipNum4).toString()
      return ss
    },
    // 向后台发送数据
    beforeNextStep(ret) {
      // 1 检查IP是否合法
      let pnet = null
      let cnet = null
      let netMask = null
      if(this.isValidIP(this.pnet) === true &&
        this.isValidIP(this.cnet) === true &&
        this.isValidIP(this.netMask) === true &&
        this.ptNum >= 0 && this.ptNum <= 4096 &&
        this.pgNum >= 0 && this.pgNum <= 4096) {
          pnet = this.IPToString(this.pnet)
          cnet = this.IPToString(this.cnet)
          netMask = this.IPToString(this.netMask)
      }else{
        // alert('IP地址不合法，请输入正确的IP地址')
        ElMessage.error('IP地址或者PT、PG数量不合法，请输入正确的IP地址、PT和PG数量')
        return ;
      }
      // 2 向后台发送数据
      this.loading = true
      API({
        url: '/getClusterSet', // 该写这里了
        method: 'post',
        data:{
          token: this.store.state.userToken,
          pnet: pnet,
          cnet: cnet,
          netMask: netMask,
          ptNum: this.ptNum,
          pgNum: this.pgNum,
        }
      }).then((res) => {
        let recvdata = res.data.data
        this.loading = false
        if(recvdata.isSuccessed === false) {
          // alert('接受失败，请重新请求')
          ElMessage.error('接受失败，请重新请求')
          return ;
        }
        // 3 发送完毕后，跳转到下一步
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
  }
}
</script>

<style>
.clusterSet-com {
  margin: 20px;
}
.clusterSet-top {
  width: 100%;
  align-items: center;
  justify-content: center;
}
</style>