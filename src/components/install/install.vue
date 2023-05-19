<template>
  <!-- 开始安装 -->
  <div class="install-com">
    <div class="install-top">
      <h3>安装日志信息</h3>
    </div>
    <!-- 当前安装完的步骤 -->
    <div class="install-title">
      <div id="sroll1" class="infinite-list1" style="overflow: auto;">
        <p class="text-wrapper" v-for="(item,index) in logInfoList" :key="index" style="height: 20px;">{{ item }}</p>
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
      <!-- 下一步按钮 -->
      <el-button v-if="isSucceed===false && nowEnd===true" type="primary" @click="Start()">下一步</el-button>
      <!-- 完成按钮 -->
      <el-button v-if="isSucceed" type="primary" @click="goto('userView')">完成</el-button>
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
      // 安装成功
      isSucceed: false,
      // sroll
      sroll: null,
      // 字符串信息
      strcontent: "",
      // 第几步
      nowStep: 0,
      // 第几步是否安装完毕,true状态下是禁用 下一步 按钮
      nowEnd: false,
    }
  },
  mounted() {
    // console.log("111,",document.getElementById('sroll').clientHeight)
    this.sendInstall()
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
    // 像后端发送安装请求
    sendInstall() {
      API({
        url: '/getBeginInstall',
        method: 'post',
        data: {
          token: this.store.state.userToken,
        }
      }).then((res) => {
        let recvdata = res.data.data
        // 可以开始了，像后端建立连接
        if(recvdata.isBegin === true) {
          this.Start();
        }
      }).catch(err => {
        // 输出错误信息
        // console.log(err.message)
        ElMessageBox.alert('请求失败', '警告', {
          confirmButtonText: 'OK'
        })
      })
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
      if(this.isSucceed === true) {
        await this.store.dispatch('getInfo').then(() => {
          // 回退到一开始
          this.store.commit('changeActiveStep',0)
          // 成功后再跳转
          this.$router.replace({name:path}).catch(err=>err);
        })
      }
    },
    Start() {
      console.log("调用了start")
      // 关闭下一步按钮
      this.nowEnd = false
      // 每隔3s向后端请求一次
      this.timeId = setInterval(() => {
        API({
          url: '/getStartInstall',
          method: 'post',
          data: {
           token: this.store.state.userToken, 
           nowStep: this.nowStep, // 当前是第几步
           nowEnd: this.nowEnd, // 第几步是否结束
          }
        }).then((res) => {
          let recvdata = res.data.data
          if(this.stepSet.has(recvdata.nowStep)===false) { // 新的一步
            this.stepSet.add(recvdata.nowStep);
            this.logInfoList.push(recvdata.nowName);
            this.nowStep = recvdata.nowStep; // 第几步(当前)
            // 更新显示内容
            this.strcontent = "" // 清空数组
            this.strcontent += "正在请求安装......\n"
            this.strcontent += "***** 开始安装 *****\n"
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
                this.isSucceed = true
              })
            }
            // (2) 第step步是否安装完毕,显示安装下一步
            if(recvdata.nowEnd === true) {
              this.nowEnd = true // 开启 下一步 按钮
              console.log("当前nowEnd = ",this.nowEnd);
              clearInterval(this.timeId); // 销毁定时器
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
  margin: 10px;
}

.infinite-list1 {
  height: 140px;
  width: 90%;
  word-break: break-all;
  word-wrap: break-word;
}

.infinite-list {
  height: 280px;
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
  height: 300px;
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