<template>
  <!-- 开始安装 -->
  <div class="install-com">
    <div class="install-top">
      <h3>安装日志信息</h3>
    </div>
    <div class="install-title">
      安装步骤
    </div>
    <div class="install-box">
      <!-- <div id="sroll" class="infinite-list" style="overflow: auto;flex-grow:2;overflow-y:auto;overflow-x:hidden;">
        <p class="text-wrapper" v-for="(item,index) in logInfoList" :key="index" style="height: 20px;">{{ item }}</p>
      </div> -->
      <!-- 测试，自动换行 -->
      <div id="sroll" class="infinite-list" style="overflow-y:auto;overflow-x:none;white-space: pre;">
        {{ strcontent }}
      </div>
      <!-- <span v-else class="ck" @click="changeFinish">
        <b>恭喜你安装成功</b>
      </span> -->
    </div>
    <div v-if="isSucceed" style="margin-top: 10px; align-items: center;justify-content: center;display: flex;">
      <el-button type="primary" @click="goto('userView')">完成</el-button>
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
    return {
      store,
    }
  },
  data() {
    return {
      // 时间戳
      timeId: null,
      // 日志信息
      logInfoList: [],
      // 安装成功
      isSucceed: false,
      // sroll
      sroll: null,
      // 字符串信息
      strcontent: "",
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
      this.strcontent += "正在请求安装......\n"
      this.logInfoList.push('正在请求安装......')
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
          this.strcontent += "***** 开始安装 *****\n"
          this.logInfoList.push('***** 开始安装 *****')
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
      // 每隔3s向后端请求一次
      this.timeId = setInterval(() => {
        API({
          url: '/getStartInstall',
          method: 'post',
          data: {
            token: this.store.state.userToken,
          }
        }).then((res) => {
          let recvdata = res.data.data
          // this.logInfoList.push(recvdata.installLogInfo)
          // this.PushInfo(recvdata.installLogInfo) // 5-19 弃用
          this.strcontent += recvdata.installLogInfo // 更新字符串
          // 字符串长度小于100000，防止渲染不了
          if(this.strcontent.length > 100000)
          {
            this.strcontent = this.strcontent.substring(-100000);
          }
          nextTick(() => {
            let sroll = document.getElementById('sroll');
            sroll.scrollTop = sroll.scrollHeight
            // console.log('----',sroll.scrollHeight)
          })
          if(recvdata.isEnd === true) {
            // 等5s后再跳转
            this.sleep1(5000,()=>{
              this.isSucceed = true
            })
            // this.logInfoList.push('***** 安装结束 *****')
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