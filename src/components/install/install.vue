<template>
  <!-- 开始安装 -->
  <div class="install-com">
    <div class="install-top">
      <h3>安装日志信息</h3>
    </div>
    <!-- 当前安装完的步骤 -->
    <div class="install-title">
      <div id="sroll1" class="infinite-list1" style="overflow: auto;">
        <p class="text-wrapper" v-for="(item,index) in logInfoList" :key="index" style="height: 20px;">{{ (index+1).toString() + ". " + item }}</p>
      </div>
    </div>
    <!-- 安装细节 -->
    <div class="install-box">
      <!-- <div id="sroll" class="infinite-list" style="overflow: auto;flex-grow:2;overflow-y:auto;overflow-x:hidden;">
        <p class="text-wrapper" v-for="(item,index) in logInfoList" :key="index" style="height: 20px;">{{ item }}</p>
      </div> -->
      <div id="sroll" class="infinite-list" style="overflow-y:auto;overflow-x:none;white-space: pre;">
        {{ strcontent }}
      </div>
      <!-- <span v-else class="ck" @click="changeFinish">
        <b>恭喜你安装成功</b>
      </span> -->
    </div>
    <div style="margin-top: 10px; align-items: center;justify-content: center;display: flex;">
      <!-- 开始按钮，点击这个按钮再开始安装 -->
      <el-button v-if="installProcess===0" type="primary" @click="Begin(false,1)">开始安装</el-button>
      <!-- 安装中 -->
      <el-button v-if="installProcess===1" type="primary" disabled>安装中</el-button>

      <!-- 下一步按钮 -->
      <el-button v-if="nowSuccess===1" type="primary" @click="Begin(true,0)">下一步</el-button>
      <!-- 重新安装 -->
      <el-button v-if="nowSuccess===2" type="primary" @click="Begin(false,0)">重新安装</el-button>
      
      <!-- 完成按钮 -->
      <el-button v-if="isEnd===1" type="primary" @click="goto('userView')">完成</el-button>
    </div>
  </div>
</template>

