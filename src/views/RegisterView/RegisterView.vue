<template>
  <div class="content-subject">
    <div class="container">
      <div class="login-form">
        <!-- 左上角的手机注册，加粗 -->
        <div class="content-header el-row is-justify-space-around el-row--flex">
          <div class="content-header-title el-col el-col-24" style="height: auto;">
            <div class="el-row el-row--flex">
              <div class="el-col el-col-24">
                <div class="phoneloginbox"
                  style="white-space: normal; position: relative; height: auto; text-align: center;">用户注册</div>
              </div>
            </div>
          </div>
        </div>
        <!-- 帐号密码输入 -->
        <el-form id="registerForm" label-width="70px">
          <!-- 邮箱输入 -->
          <!-- <el-form-item style="margin-bottom: 24px !important;" label="邮箱">
            <el-input placeholder="邮箱" style="height: 48px;" v-model="userEmail"/>
          </el-form-item> -->
          <!-- 用户名 -->
          <el-form-item style="margin-bottom: 24px !important;" label="用户名">
            <el-input placeholder="用户名" style="height: 48px;" v-model="userName"/>
          </el-form-item>
          <!-- 手机输入 -->
          <el-form-item style="margin-bottom: 24px !important;" label="手机">
            <el-input placeholder="手机" style="height: 48px;" v-model="userPhone"/>
          </el-form-item>
          <!-- 密码输入 -->
          <el-form-item style="width: 100%; margin-bottom: 24px !important;" label="密码">
            <!-- 输入框 -->
            <el-input :type="type" placeholder="密码" style="height: 48px;" v-model="password"></el-input>
            <!-- 显示密码图标 -->
            <div class="input-suffix" @click="showPwd">
              <img class="icon_on" src="./img/on.png" v-show="showPassword == true" />
              <img class="icon_off" src="./img/on.png" v-show="showPassword == false" />
            </div>
          </el-form-item>
          <!-- 重复密码 -->
          <el-form-item style="width: 100%; margin-bottom: 24px !important;" label="密码">
            <!-- 输入框 -->
            <el-input :type="typeRe" placeholder="重复密码" style="height: 48px;" v-model="repeatPassword"></el-input>
            <!-- 显示密码图标 -->
            <div class="input-suffix" @click="showPwdRe">
              <img class="icon_on" src="./img/on.png" v-show="showPasswordRe == true" />
              <img class="icon_off" src="./img/on.png" v-show="showPasswordRe == false" />
            </div>
          </el-form-item>
          <!-- <el-form-item>
            
            <div class="account-title el-row is-justify-space-around el-row--flex">
              <div class="el-col el-col-24">
                <p class="pd">
                  <span>点击</span>
                  <span @click="goto('/loginView')" style="color: #007dff;font-size: 12px;cursor:pointer;" > 登录</span>
                  <span>
                  </span>
                </p>
              </div>
            </div>
          </el-form-item> -->
          <!-- 提交注册信息 -->
          <el-form-item style="width: 100%; margin-bottom: 24px !important;">
            <el-button color="#C7000B" class="submit-button" @click="submitForm">提交注册信息</el-button>
          </el-form-item>
        </el-form>
        <!-- 立即登录 -->
        <!-- 立即注册 -->
        <div style="text-align: center;">
          <div style="display: flex; justify-content: center;">
            <div style="color: #007dff;font-size: 12px;cursor:pointer;padding-left: 70px;" @click="goto('loginView')">立即登录</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref } from 'vue-demi';
  import API from '@/api/ajax.js'; // 引入API
  import { ElMessage } from 'element-plus'
  export default {
    setup() {
      // false时，显示小眼睛
      let showPassword = ref(false);
      let showPasswordRe = ref(false);
      // 
      let type = ref('password');
      let typeRe = ref('password');
      return {
        showPassword,
        showPasswordRe,
        type,
        typeRe
      }
    },
    data() {
      return {
        userPhone: null, // 手机号
        // userEmail: null, // 邮箱
        userName: null, // 姓名
        password: null, // 密码
        repeatPassword: null, // 重复密码
      }
    },
    mounted() {
    },
    methods: {
      // 显示密码
      showPwd() {
        this.showPassword = !this.showPassword
        if (this.showPassword == false) {
          this.type = 'password'
        } else {
          this.type = 'text'
        }
      },
      // re显示密码
      showPwdRe() {
        this.showPasswordRe = !this.showPasswordRe
        if (this.showPasswordRe == false) {
          this.typeRe = 'password'
        } else {
          this.typeRe = 'text'
        }
      },
      // 界面跳转
      goto(path) {
        this.$router.replace({name:path}).catch(err=>err)
      },
      // 判断手机号是否合法
      isValidPhone(ss) {
        if(ss.length === 11) { // 长度 = 11
          let fg = true
          for(let i=0;i<ss.length;) {
            if('0' <= ss[i] && ss[i] <= '9'){ // 只有0~9的数字
              i++
            }else{
              fg = false
              break
            }
          }
          return fg
        }
        return false
      },
      // 判断邮箱是否合法
      isValidEmail(ss){
        let fg = true
        // 有一个@，有一个.
        let cnt1 = 0,cnt2 = 0
        for(let i=0;i<ss.length;i++) {
          if(ss[i] === '@') cnt1++;
          if(ss[i] === '.') cnt2++;
        }
        if(cnt1 != 1 || cnt2 != 1) {
          fg = false
        }
        // @不在第一位，不在最后一位； . 不在第一位，不在最后一位
        if(ss[0] === '@' || ss[ ss.length - 1 ] === '@' ||
        ss[0] === '.' || ss[ ss.length - 1 ] === '.') {
          fg = false
        }
        // @ 在 . 之前；@ 与 . 不能相邻
        let id1 = 0,id2 = 0
        for(let i=0;i<ss.length;i++) {
          if(ss[i] === '@') {
            id1 = i
          }
          if(ss[i] === '.') {
            id2 = i
          }
        }
        if(id1 > id2 || Math.abs(id1 - id2) === 1) {
          fg = false
        }
        return fg
      },
      // 判断字符串输入是否为空
      isNull(ss) {
        if(ss == null || ss == undefined) {
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
      // 提交表格
      submitForm() {
        // 是否为空
        if(this.isNull(this.userPhone) === true || 
        // this.isNull(this.userEmail) === true || 
        this.isNull(this.userName) === true ||
        this.isNull(this.password) === true) {
          // alert('输入不能为空，请正确填写信息')
          ElMessage.error('输入不能为空，请正确填写信息')
          return ;
        }
        if(this.isValidPhone(this.userPhone) === false) {
          // alert('请输入正确的手机号格式')
          ElMessage.error('请输入正确的手机号格式')
          return ;
        }
        // if(this.isValidEmail(this.userEmail) === false) {
        //   alert('请输入正确的邮箱模式')
        //   return ;
        // }
        if(this.password != this.repeatPassword) {
          // alert('两次输入密码不一致，请重新输入')
          ElMessage.error('两次输入密码不一致，请重新输入')
          return ;
        }
        // 发请求
        API({
          url:'/getRegister',
          method: 'post',
          data:{
            phonenumber: this.userPhone,
            // userEmail: this.userEmail,
            userName: this.userName,
            password: this.password
          }
        }).then((res) => { // 请求成功后的操作，可以跳转
          // console.log('请求成功,res = ',res)
          let recvdata = res.data.data;
          if(recvdata.isSuccessed === true) {
            // alert('用户注册成功')
            ElMessage({
              message: '用户注册成功',
              type: 'success',
            })
            // 跳转到登录页面
            this.$router.push({name:'loginView'}).catch(err=>err)
          }else{
            // alert('用户注册失败，' + recvdata.reason)
            ElMessage.error('用户注册失败，' + recvdata.reason)
          }
        }).catch(err => {
          // 输出错误信息
          console.log(err.message)
        })
      }
    }
  }
</script>

<style>
  .content-subject {
    width: 558px;
    /* height: calc(100% - 700px); */
    position: relative;
    left: 50%;
    margin-left: -280px;
    height: 650px;
    margin-top: 68px;
    background: #ffffff;
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
    padding: 12px 6px 0px 6px;
    margin-left: 6px;
    border-left: 1px solid #000;
    font-size: 0;
  }

  /* 手机注册 */
  .sso-style .content-subject .phoneRegister .content-header {
    padding-top: 12px;
  }

  .phoneloginbox {
    /* cursor: pointer; */
    position: absolute;
    height: 32px;
    letter-spacing: 0;
    font-family: PingFangSC-Semibold;
    font-size: 29px;
    color: #333333;
    letter-spacing: 0;
    text-align: center;
    line-height: 32px;
    white-space: nowrap;
  }

  .content-header {
    padding-top: 50px;
    margin-bottom: 12px;
  }

  .content-header-title {
    height: 24px;
    line-height: 24px;
  }

  .el-row {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .el-col-24 {
    width: 100%;
  }

  .el-row--flex.is-justify-space-around {
    -ms-flex-pack: distribute;
    justify-content: space-around;
  }

  .pd {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #4A4A4A;
    letter-spacing: 0;
    line-height: 14px;
  }

  .pd a {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #007DFF;
    letter-spacing: 0;
    line-height: 14px;
    text-decoration: none;
  }

  /* 邮箱注册 */
  .emailloginbox {
    cursor: pointer;
    height: 29px;
    float: right;
    line-height: 37px;
    margin-left: 8px;
    letter-spacing: 0;
    font-family: PingFangSC-Regular;
    font-size: 18px;
    color: #282828;
    letter-spacing: 0;
  }
</style>