<template>
  <!-- 开始安装 -->
  <div class="install-com">
    <el-row class="install-top">
      <h3>安装日志信息</h3>
    </el-row>
    <div class="install-box">
      <ul id="sroll" class="infinite-list" style="overflow: auto">
        <li v-for="(item,index) in logInfoList" :key="index" style="height: 20px;">{{ item }}</li>
      </ul>
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
              this.splitss(ss,160); // 存放数组，超过160就换行
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
          this.PushInfo(recvdata.installLogInfo)
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
  margin: 20px;
}
.infinite-list {
  height: 400px;
  width: 90%;
  /* padding: 0;
  margin: 0; 
  list-style: none;*/
}
.install-box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  height: 500px;
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
</style>