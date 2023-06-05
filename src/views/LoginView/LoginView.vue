<template>
  <div class="content-subject">
    <div class="container">
      <div class="login-form">
        <!-- 标题 -->
        <div class="content-title">
          <p class="loginTitleP margin24">用户登录</p> 
        </div>
        <!-- 帐号密码输入 -->
        <el-form id="loginForm">
          <!-- 账号类型 -->
          <!-- <el-form-item style="margin-bottom: 24px !important;" label="账号类型">
            <el-select v-model="userAccountType" @change="changeUserAccountType">
              <el-option
                v-for="(item,index) in userAccountTypeList"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              ></el-option>
            </el-select>
          </el-form-item> -->
          <!-- 帐号输入 -->
          <el-form-item style="margin-bottom: 24px !important;">
            <el-input placeholder="用户名" style="height: 48px;" v-model="userName"/>
          </el-form-item>
          <!-- 密码输入 -->
          <div style="width: 100%; margin-bottom: 24px !important;">
            <div class="input-password">
              <!-- 输入框 -->
              <el-input :type="type" placeholder="密码" style="height: 48px;" v-model="userPassword"></el-input>
              <!-- 显示密码图标 -->
              <div class="input-suffix" @click="showPwd">
                <img class="icon_on" src="./img/on.png" v-show="showPassword == true" />
                <img class="icon_off" src="./img/on.png" v-show="showPassword == false" />
              </div>
            </div>
          </div>
          <!-- 登录按钮 -->
          <div style="width: 100%; margin-bottom: 24px !important;">
            <el-form-item>
              <el-button style="background-color:#C7000B" class="submit-button" @click="submitForm">登录</el-button>
            </el-form-item>
          </div>
        </el-form>
        <!-- 立即注册 -->
        <div style="text-align: center;">
          <div style="display: flex; justify-content: center;">
            <div style="color: #007dff;font-size: 12px;cursor:pointer;" @click="goto('registerView')">立即注册</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { ref } from 'vue-demi';
import { ElMessage,ElMessageBox } from 'element-plus'
export default {
  setup () {
    // 创建store对象
    const store = useStore();
    // false时，显示小眼睛
    let showPassword = ref(false);
    // 
    let type = ref('password');
    return {
      store,
      showPassword,
      type
    }
  },
  data () {
    return {
      // 用户登录种类
      userName: null,  // 用户帐号
      userPassword: null // 用户密码
    }
  },
  mounted () {
  },
  methods: {
    // 显示密码
    showPwd() {
      this.showPassword = !this.showPassword
      if(this.showPassword == false) {
        this.type = 'password'
      } else {
        this.type = 'text'
      }
    },
    // 界面跳转
    goto(path) {
      this.$router.replace({name:path}).catch(err=>err)
    },
    // 判断字符串输入是否为空
    isNull(ss) {
      if(ss === null || ss === undefined) {
        return true
      }
      let s1 = ""
      for(let i=0;i<ss.length;i++) {
        if(ss[i] != '') {
          s1 += ss[i]
        }
      }
      if(s1.length === 0) return true
      return false
    },
    // 提交数据
    submitForm() {
      // 是否为空
      if(this.isNull(this.userPassword) === true || this.isNull(this.userName) === true) {
        // alert('输入不能为空，请正确填写信息')
        ElMessage({
          message: '输入不能为空，请正确填写信息',
          type: 'warning',
        })
        return 
      }
      // 
      this.$store.dispatch('login',{
        userName: this.userName,
        password: this.userPassword
      }).then(() => {
        this.$router.push({name: 'userView'}).catch(err=>err) // 跳转到用户信息界面
      })
      // catch 再store/index.js中处理
    }
  }
}
</script>

<style>
.content-subject {
  margin-top: 40px;
  border-radius: 5px;
  width: 526px;
  height: calc(100% - 100px);
  position: relative;
  left: 50%;
  margin-left: -280px;
  margin-top: 62px;
  background: #fff;
}

.container {
  padding: 0 36px;
  margin-bottom: 100px;
  width: auto;
  height: 100%;
}

.login-form {
  width: 100%;
  padding-top: 60px;
  padding-bottom: 44px;
}

.content-title {
  display: block; 
  height: auto;
}

.loginTitleP {
  height: auto;
  line-height: 44px;
  margin-bottom: 35px;
  font-family: PingFangSC-Semibold;
  font-size: 29px;
  font-weight: 400;
  color: #333333;
  letter-spacing: 0;
  word-wrap: break-word;
  word-break: break-all;
  text-align: center;
}
/* 密码样式 */
.input-password {
  margin-bottom: 24px !important;
  position: relative;
}
/* 密码明文样式 */
.input-suffix {
  right: 5px;
  top: 0;
  transition: all .3s;
  position: absolute;
}

.icon_on {
  margin-bottom: -3px;
  margin-right: 8px;
  margin-top: 18px;
  width: 16px;
}

.icon_off {
  margin-bottom: -3px;
  margin-right: 8px;
  margin-top: 18px;
  width: 16px;
}

/* 提交按钮 */
.submit-button {
  border-radius: 2px;
  font-size: 16px;
  color: #fff;
  width: 100%;
  height: 100%;
}

/* 分割线 */
.splitLine {
  padding:12px 6px 0px 6px;
  margin-left: 6px;
  border-left: 1px solid #000;
  font-size: 0;
}
</style>