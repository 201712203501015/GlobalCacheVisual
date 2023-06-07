<template>

    <!-- 导航栏，高度15% -->
    <div>
      <!-- 黑条 -->
      <el-row :gutter="10" class="hw_black" style="margin-bottom: 0px;"></el-row>
      <!-- 导航内容 -->
      <el-row class="daohang" style="margin-bottom: 0px;">
        <!-- 1 表头LOGO -->
        <el-col :span="4" style="margin: auto">
          <el-affix position="bottom" :offset="20">
            <!-- @click="goto('allView')" -->
            <div style="cursor:pointer;"> 
              <img
                class="hw_logo"
                src="./img/huawei_logo.png"
                alt="huawei logo"
              />
            </div>
          </el-affix>
        </el-col>
        <!-- 2 搜索项 -->
        <el-col :span="6" style="margin: auto;height: 60px;">
          <!-- <div class="search">
            输入文本
            <input type="text" placeholder="Search By Location" />
            提交按钮，搜索功能未完成
            <button type="submit" onclick="searchByLocation()">
              <el-icon><Search /></el-icon>
            </button>
          </div> -->
        </el-col>
        <!-- 3 表头菜单 -->
        <el-col :span="12">
          <el-menu
            v-if="isLogin"
            :default-active="activeId"
            style="border-bottom: none;"
            mode="horizontal"
            text-color="#000"
            active-text-color="#f00"
            @select="changeMenuItem"
          >
            <!-- 菜单项 changeMenuItem -->
            <el-menu-item index="1" @click="changeHealth"
              >
              <span>
                <!-- healthInfoNum 是 0，说明是健康状态 -->
                <span v-if="healthIsRight" class="normal-state">
                  <el-icon><SuccessFilled /></el-icon>
                  健康监控
                </span>
                <span v-else class="abnormal-state">
                  <el-icon><WarningFilled /></el-icon>
                  健康监控  ({{ this.healthInfoNum }})
                </span>
              </span>
            </el-menu-item>
            <!-- 视图 -->
            <el-menu-item index="2" @click="goto('mainView')"
              >视图</el-menu-item
            >
            <!-- 自动化部署 -->
            <el-menu-item v-if="isRoot" index="3" @click="goto('autoDepl')" :disabled="this.store.state.isFinished"
              >自动化部署</el-menu-item
            >
            <!-- <el-menu-item index="3" @click="goto('manageView')"
              >管理</el-menu-item
            > -->
            <!-- <el-menu-item index="4" @click="goto('submitView')"
              >提交</el-menu-item
            > -->
            <!-- <el-menu-item index="5" @click="goto('messageView')"
              >消息</el-menu-item
            > -->
            <!-- <el-menu-item index="6" @click="goto('textView')"
              >文档</el-menu-item
            > -->
          </el-menu>
        </el-col>
        <!-- 4 用户 -->
        <el-col :span="2" style="margin: auto">
          <!-- 点击跳转到登录路由 -->
          <el-dropdown size="large" v-if="isLogin">
            <div class="avatar-wrapper">
              <div>
                <img v-if="isLog" src="./img/user_logo1.png" alt="huawei logo" class="user-avatar"/>
                <img v-else src="./img/未登录.png" alt="huawei logo1" class="user-avatar"/>
                <i class="el-icon-caret-bottom" />
              </div>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <div @click="goto('userView')">
                    UserInfo
                  </div>
                </el-dropdown-item>         
                <!-- <el-dropdown-item>
                  <div @click="goto('allView')">
                    Home
                  </div>
                </el-dropdown-item> -->
                <el-dropdown-item>
                  <!-- 实现退出登录效果 -->
                  <div v-if="isLog" @click.native="logout"> Log Out </div>
                  <div v-else @click="goto('loginView')"> Log In </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-col>
      </el-row>
    </div>

</template>

