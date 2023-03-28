<template>
  <el-row :gutter="10" style="height: 100%; margin: 5px">
    <el-col :span="14" style="height: 100%">
      <div id="cpuCharts" style="height: 100%; width: 100%"></div>
    </el-col>
    <el-col 
      :span="10" 
      style="height: 100%"
      v-loading="isHasData"
      element-loading-text="loading..."
    >
      <span style="font-weight: bold; color=black; font-size: 20px;">Node{{ this.store.state.nowNodeId }}的CPU信息</span>
      <!-- 真不错！不要改这个了，已经很完美了 -->
      <el-row :gutter="20">
        <el-col
          ><div class="grid-content ep-bg-purple" />
          利用率：<span style="font-size: 24px">{{ cpuUse }}%</span></el-col
        >
      </el-row>
      <el-row :gutter="20">
        <el-col :span="20"
          ><div class="grid-content ep-bg-purple" />
          运行时间：<span style="font-size: 24px"
            >{{ workingTime.dd }} 天 {{ workingTime.hh }} 小时
            {{ workingTime.mm }} 分钟</span
          ></el-col
        >
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { useStore } from "vuex";
import { markRaw } from '@vue/reactivity';
import { IP,WEBSOCKET_PORT } from '@/api/port.js'
import { ElMessageBox } from 'element-plus'
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
      // nodeCpu的监听
      wsNodeCpu: null,
      // nodeCpu监听到的信息
      cpuUse: null,
      cpuNowTime: {
        hh: null,
        mm: null,
        ss: null,
      },
      workingTime: {
        dd: null,
        hh: null,
        mm: null,
      },
      // echarts图表
      echartsInstance: null,
      // 用于预处理的chart数据，（1）数组长度是20；（2）数组能按照time的先后排序
      chartDataBefore: [],
      // eharts图表数据
      chartData: {
        time: [],
        data: [],
      },
      // echarts图表宽度
      chartOffsetWidth: null,
    };
  },
  created() {
    // 建立长连接
    this.initNodeCpu();
  },
  mounted() {
    // 初始化图表
    this.initChart();
    // 建立监听
    window.addEventListener("resize", this.screenAdapter);
    // 监听宽度变化
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        // console.log('宽度 = ',entry.target.offsetWidth)
        this.chartOffsetWidth = entry.target.offsetWidth
      }
    });
    // 开启监听
    resizeObserver.observe(document.getElementById("cpuCharts"));
  },
  unmounted() {
    // console.log('这是CPU.vue被销毁了')
    if(this.wsNodeCpu.readyState === WebSocket.OPEN){
      // 断开连接
      this.wsNodeCpu.close(1000,"前端NodeCPU主动关闭连接")
    }
    
    // 销毁时，取消监听
    window.removeEventListener("resize", this.screenAdapter);
  },
  methods: {
    // wsNodeList 初始化
    initNodeCpu() {
      this.wsNodeCpu = new WebSocket("ws://"+IP+WEBSOCKET_PORT);
      this.wsNodeCpu.onopen = this.websocketonopen;
      this.wsNodeCpu.onerror = this.websocketonerror;
      this.wsNodeCpu.onmessage = this.websocketonmessage;
      this.wsNodeCpu.onclose = this.websocketclose;
    },
    websocketonopen() {
      // 连接成功
      // console.log("NodeCpu WebSocket连接成功");
      // 连接成功后直接发送数据
      this.wsNodeCpu.send(
        JSON.stringify({
          url: "/getCpuData",
          params: {
            token: this.store.state.userToken, // token
            nodeId: this.store.state.nowNodeId, // nodeId
          },
          // action: 'getCpuData',
          // socketType: 'getCpuData',
          // data: {
          //   nodeId: this.store.state.nowNodeId, // nodeId
          // }
        })
      );
    },
    websocketonerror() {
      // 连接失败
      // console.log("NodeCpu WebSocket连接失败",err);
      ElMessageBox.alert('连接失败', '警告', {
        confirmButtonText: 'OK'
      })
    },
    websocketonmessage(ret) {
      // 数据接收
      // 接收到的类似send的数据，其中sendData.data 是要接受的数据
      let sendData = JSON.parse(ret.data);
      // sendData = sendData.obj;
      // 根据发送过来的action采取不同的措施
      const url = sendData.url;
      if (url === "getCpuData" && 
        this.store.state.nowNodeId != null && 
        this.store.state.nowNodeId === sendData.params.nodeId &&
        sendData.token === this.store.state.userToken
      ) {
        // 接收数据
        // sendData.params = sendData.params;
        // console.log("cpuData",sendData.data)
        this.cpuUse = (sendData.params.cpuUse).toFixed(2); // 这里不*100
        this.workingTime.dd = this.to2Str(sendData.params.workingTime.dd);
        this.workingTime.hh = this.to2Str(sendData.params.workingTime.hh);
        this.workingTime.mm = this.to2Str(sendData.params.workingTime.mm);
        // 更新cpu利用率图数据
        let cpuRatio = sendData.params.cpuRatio
        for(let i=0;i<cpuRatio.cpuTime.length;i++) {
          let fg = false
          for(let j=0;j<this.chartDataBefore.length;j++) {
            if(cpuRatio.cpuTime[i] === this.chartDataBefore[j]['cpuTime']) {
              fg = true
              break
            }
          }
          // 新的数据，放入
          if(fg === false) {
            this.chartDataBefore.push({
              cpuTime: cpuRatio.cpuTime[i],
              cpuUse: cpuRatio.cpuUse[i]
            })
          }
        }
        // 数组长度 > 0 才能排序
        if(this.chartDataBefore.length > 0) {
          // 按照时间递增
          this.chartDataBefore.sort((a,b) => a.cpuTime.localeCompare(b.cpuTime))
        }
        // 长度必须 = 20
        while(this.chartDataBefore.length > 20) {
          this.chartDataBefore.shift() // 删除数组的第一个元素
        }

        // 更新图表
        if (this.echartsInstance != null) {
          this.getChartData();
        }
      }
    },
    // .close(1000)调用时，触发onclose事件
    websocketclose(ret) {
      // 监听WebSocket的readyState变为CLOSED时
      // console.log("wsNodeCpu连接失败 (" + ret.code + "), reason = " + ret.reason);
      // console.log('======',this.wsNodeCpu)
    },
    // 保留2位，不足加0
    to2Str(num) {
      let ss = num.toString();
      while (ss.length < 2) {
        ss = "0" + ss;
      }
      return ss;
    },
    // echarts初始化
    initChart() {
      let nodeCpuTitle = "ERROR";
      if (this.store.state.nowNodeId != null) {
        nodeCpuTitle = "Node" + this.store.state.nowNodeId + "的CPU利用率";
      }
      let chartDom = document.getElementById("cpuCharts");
      this.echartsInstance = markRaw(this.$echarts.init(chartDom));
      let option = {
        title: {
          text: nodeCpuTitle,
          left: 20,
        },
        tooltip: {
          trigger: 'axis',
          valueFormatter: (value) => value.toString() + ' %', // 提示框加上%
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          // data: date // 日期数据
        },
        yAxis: {
          boundaryGap: [0, "50%"],
          type: "value",
          max: 100.0,
          axisLabel: {
            formatter: '{value} %' // 纵坐标加上%
          }
        },
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
            name: "CPU利用率",
            type: "line",
            // smooth: true,
            symbol: "none",
            stack: "a",
            areaStyle: {
              normal: {},
            },
            // data: data // 实际数据
          },
        ],
      };
      this.echartsInstance.setOption(option);
      this.echartsInstance.showLoading();
      // console.log('echarts建立完成')
    },
    // 更新图表数据
    getChartData() {
      if(this.chartDataBefore.length > 0) {
        this.chartData.time = []
        this.chartData.data = []
        for(let i=0;i<this.chartDataBefore.length;i++) {
          this.chartData.time.push(this.chartDataBefore[i].cpuTime)
          this.chartData.data.push(parseFloat(this.chartDataBefore[i].cpuUse).toFixed(2))
        }
        this.updateChart();
      }
    },
    // 更新图表界面
    updateChart() {
      let nodeCpuTitle = "ERROR";
      if (this.store.state.nowNodeId != null) {
        nodeCpuTitle = "Node" + this.store.state.nowNodeId + "的CPU利用率";
      }
      let option = {
        title: {
          text: nodeCpuTitle,
          left: 20,
        },
        xAxis: {
          data: this.chartData.time, // 日期数据
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
        series: [
          {
            name: "CPU利用率",
            data: this.chartData.data, // 实际数据
          },
        ],
      };
      this.echartsInstance.hideLoading();
      this.echartsInstance.setOption(option);
    },
    // 图表大小自适应
    screenAdapter() {
      const titleSize = (this.chartOffsetWidth / 100) * 2.5
        // (document.getElementById("cpuCharts").offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleSize,
          },
        },
      };
      this.echartsInstance.setOption(adapterOption);
      this.echartsInstance.resize();
    },
  },
  computed: {
    isHasData() {
      if(this.workingTime.dd != null){
        return false
      }
      return true
    }
  }
};
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