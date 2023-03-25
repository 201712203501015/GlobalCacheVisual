<template>
  <div class="com-addNode">
    <!-- 提示 -->
    <el-row class="addNode-top">
      <span style="background-color: #ead086; border-radius: 4px;"><el-icon><Bell /></el-icon> 请确保至少新增4个IP节点！！！</span>
    </el-row>
    <el-row style="width: 100%;">
      <el-col :span="24">
        <!-- 密码输入 -->
        <table>
          <tr>
            <td>
              请输入root密码：
            </td>
            <td>
              <el-input v-model="password" type="password" style="width:300px;"></el-input>
            </td>
            <td>
              &nbsp;
            </td>
            <td>
              <el-button v-loading="loading" type="primary" @click="onSubmit">Submit</el-button>
            </td>
          </tr>
        </table>
        <!-- IP输入 -->
        <table>
          <tr>
            <td> 节点IP： </td>
            <td>
              <el-input :disabled="isReady" v-model="ipNum1" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" />
            </td>
            <td> . </td>
            <td>
              <el-input :disabled="isReady" v-model="ipNum2" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" /> 
            </td>
            <td> . </td>
            <td>
              <el-input :disabled="isReady" v-model="ipNum3" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" />
            </td>
            <td> . </td>
            <td>
              <el-input :disabled="isReady" v-model="ipNum4" placeholder="0" type="number" style="width: 100px;" oninput ="value=value.replace(/[^\d]/g, '')" />
            </td>
            <td>
              <el-button :disabled="isReady" v-loading="loading" @click="addIP" type="primary">添加节点IP</el-button>
            </td>
          </tr>
        </table>
      </el-col>
    </el-row>
    <!-- 节点列表 -->
    <el-row style="width: 100%;">
      <el-col :span="24">
        <table style="width: 100%;">
          <!-- 合法节点数量 -->
          <tr>
            <td>
              <span>
                已添加的节点：
              </span>
              <span>
                ( 合法IP节点数量是：<el-tag>{{ this.validIP }}</el-tag> )
              </span>
            </td>
          </tr>
          <!-- 表格 -->
          <tr>
            <td style="height: 500px;">
              <!-- 节点列表 -->
              <el-table
                :header-cell-style="{height: '50px', color: 'black'}" 
                v-loading="loading" v-if="ipList.length > 0" :data="ipList" height="500px"
              >
                
                <!-- 名称列 -->
                <el-table-column label="名称">
                  <template #default="scope">
                    <el-tag>{{ scope.row.name }}</el-tag>
                  </template>
                </el-table-column>
                <!-- 能否连接 -->
                <el-table-column label="能否连接">
                  <template #default="scope">
                    <el-tag>{{ scope.row.isConnected === true ? "是":"否" }}</el-tag>
                  </template>
                </el-table-column>
                <!-- CPU是否满足要求 -->
                <el-table-column label="CPU是否满足要求">
                  <template #default="scope">
                    <el-tag>{{ scope.row.isCpu === true ? "是":"否" }}</el-tag>
                  </template>
                </el-table-column>
                <!-- 内存是否满足要求 -->
                <el-table-column label="内存是否满足要求">
                  <template #default="scope">
                    <el-tag>{{ scope.row.isMemory === true ? "是":"否" }}</el-tag>
                  </template>
                </el-table-column>
                <!-- 操作列 -->
                <el-table-column label="操作">
                  <template #default="scope">
                    <!-- 删除按钮 -->
                    <el-button
                      size="small"
                      type="danger"
                      v-loading="loading"
                      @click="handleDelete(scope.$index)"
                      >删除节点</el-button
                    >
                    <!-- &nbsp; -->
                    <!-- 删除按钮 -->
                    <el-button
                      v-loading="loading"
                      size="small"
                      @click="handleUpdate(scope.$index)"
                      >更新节点</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </td>
          </tr>
        </table>
        <!-- 下一步按钮 -->
        <div style="align-items: center;justify-content: center;display: flex;">
          <el-button type="primary" @click="beforeNextStep(1)">下一步</el-button>
        </div>
      </el-col>
    </el-row>
  </div>
  
</template>