<script>
import { useStore } from "vuex";
import { ElMessageBox,ElMessage } from 'element-plus'
import API from '@/api/ajax.js'; // 引入API
export default {
  setup() {
    // 创建store对象
    const store = useStore();
    return {
      store,
    };
  },
  data() {
    return {
      // 健康监控异常信息数量
      healthInfoNum: 0,
      // 健康监控状态
      healthIsRight: true,
      // 时间戳
      timId: null,
      // 导航栏显示
      // isLogin: false, // 是否登录
      // isAutoDepl: false, // 是否完成自动化部署
      // isRoot: false, // 是否是root用户
    }
  },
  unmounted () {
    // 自动退出 -- 删除定时器
    if(this.timId) {
      window.clearInterval(this.timId)
      this.timId = null
    }
  },
  methods: {
    goto(path) {
      if (path === "mainView") {
        // 切换到nodeView视图
        this.store.commit("changeView", 'nodeView');
      }
      if(path === 'autoDepl') {
        // 如果要进行自动化部署，先要判断，是否自动化部署完毕，如果部署完毕，不需要再次部署
        if(this.isAutoDepl === true) {
          // 提示
          ElMessage({
            message: '已经完成自动化部署，无需再次部署',
            type: 'warning',
          })
        }
      }
      this.$router.replace({name:path}).catch(err=>err);
    },
    // 跳转到健康监控视图
    changeHealth() {
      // 1 修改选项
      this.store.commit("changeView", "healthView");
      // 2 视图跳转
      this.$router.push({
        name: "healthRightSide",
      }).catch(err=>err);
    },
    // 更改当前方法
    changeMenuItem(index) {
      // 更新菜单当前选项
      this.activeId = index;
      return index;
    },
    getHealthNum() {
      API({
        url: '/getHealthInfoNum',
        method: 'post',
        data: {
          token: this.store.state.userToken,
        }
      }).then((res) => {
        let recvdata = res.data.data
        this.healthInfoNum = recvdata.healthInfoNum
        // 更新状态
        if(this.healthInfoNum === 0){
          this.healthIsRight = true
        }else{
          this.healthIsRight = false
        }
      }).catch(err => {
        // 输出错误信息
        ElMessage({
          message: '网络连接失败，健康信息获取失败',
          type: 'warning',
        })
      })
    },
    // 登出
    async logout() {
      await this.$store.dispatch('logout').then(() => {
        // 用户登出 -- 删除定时器
        if(this.timId) {
          window.clearInterval(this.timId)
          this.timId = null
        }
        // this.$router.push({path:'/loginView'})
        this.$router.push(`/loginView?redirect=${this.$route.fullPath}`).catch(err=>err)
      })
    }
  },
  computed: {
    activeId: {
      get() {
        return this.store.state.nowMenuItem;
      },
      set(newValue) {
        this.store.commit("changeMenuItem", newValue);
      },
    },
    isLog(){
      // console.log('userToken === ',this.store.state.userToken)
      if(this.store.state.userToken != null && this.store.state.userName != null){
        if(this.store.state.isFinished === true) { // 监测到有token了，并且已经完成自动化部署，再建立连接
          this.getHealthNum() // 请求数据
          // 10min向后台请求一次
          this.timId = setInterval(() => {
            this.getHealthNum()
          },600000);
        }
      }else{
        return false
      }
      return true
    },
    // 是否登录
    isLogin() {
      if(this.store.state.userName != null) {
        return true;
      }
      return false;
    },
    // 是否完成自动化部署
    isAutoDepl() {
      if(this.store.state.isFinished === false) {
        return false;
      }
      return true;
    },
    // 是否是超级管理员
    isRoot() {
      if(this.store.state.isSuperUser === 0) { // 1 是普通，0是超管
        return true;
      }
      return false;
    }
  }
};
</script>

<style>
/* 头部阴影底边框 */
.daohang{
  box-shadow: 0 4px 2px -2px rgb(223, 225, 230);
}

.el-row {
  margin-bottom: 20px;
}

.el-col {
  border-radius: 4px;
}
/* 全屏，高度100% */
.com-layout {
  height: 100vh;
}
/* 导航栏 */
.com-header {
  width: 100%;
  height: 15%;
  --el-header-padding: 0 0px;
}
/* 主体 */
.com-container {
  width: 100%;
  height: 85%;
}
/* 华为logo图片 */
.hw_logo {
  height: auto;
  width: 115px;
  margin-top: 5px;
}
/* 华为黑条 */
.hw_black {
  height: 25px;
  position: static;
  text-align: right;
  background-color: #111111;
}
/* 正常状态 */
.normal-state {
  color: blue;
}
/* 异常状态 */
.abnormal-state {
  color: red;
}
.search {
  border-radius: 5px;
}

.avatar-wrapper {
  margin-top: 5px;
  position: relative;
}

.avatar-wrapper .user-avatar {
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.avatar-wrapper .el-icon-caret-bottom {
  cursor: pointer;
  position: absolute;
  right: -20px;
  top: 25px;
  font-size: 12px;
}
</style>