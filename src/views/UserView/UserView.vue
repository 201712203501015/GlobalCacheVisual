<template>
  <!-- 我是UserView -->
  <div style="margin-top: 50px;">
    <el-row justify="center">
      <div>
        <h3>用户个人信息</h3>
      </div>
    </el-row>
    <el-row class="userView-com">
      <el-form label-width="200px" label-position="left">
        <!-- <el-form-item>
          <img src="./img/user_logo1.png" alt="huawei logo"/>
        </el-form-item> -->
        <el-form-item label="用户电话" class="form-box">
          {{ userPhone }}
        </el-form-item>
        <el-form-item label="用户名" class="form-box">
          {{ userName }}
        </el-form-item>
        <el-form-item label="是否是超级管理员" class="form-box">
          <span>{{ isSuperUser === true ? "是":"否" }}</span>
          &nbsp;&nbsp;
          <!-- 超级管理员，可以采用自动化部署 -->
          <el-button v-if="isSuperUser === true" type="primary" @click="reAutoDepl('autoDepl')" size="small" round>重新自动化部署</el-button>
        </el-form-item>
        <el-form-item label="是否完成自动化部署" class="form-box">
          <span class="autoDel" :class="{'un-autoDel':this.isFinished === false}">{{ messTip() }}</span>
          &nbsp;&nbsp;
          <!-- 超级管理员，可以采用自动化部署 -->
          <el-button :disabled="this.isFinished" type="primary" v-if="isSuperUser === true" @click="goto('autoDepl')" size="small" round>自动化部署</el-button>
        </el-form-item>
        <el-form-item label="修改密码" class="form-box">
          <div>
            <el-row>
              <el-col :span="6">
                旧密码：
              </el-col>
              <el-col :span="18">
                <el-input v-model="oldPassword" placeholder="请输入旧密码" type="password" />
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="6">
                新密码：
              </el-col>
              <el-col :span="18">
                <el-input v-model="newPassword" placeholder="请输入新密码" type="password" />
              </el-col>
            </el-row>
            <el-row>
              <el-button type="primary" @click="changePassword" size="small" round> Submit </el-button>
            </el-row>
          </div>
        </el-form-item>
        <el-form-item label="用户登出" class="form-box">
          <el-button type="primary" @click="logout">退出帐号</el-button>
        </el-form-item>
      </el-form>
    </el-row>
  </div>
  
</template>

<script>
import { useStore } from "vuex";
import API from '@/api/ajax.js'; // 引入API
import { ElMessage,ElMessageBox } from 'element-plus'
export default {
  setup() {
    // 创建store对象
    const store = useStore();
    return {
      store
    }
  },
  data() {
    return {
      oldPassword:null,
      newPassword:null,
    }
  },
  methods: {
    isValid(ret) {
      if(ret === null || ret === '') {
        return false
      }
      return true
    },
    // 修改密码
    changePassword() {
      // 判断密码不能为空
      if(this.isValid(this.newPassword) === false || this.isValid(this.oldPassword) === false) {
        ElMessage({
          message: '输入不能为空，请正确填写密码',
          type: 'error',
        })
        return 
      }
      API({
        url: '/getUpdatePassword',
        method: 'post',
        data:{
          token: this.store.state.token,
          userName: this.store.state.userName,
          oldPassword: this.oldPassword,
          newPassword: this.newPassword,
        }
      }).then((res) => {
        let recvdata = res.data.data
        if(recvdata.isUpdated === true) {
          ElMessage({
            message: '密码修改成功',
            type: 'success',
          })
        }else{
          ElMessage({
            message: '密码修改失败',
            type: 'error',
          })
        }
        // 清空数组
        this.oldPassword = null
        this.newPassword = null
      }).catch(err => {
        // 输出错误信息
        ElMessage({
          message: '网络连接失败，密码修改失败',
          type: 'warning',
        })
      })
    },
    messTip() {
      // 超级用户
      if(this.isSuperUser === true) {
        if(this.isFinished === true) {
          return "完成自动化部署"
        }else{
          return "未完成自动化部署"
        }
      }
      // 普通用户
      if(this.isFinished === true) {
        return "完成自动化部署"
      }
      return "未完成自动化部署，请联系管理员"
    },
    goto(path) {
      if (path === "mainView") {
        // 清空当前视图
        this.store.commit("changeView", null);
      }
      this.$router.replace({name:path}).catch(err=>err);
    },
    // 重新自动化部署
    reAutoDepl(name) {
      ElMessageBox.confirm(
        '是否要重新自动化部署？',
        '提示',
        {
          distinguishCancelAndClose: true,
          confirmButtonText: '是',
          cancelButtonText: '否',
        }
      )
      .then((res) => {
        // console.log("then = ",res)
        if(res === "confirm")
        {
          // 向后台发送数据
          API({
            url: '/getReset',
            method: 'post',
            data:{
              token: this.store.state.token,
            }
          }).then((res) => {
            let recvdata = res.data.data
            if(recvdata.isSuccessed === true)
            {
              this.goto(name) // 接收成功，重新部署
            }
          }).catch(err => {
            // 接收失败，提示网络连接失败，无法部署
            ElMessage({
              message: '重新部署请求失败',
              type: 'warning',
            })
          })
        }
      })
      .catch((res) => {
        // console.log("catch = ",res) // 取消了，啥也不做
      })
        
    },
    // 登出
    async logout() {
      await this.$store.dispatch('logout').then(() => {
        // this.$router.push({path:'/loginView'})
        this.$router.push(`/loginView?redirect=${this.$route.fullPath}`).catch(err=>err)
      }).catch(err => {
        // 输出错误信息
        // console.log(err.message)
        ElMessageBox.alert('请求失败', '警告', {
          confirmButtonText: 'OK'
        })
      })
    }
  },
  computed: {
    userPhone() {
      if(this.store.state.userPhone === null) {
        return '空'
      }
      return this.store.state.userPhone
    },
    userName() {
      if(this.store.state.userName === null) {
        return '空'
      }
      return this.store.state.userName
    },
    isSuperUser() {
      if(this.store.state.isSuperUser === null) {
        return '空'
      }
      return this.store.state.isSuperUser === 0 ? true : false;
    },
    isFinished() {
      return this.store.state.isFinished
    }
  }
}
</script>

<style>
.userView-com {
  justify-content: center;
  align-items: center;
  display: flex;
}
.form-box {
  color: #1c1f21;
  line-height: 20px;
}
/* 自动化部署 */
.autoDel {
  color: #67C23A;
}
/* 未完成自动化部署 */
.un-autoDel {
  color: #F56C6C;
}
</style>