<script>
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import API from '@/api/ajax.js'; // 引入API
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
      // 是否可以输入
      isReady: true,
      // password
      password: null,
      // 输入的ip
      ipNum1:0,
      ipNum2:0,
      ipNum3:0,
      ipNum4:0,
      // ip列表
      ipList: [],
      loading: false,
    }
  },
  // created() {
  //   if(this.store.state.ipList.length > 0) {
  //     // 更新
  //     this.ipList = JSON.parse(JSON.stringify(this.store.state.ipList)) 
  //   }
  // },
  mounted() {
    // 如果已经输入root密码
    if(this.isReady === false) {
      // 3 向后台请求ip列表
      this.getIPList()
    }
  },
  methods: {
    // 增加IP节点
    addIP(){
      let ff = false
      if(this.ipNum1 >= 0 && this.ipNum1 <= 255 &&
        this.ipNum2 >= 0 && this.ipNum2 <= 255 &&
        this.ipNum3 >= 0 && this.ipNum3 <= 255 &&
        this.ipNum4 >= 0 && this.ipNum4 <= 255){
        ff = true
      }

      if(ff === false) {
        // alert('输入不合法，请重新输入')
        ElMessage.error('输入不合法，请重新输入')
        return ;
      }
      let ss = Number(this.ipNum1).toString() + "." 
      + Number(this.ipNum2).toString() + "."
      + Number(this.ipNum3).toString() + "."
      + Number(this.ipNum4).toString()
      let fg = true
      for(let i=0;i<this.ipList.length;i++) {
        if(ss === this.ipList[i].name){
          fg = false
          break
        }
      }
      if(fg === false) {
        // alert('请不要插入同一个IP节点')
        ElMessage.error('请不要插入同一个IP节点')
        return;
      }
      // 请求，新增节点
      // this.loading = true
      API({
        url: '/getAddIP',
        method: 'post',
        data: {
          ipAddress: ss,
          token: this.store.state.userToken
        }
      }).then((res) => {
        // this.loading = false
        let recvdata = res.data.data
        if(recvdata.isValid === true) {
          // 新增IPnode
          this.ipList.push({
            // time: nowTime.toGMTString(),
            name: ss,
            isConnected: recvdata.isConnected,
            isCpu: recvdata.isCpu,
            isMemory: recvdata.isMemory,
          })
        }else{
          // alert('新增失败，'+recvdata.reason)
          ElMessage.error(ss + '新增失败，请检查root密码或者节点ip是否合法')
        }
      }).catch(err => {
        // 输出错误信息
        console.log(err.message)
      })
      
    },
    // 删除IP节点
    handleDelete(index) {
      // console.log('index = ',index, 'ret = ',ret)
      if(this.ipList.length > 0 && index < this.ipList.length) {
        this.loading = true
        API({
          url: '/getDeleteIP',
          method: 'post',
          data: {
            ipAddress: this.ipList[index].name,
            token: this.store.state.userToken
          }
        }).then((res) => {
          this.loading = false
          let recvdata = res.data.data
          if(recvdata.isValid === true) {
            // 在列表中删除ip节点
            this.ipList.splice(index,1)
          }else{
            // alert('IP: ' + this.ipList[index].name + '无法被删除')
            ElMessage.error('IP: ' + this.ipList[index].name + '无法被删除')
          }
        }).catch(err => {
          // 输出错误信息
          console.log(err.message)
        })
        // 结束变为false
        this.loading = false
      }
    },
    // 请求IP列表
    getIPList (){
      API({
        url: '/getIpList',
        method: 'post',
        data: {
          token: this.store.state.userToken
        }
      }).then((res) => {
        let recvdata = res.data.data
        this.ipList = recvdata.ipList // 更新ipList数组
      }).catch(err => {
        // 输出错误信息
        console.log(err.message)
      })
    },
    // 像后端传递root密码
    onSubmit() {
      // 向后台请求，判断root密码是否正确，如果正确，放行；否则，重新输入；
      this.loading = true
      API({
        url:'/getCheckRootPassword',
        method: 'post',
        data:{
          password: this.password,
          token: this.store.state.userToken
        }
      }).then((res) => { // 请求成功后的操作，可以跳转
        // console.log('请求成功,res = ',res)
        this.loading = false
        let recvdata = res.data.data
        if(recvdata.isRight === true) {
          // 1 弹窗
          ElMessage({
            type: 'success',
            message: 'root密码输入正确',
          })
          // 2 切换状态
          this.isReady = false
          // 3 向后台请求ip列表
          this.getIPList()
        }else{
          ElMessage({
            type: 'error',
            message: 'root密码输入错误，请重新输入',
          })
        }
      }).catch(err => {
        // 输出错误信息
        console.log(err.message)
      })
      // 结束变为false
      this.loading = false
    },
    beforeNextStep (ret) {
      // 1 判断是否有4个IP
      if(this.validIP < 4) {
        // alert('IP节点数量不足4个，请保证至少有4个IP节点')
        ElMessage({
          message: '合法IP节点数量不足4个，请保证至少有4个合法的IP节点',
          type: 'warning',
        })
        return
      }
      // 2 下一步
      this.nextStep(ret)
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
        ElMessage({
          message: '到头了，不要点了',
          type: 'warning',
        })
      }
    },
    // 检测更新IP节点
    handleUpdate(index) {
      // console.log('index = ',index, 'ret = ',ret)
      if(this.ipList.length > 0 && index < this.ipList.length) {
        this.loading = true
        API({
          url: '/getHardwareDetect',
          method: 'post',
          data: {
            ipAddress: this.ipList[index].name,
            token: this.store.state.userToken
          }
        }).then((res) => {
          this.loading = false
          let recvdata = res.data.data
          // 更新这个节点的信息
          this.ipList[index].isConnected = recvdata.isConnected
          this.ipList[index].isCpu = recvdata.isCpu
          this.ipList[index].isMemory = recvdata.isMemory
        }).catch(err => {
          // 输出错误信息
          console.log(err.message)
        })
        // 结束变为false
        this.loading = false
      }
    },
  },
  computed: {
    validIP() {
      let ans = 0;
      for(let i=0;i<this.ipList.length;i++) {
        if(this.ipList[i].isConnected === true && this.ipList[i].isCpu === true && this.ipList[i].isMemory === true) {
          ans += 1;
        }
      }
      return ans;
    }
  }
}
</script>

<style>
.com-addNode {
  width: 100%;
  /* align-items: center;
  justify-content: center;  */
}
.addNode-top {
  width: 100%;
  align-items: center;
  justify-content: center;
}
</style>