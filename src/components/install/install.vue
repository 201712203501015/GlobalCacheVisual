<template>
  <!-- 开始安装 -->
  <div class="install-com">
    <div class="install-top">
      <h3>安装日志信息</h3>
    </div>
    <!-- 当前安装完的步骤 -->
    <div class="install-title">
      <div id="sroll1" class="infinite-list1" style="overflow: auto;">
        <p class="text-wrapper" v-for="(item,index) in logInfoList" :key="index" style="height: 20px;">{{ this.nowStep + ". " + item }}</p>
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
      <el-button v-if="installProcess===0" type="primary" @click="Start(false)">开始安装</el-button>
      <!-- 下一步按钮 -->
      <el-button v-if="installProcess===2" type="primary" @click="Start(true)">下一步</el-button>
      <!-- 重新安装 -->
      <el-button v-if="installProcess===3" type="primary" @click="Start(false)">重新安装</el-button>
      <!-- 安装中 -->
      <el-button v-if="installProcess===1" type="primary" disabled>安装中</el-button>
      <!-- 完成按钮 -->
      <el-button v-if="installProcess===4" type="primary" @click="goto('userView')">完成</el-button>
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
      nowStep: 0,
      // 第几步是否安装完毕,true状态下是禁用 下一步 按钮
      nowEnd: false,
      // 安装进程，0-安装未开始，1-安装中，2-下一步，3-重新安装，4-安装完毕
      installProcess: 0,
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
      if(this.installProcess === 4) {
        await this.store.dispatch('getInfo').then(() => {
          // 回退到一开始
          this.store.commit('changeActiveStep',0)
          // 成功后再跳转
          this.$router.replace({name:path}).catch(err=>err);
        })
      }
    },
    Start(cl) {
      clearInterval(this.timeId);
      this.installProcess = 1; // 改变当前安装状态
      if(cl === true) {
        this.strcontent = "" // 清空数组
      }
      // let nowEnd = false
      // if(this.installProcess === 2 || this.installProcess === 3) {
      //   nowEnd = true
      // }
      // 每隔3s向后端请求一次
      this.timeId = setInterval(() => {
        // console.log('定时器在运行');
        API({
          url: '/getStartInstall',
          method: 'post',
          data: {
           token: this.store.state.userToken, 
           nowStep: this.nowStep, // 当前是第几步
          //  nowEnd: nowEnd, // 第几步是否结束
          }
        }).then((res) => {
          let recvdata = res.data.data
          if(this.stepSet.has(recvdata.nowStep)===false) { // 新的一步
            this.stepSet.add(recvdata.nowStep);
            this.logInfoList.push(recvdata.nowName);
            this.nowStep = recvdata.nowStep; // 第几步(当前)
            // 更新显示内容
            // this.strcontent = "" // 清空数组
            // this.strcontent += "正在请求安装......\n"
            // this.strcontent += "***** 开始安装 *****\n"
            this.installProcess = 1; // 改变当前安装状态
          }

          // 和当前step 一样
          if(this.nowStep === recvdata.nowStep) {
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
              // 等5s后再跳转,显示 安装完毕
              this.sleep1(5000,()=>{
                this.installProcess = 4 // 安装完毕
                clearInterval(this.timeId); // 销毁定时器
                // console.log('-1')
              })
            }
            else {
              // (2) 第step步是否安装完毕,显示安装下一步
              if(recvdata.nowEnd === true) {
                if(recvdata.nowSuccess === false) { // 重新安装当前这步
                  this.installProcess = 3
                }
                else {
                  this.installProcess = 2 // 开启 下一步 按钮
                }
                clearInterval(this.timeId); // 销毁定时器
                // console.log('-1')
              }
            }
          }
          
        })
      },1000)
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