<script>
import { nextTick } from 'vue'
import { useStore } from 'vuex'
import API from '@/api/ajax.js'; // 引入API
import { ElMessageBox } from 'element-plus'
export default {
  setup(){
    // 创建store对象
    const store = useStore()
    // 创建步骤集合
    const stepSet = new Set();
    return {
      store,stepSet
    }
  },
  data() {
    return {
      // 时间戳
      timeId: null,
      // 记录安装步骤---名称
      logInfoList: [],
      // sroll
      sroll: null,
      // 字符串信息
      strcontent: "",
      // 第几步
      nowStep: 1,
      nowName: null,
      // 第几步是否安装完毕,true状态下是禁用 下一步 按钮
      nowEnd: false,
      // 安装进程，0-安装未开始，1-安装中
      installProcess: 0,
      // 下一步 标志 0-不显示，1-下一步，2-重新安装
      nowSuccess: 0,
      // 安装完毕 标志，0-未完成，1-安装完毕
      isEnd: 0,
      // 鼠标只点一次
      onceClick: 0,
    }
  },
  mounted() {
    // console.log("111,",document.getElementById('sroll').clientHeight)
    // this.sendInstall()
  },
  unmounted() {
    if(this.timeId != null) {
      clearInterval(this.timeId)
    }
  },
  methods: {
    changeFinish() {
      // 1 更改isFinished = true
      this.store.commit('changeIsFinished',true)
      // 2 将activeStep = 0,isReady = false，同时跳转到一开始
      this.store.commit('changeActiveStep',0)
      this.store.commit('changeIsReady',false)
    },
    PushInfo(ret){
      if(ret != null && ret != null && typeof(ret) === 'string') {
        let nret = ret.trim(); // 去除字符串两端的空格
        let arr = nret.split('|');
        for(let i=0;i<arr.length;i++){
          if(arr[i] != null && arr[i] != undefined) { // 必须存在
            let ss = arr[i].trim()
            if(ss.length > 0) { // 不能全部都是空格
              // this.splitss(ss,160); // 存放数组，超过160就换行
              this.logInfoList.push(ss);
              if(this.logInfoList.length > 500)
              {
                this.logInfoList.shift(); // 删除第一项
              }
            }
          }
        }
      }
    },
    // 更新数据
    splitss(ss,val)
    {
      let arr = [];
      for(let l=0;l<ss.length;l += val)
      {
        let r = Math.min(l+val,ss.length); // 右边界
        arr.push(ss.substring(l,r));
      }
      for(let i=0;i<arr.length;i++)
      {
        this.logInfoList.push(arr[i]);
        if(this.logInfoList.length>500) // 长度不能大于500
        {
          this.logInfoList.shift(); // 删除第一项
        }
      }
    },
    sleep1(ms, callback) {
      setTimeout(callback, ms)
    },
    // 跳转
    async goto(path) {
      if(this.isEnd === 1) {
        await this.store.dispatch('getInfo').then(() => {
          // 回退到一开始
          this.store.commit('changeActiveStep',0)
          // 成功后再跳转
          this.$router.replace({name:path}).catch(err=>err);
        })
      }
    },
    Start() {
      let hu = false
      // 每隔3s向后端请求一次
      this.timeId = setInterval(() => {
        API({
          url: '/getLog',
          method: 'post',
          data: {
           token: this.store.state.userToken, 
           // nowStep: this.nowStep, // 当前是第几步
           // nowName: this.nowName
          }
        }).then((res) => {
          let recvdata = res.data.data
          if(hu === false) {
            this.strcontent += recvdata.installLogInfo // 更新字符串
            // 字符串长度小于100000，防止渲染不了
            if(this.strcontent.length > 100000)
            {
              this.strcontent = this.strcontent.substring(-100000);
            }
            // 重定位
            nextTick(() => {
              let sroll = document.getElementById('sroll');
              sroll.scrollTop = sroll.scrollHeight
              let sroll1 = document.getElementById('sroll1');
              sroll1.scrollTop = sroll1.scrollHeight
            })
            // (1) 整体安装是否完毕?
            if(recvdata.isEnd === true) {
              hu = true // 忽略后面内容
              // 等5s后再跳转,显示 安装完毕
              this.sleep1(5000,()=>{
                this.isEnd = 1 // 安装完毕
                // 取消其他按钮
                this.installProcess = 2
                this.nowSuccess = 0
                this.onceClick = 0; // 鼠标可以再次点击
                clearInterval(this.timeId); // 销毁定时器
              })
            }
            else {
              // (2) 第step步是否安装完毕,显示安装下一步
              if(recvdata.nowEnd === true) {
                hu = true // 忽略后面内容
                if(recvdata.nowSuccess === false) { // 重新安装当前这步
                  this.nowSuccess = 2
                  // 取消其他按钮
                  this.installProcess = 2
                  this.isEnd = 0
                }
                else {
                  this.nowSuccess = 1 // 开启 下一步 按钮
                  // 取消其他按钮
                  this.installProcess = 2
                  this.isEnd = 0
                }
                this.onceClick = 0; // 鼠标可以再次点击
                clearInterval(this.timeId); // 销毁定时器
              }
            }
          }
        })
      },1000)
    },
    // 用户点击调用
    Begin(cl,bj) {
      if(this.onceClick===1) return ;
      this.onceClick = 1;// 无法立即重复点击
      // 切换到等待中的按钮
      this.installProcess = 1
      this.nowSuccess = 0
      this.isEnd = 0
      if(cl === true) { // 下一步前要清屏
        this.strcontent = ""
      }
      if(bj === 1) { // 一开始安装时，显示这条命令
        this.logInfoList.push('生成集群部署配置文件')
      }
      // 调用Start()
      this.Start()
      API({
        url: '/getInstall',
        method: 'post',
        data: {
          token: this.store.state.userToken,
          nowStep: this.nowStep, // 当前步骤
          // nowName: this.nowName
        }
      }).then((res) => {
        let recvdata = res.data.data
        // 1 切换按钮
        this.installProcess = 1
        // 取消其他按钮
        this.nowSuccess = 0
        this.isEnd = 0
        // 2 更新步骤
        let fg = false
        for(let i=0;i<this.logInfoList.length;i++) {
          if(this.logInfoList[i] === recvdata.nowName) {
            fg = true
            break
          }
        }
        if(fg === false) { // 只有当不用重新安装才能添加步骤
          this.nowStep += 1;
          this.logInfoList.push(recvdata.nowName);
        }
      })
    }
  },
}
</script>

<style>
.install-com {
  height: 80%;
  margin: 10px;
}

.infinite-list1 {
  height: 140px;
  width: 90%;
  word-break: break-all;
  word-wrap: break-word;
}

.infinite-list {
  height: calc(100% - 20px);;
  width: 90%;
  word-break: break-all;
  word-wrap: break-word;
  /* padding: 0;
  margin: 0; 
  list-style: none;*/
}

.install-title {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  height: 160px;
  width: calc(100% - 40px);
  border: 2px solid black;
  border-radius: 4px;
  margin-bottom: 10px;
}

.install-box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  height: calc(100% - 20px);
  max-height: 600px;
  width: calc(100% - 40px);
  border: 2px solid black;
  border-radius: 4px;
}
.install-top {
  width: 100%;
  align-items: center;
  justify-content: center;
}
.ck {
  cursor: pointer;
}
.text-wrapper {
  /* list-style: none; */
  /* display:inline-block; */
  /* float:left; */
  /* overflow:visible; */
  height: 100%;
  min-height:10px; 
  max-height:300px;
  word-break: break-all;
  word-wrap: break-word;
}
</style>