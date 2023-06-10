<template>
  <el-row :gutter="10" style="height: 100%; margin: 5px;">
    <el-col :span="14" style="height: 100%;">
      <div id="memoryCharts" style="height: 100%;width: 100%;"></div>
    </el-col>
    <el-col 
      :span="10" 
      style="height: 100%;"
      v-loading="isHasData"
      element-loading-text="loading..."
    >
      <span style="font-weight: bold; color=black; font-size: 20px;">Node{{ this.store.state.nowNodeId }}的内存信息</span>
      <!-- <ol>
        <li>使用中：{{ memoryUsing }}GB（8.0GB）</li>
        <li>可用：{{ memoryUseable }}GB（8.0GB）</li>
        <li>缓存：{{ memoryCache }}GB</li>
      </ol> -->
      <!-- 真不错！不要改这个了，已经很完美了 -->
      <el-row :gutter="20">
        <el-col :span="20"
          ><div class="grid-content ep-bg-purple" />
          使用中：<span style="font-size: 24px">{{ memoryUsing }}GB</span></el-col
        >
      </el-row>
      <el-row :gutter="20">
        <el-col :span="20"
          ><div class="grid-content ep-bg-purple" />
          可用：<span style="font-size: 24px">{{ memoryUseable }}GB</span></el-col
        >
      </el-row>
      <el-row :gutter="20">
        <el-col :span="20"
          ><div class="grid-content ep-bg-purple" />
          缓存：<span style="font-size: 24px">{{ memoryCache }}GB</span></el-col
        >
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { useStore } from 'vuex'
import { markRaw } from '@vue/reactivity';
import { IP,WEBSOCKET_PORT } from '@/api/port.js'
import { ElMessage,ElMessageBox } from 'element-plus'
export default {
  setup () {
    // 创建store对象
    const store = useStore()
    return {
        store
    }
  },
  data () {
    return {
      nodeId: -1,
      // nodeMemory的监听
      wsNodeMemory: null,
      // 接收数据
      memoryUsing: null,
      memoryUseable: null,
      memoryCache: null,
      memoryRatio: null,
      memoryRatioList: null,
      memoryNowTime: null,
      // echarts实例
      echartsInstance: null,
      // echarts图表数据
      memoryChartData:{
        data: [],
        time: []
      },
      // echarts图表宽度
      chartOffsetWidth: null,
      timeId: null,
    }
  },
  created () {
    // 建立长连接
    this.initNodeMemory()
  },
  mounted () {
    // 初始化图表
    this.initChart()
    // 建立监听
    window.addEventListener('resize', this.screenAdapter)
    // 监听宽度变化
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        // console.log('宽度 = ',entry.target.offsetWidth)
        this.chartOffsetWidth = entry.target.offsetWidth
      }
    });
    // 开启监听
    resizeObserver.observe(document.getElementById("memoryCharts"));
  },
  beforeUnmount () {
    if(this.wsNodeMemory != null)
    {
      this.wsNodeMemory.close(1000,'前端wsNodeMemory主动关闭')
    }
    window.clearTimeout(this.timeId)
  },
  unmounted () {
    // if(this.wsNodeMemory.readyState === WebSocket.OPEN){
      // 销毁长连接
    // }
    // 销毁时，取消监听
    window.removeEventListener('resize', this.screenAdapter)
  },
  expose: ['destroymemoryWS'],
  methods: {
    // wsNodeDisk
    initNodeMemory () {
      this.wsNodeMemory = new WebSocket("ws://"+IP+WEBSOCKET_PORT);
      this.wsNodeMemory.onopen = this.websocketonopen
      this.wsNodeMemory.onerror = this.websocketonerror
      this.wsNodeMemory.onmessage = this.websocketonmessage
      this.wsNodeMemory.onclose = this.websocketclose
    },
    websocketonopen() { // 连接成功
      // console.log("NodeMemory WebSocket连接成功")
      // 连接成功后直接发送数据
      if(this.wsNodeMemory != null && this.wsNodeMemory.readyState === 1 && this.store.state.nowNodeId != null && this.store.state.nowNodeId != undefined) {
        this.wsNodeMemory.send(JSON.stringify({
          url: '/getMemoryData',
          params: {
            token: this.store.state.userToken,
            nodeId: this.store.state.nowNodeId, // nodeId
          }
        }))
      }
    },
    websocketonerror() { // 连接失败
      //链接建立失败重连
      window.clearTimeout(this.timeId)
      this.timeId = setTimeout(()=>{
        this.initNodeMemory();
      },1000)
    },
    websocketonmessage(ret) { // 数据接收
        // 接收到的类似send的数据，其中sendData.data 是要接受的数据
        let sendData = JSON.parse(ret.data)
        // sendData = sendData.obj
        // 根据发送过来的action采取不同的措施
        const url = sendData.url
        // console.log(sendData.data)
        if (url === 'getMemoryData' && 
          this.store.state.nowNodeId != null &&
          this.store.state.nowNodeId === sendData.params.nodeId &&
          sendData.token === this.store.state.userToken
        ) {
            // sendData.params = JSON.parse(sendData.params)
            // 接收数据
            this.memoryUsing = parseFloat(sendData.params.memoryUsing).toFixed(2)
            this.memoryUseable = parseFloat(sendData.params.memoryUseable).toFixed(2)
            this.memoryCache = parseFloat(sendData.params.memoryCache).toFixed(2)
            this.memoryRatio = parseFloat(sendData.params.memoryRatio).toFixed(2)
            this.memoryRatioList = this.toFix2(sendData.params.memoryRatioList)
            this.memoryNowTime = sendData.params.memoryNowTime
            if(this.echartsInstance) {
              // 更新数据
              this.getChartData()
            }
        }
    },
    websocketclose(ret) { // 关闭
      // (1)先销毁实例
      this.wsNodeMemory = null
      // (2)异常退出时提示
      if(ret.code === 1006)
      {
        if(this.nodeId === this.store.state.nowNodeId)
        {
          ElMessage({
            message: '网络连接断开，内存信息获取失败',
            type: 'warning',
          })
        }
      }
        // console.log('wsNodeMemory连接关闭 (' + ret.code + '),reason = ' + ret.reason)
    },
    destroymemoryWS() {
      // console.log("调用了memory")
      if(this.wsNodeMemory != null)
      {
        this.wsNodeMemory.close(1000,'前端wsNodeMemory主动关闭')
      }
    },
    // 保留2位，不足加0
    to2Str(num) {
      let ss = num.toString()
      while(ss.length < 2){
        ss = "0" + ss
      }
      return ss
    },
    // float保留小数点后两位
    toFix2(arr) {
      let b = []
      for(let i=0;i<arr.length;i++) {
        b.push(parseFloat(arr[i]).toFixed(2))
      }
      return b
    },
    // echarts初始化
    initChart() {
      let nodeMemoryTitle = "ERROR"
      if(this.store.state.nowNodeId != null){
        nodeMemoryTitle = "Node" + this.store.state.nowNodeId.toString() + "的内存使用情况"
        this.nodeId = this.store.state.nowNodeId
      }
      let chartDom = document.getElementById("memoryCharts");
      this.echartsInstance = markRaw(this.$echarts.init(chartDom));
      let option = {
        title: {
          text: nodeMemoryTitle,
          left: 20,
        },
        tooltip: {
          trigger: 'axis',
          valueFormatter: (value) => value.toString() + ' %', // 提示框加%
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          // data: date // 日期数据
        },
        yAxis: {
          boundaryGap: [0, '50%'],
          type: 'value',
          max: 100.0,
          axisLabel: {
            formatter: '{value} %', // 纵坐标加上%
          }
        },
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            dataView: { readOnly: false },
            magicType: { type: ['bar'] },
            restore: {},
            saveAsImage: {}
          }
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            realtime: true,
            showDetail: true
          }
        ],
        color: [
          "#516b91",
          "#59c4e6",
          "#edafda",
          "#93b7e3",
          "#a5e7f0",
          "#cbb0e3"
        ],
        series: [
          {
            name: '内存使用率',
            type: 'line',
            // smooth: true,
            symbol: 'none',
            stack: 'a',
            areaStyle: {
              normal: {}
            },
            // data: data // 实际数据
          }
        ]
      };
      this.echartsInstance.showLoading();
      this.echartsInstance.setOption(option);
    },
    // 更新图表数据
    getChartData() {
      // 更新数据
      this.memoryChartData.data = this.memoryRatioList
      this.memoryChartData.time = this.memoryNowTime
      this.updateChart()
    },
    // 更新图表界面
    updateChart() {
      let nodeMemoryTitle = "ERROR"
      if(this.store.state.nowNodeId != null){
        nodeMemoryTitle = "Node" + this.store.state.nowNodeId.toString() + "的内存使用情况"
        this.nodeId = this.store.state.nowNodeId
      }
      const titleSize = (this.chartOffsetWidth / 100) * 2.5
      let option = {
        title: {
          text: nodeMemoryTitle,
          left: 20,
          textStyle: {
            fontSize: titleSize
          }
        },
        xAxis: {
          data: this.memoryChartData.time // 日期数据
        },
        series: [
          {
            name: '内存使用率',
            data: this.memoryChartData.data // 实际数据
          }
        ]
      };
      this.echartsInstance.hideLoading();
      this.echartsInstance.setOption(option);
      this.echartsInstance.resize()
    },
    // 图表大小自适应
    screenAdapter () {
      const titleSize = (this.chartOffsetWidth / 100) * 2.5
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleSize
          }
        }
      }
      if(this.echartsInstance) {
        this.echartsInstance.setOption(adapterOption)
        this.echartsInstance.resize()
      }
    },
  },
  computed: {
    isHasData() {
      if(this.memoryUsing != null){
        return false
      }
      return true
    }
  }
}
</script>

<style>
.el-row {
  margin-bottom: 2px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 15px;
}
</style>