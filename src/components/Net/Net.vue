<template>
  <el-row :gutter="10" style="height: 100%; margin: 5px">
    <el-col :span="14" style="height: 100%">
      <div id="netCharts" style="height: 100%; width: 100%"></div>
    </el-col>
    <el-col 
      :span="10" 
      style="height: 100%;"
      v-loading="isHasData"
      element-loading-text="loading..."
    >
      <span style="font-weight: bold; color=black; font-size: 20px;">Node{{ this.store.state.nowNodeId }}的Net{{ this.netId }}信息</span>
      <!-- <ol>
        <li>发送：{{ netSend }}Kbps</li>
        <li>接收：{{ netResolve }}Kbps</li>
        <li>Ipv4地址：{{ netIpv4 }}</li>
        <li>Ipv6地址：{{ netIpv6 }}</li>
      </ol> -->
      <el-row :gutter="20">
        <el-select
          style="margin: 10px 10px 5px 5px;"
          v-model="nowNetName"
        >
          <!-- 这里用el-option -->
          <el-option 
            v-for="(item,id) in this.netShowName"
            :key="id"
            :label="item.netName"
            :value="item.netName"
            @click="changeNetId(id)"
          >
          </el-option>
        </el-select>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24"
          ><div class="grid-content ep-bg-purple" />
          网卡名称：<span style="font-size: 24px">{{ netName1 }}</span></el-col
        >
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"
          ><div class="grid-content ep-bg-purple" />
          发送：<span style="font-size: 24px">{{ netSend }}Kbps</span></el-col
        >
        <el-col :span="12"
          ><div class="grid-content ep-bg-purple" />
          接收：<span style="font-size: 24px"
            >{{ netResolve }}Kbps</span
          ></el-col
        >
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24"
          ><div class="grid-content ep-bg-purple" />
          Ipv4地址：<span style="font-size: 24px">{{ netIpv4 }}</span></el-col
        >
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24"
          ><div class="grid-content ep-bg-purple" />
          Ipv6地址：<span style="font-size: 24px">{{ netIpv6 }}</span></el-col
        >
      </el-row>
      <!-- <el-scrollbar style="height: 20%">
        <div class="scrollbar-flex-content">
          <p
            v-for="(item, id) in netChartLength"
            :key="id"
            @click="changeNetId(id)"
            class="scrollbar-demo-item"
          >
            网卡{{ id }}
          </p>
        </div>
      </el-scrollbar> -->
    </el-col>
  </el-row>
</template>

<script>
import { useStore } from "vuex";
import { markRaw } from '@vue/reactivity';
import { IP,WEBSOCKET_PORT } from '@/api/port.js'
import { ElMessage,ElMessageBox } from 'element-plus'
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
      // nodeNet的监听
      wsNodeNet: null,
      // 接受的数据
      netList: null,
      // 展示的的数据
      netId: 0,
      netSend: null,
      netResolve: null,
      netIpv4: null,
      netIpv6: null,
      netName1: null,
      // net页面展示列表
      netShowName: [],
      nowNetName: null,

      // echarts实例
      echartsInstance: null,
      // echarts数据
      netChartLength: 0,
      netChartData: [],
      netChartSendData: [], // 发送数据
      netChartReceiveData: [], // 接收数据
      // echarts图表宽度
      chartOffsetWidth: null,
    };
  },
  created() {
    this.initNodeNet();
  },
  mounted() {
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
    resizeObserver.observe(document.getElementById("netCharts"));
  },
  unmounted() {
    // if(this.wsNodeNet.readyState === WebSocket.OPEN){
      if(this.wsNodeNet != null) this.wsNodeNet.close(1000,"wsNodeNet主动断开");
    // }
    
    // 销毁时，取消监听
    window.removeEventListener("resize", this.screenAdapter);
  },
  methods: {
    initNodeNet() {
      this.wsNodeNet = new WebSocket("ws://"+IP+WEBSOCKET_PORT);
      this.wsNodeNet.onopen = this.websocketonopen;
      this.wsNodeNet.onerror = this.websocketonerror;
      this.wsNodeNet.onmessage = this.websocketonmessage;
      this.wsNodeNet.onclose = this.websocketclose;
    },
    websocketonopen() {
      // 连接成功
      // console.log("NodeNet WebSocket连接成功");
      // 连接成功后直接发送数据
      if(this.wsNodeNet.readyState === 1 && this.store.state.nowNodeId != null && this.store.state.nowNodeId != undefined) {
        this.wsNodeNet.send(
          JSON.stringify({
            url: "/getNetData",
            params: {
              token: this.store.state.userToken,
              nodeId: this.store.state.nowNodeId, // nodeId
            },
          })
        );
      }
    },
    websocketonerror() {
      ElMessage({
        message: '网络连接异常，网络信息获取失败，开始重连',
        type: 'warning',
      })
      //链接建立失败重连
      this.initNodeNet();
    },
    websocketonmessage(ret) {
      // 数据接收
      // 接收到的类似send的数据，其中sendData.data 是要接受的数据
      let sendData = JSON.parse(ret.data);
      // sendData = sendData.obj;
      // 根据发送过来的action采取不同的措施
      const url = sendData.url;
      // 接收数据
      if (url === "getNetData" && 
        this.store.state.nowNodeId != null &&
        this.store.state.nowNodeId === sendData.params.nodeId &&
        sendData.token === this.store.state.userToken
      ) {
        let netData = sendData.params.netData
        // 保留两位小数
        for(let i=0;i<netData.length;i++) {
          netData[i].netSend = this.toFix2(netData[i].netSend)
          netData[i].netResolve = this.toFix2(netData[i].netResolve)
        }
        // 初始net编号为0
        // this.netSend = netData[this.netId].netSend;
        this.netResolve = netData[this.netId].netResolve[ netData[this.netId].netResolve.length - 1 ];
        this.netSend = netData[this.netId].netSend[ netData[this.netId].netSend.length - 1 ];
        this.netIpv4 = netData[this.netId].netIpv4;
        this.netIpv6 = netData[this.netId].netIpv6;
        this.netName1 = netData[this.netId].netName; // 3-22 增加了网卡名称
        this.netList = netData
        // 网卡名称列表
        if(this.netShowName.length != netData.length) {
          for(let i=0;i<netData.length;i++) {
            this.netShowName.push({
              netId: netData[i].netId,
              netName: "网卡" + netData[i].netId.toString()
            })
          }
          // 更新默认显示信息
          this.nowNetName = this.netShowName[this.netId].netName
        }
        // 接收数据
        
        // 1-10 使用选择器切换不同的net
        if (this.echartsInstance) {
          // 更新数据
          this.getChartData();
        }
      }
    },
    websocketclose(ret) {
      // 关闭
      // console.log("wsNodeNet连接关闭 (" + ret.code + "),reason = " + ret.reason);
    },
    // 保留2位，不足加0
    to2Str(num) {
      let ss = num.toString();
      while (ss.length < 2) {
        ss = "0" + ss;
      }
      return ss;
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
      let nodeNetTitle = "ERROR";
      if (this.store.state.nowNodeId != null) {
        nodeNetTitle =
          "Node" + this.store.state.nowNodeId + "的Net" + this.netId + "发收速率";
      }
      let chartDom = document.getElementById("netCharts");
      this.echartsInstance = markRaw(this.$echarts.init(chartDom));
      let option = {
        title: {
          text: nodeNetTitle,
          left: 20,
        },
        tooltip: {
          trigger: 'axis',
          valueFormatter: (value) => value.toString() + ' Kbps', // 提示框加上 kbps
        },
        legend: {
          data: ['发送数据', '接收数据'],
          top: 30,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          // data: date // 日期数据
        },
        yAxis: {
          boundaryGap: [0, "50%"],
          type: "value",
          axisLabel: {
            formatter: '{value} Kbps', // 纵坐标加上 kbps
          }
        },
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            dataView: { readOnly: false },
            magicType: { type: [ 'stack'] },
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
            name: "发送数据",
            type: "line",
            // smooth: true,
            areaStyle: {
              shadowColor: '#2a99c9',
              normal: {},
            },
            // data: data // 实际数据
          },
          {
            name: "接收数据",
            type: "line",
            // smooth: true,
            areaStyle: {
              shadowColor: '#afe8ff',
              normal: {},
            },
            // data: data // 实际数据
          },
        ],
      };
      this.echartsInstance.showLoading();
      this.echartsInstance.setOption(option);
    },
    // 更新图表数据
    getChartData() {
      // 准备数据
      if (this.netChartLength === 0) {
        // 初始化
        this.netChartLength = this.netList.length;
        this.netChartData = [];
        this.netChartSendData = [];
        this.netChartReceiveData = [];
        for (let i = 0; i < this.netList.length; i++) {
          this.netChartSendData.push({
            data: [],
            time: [],
          })
          this.netChartReceiveData.push({
            data: [],
            time: [],
          })
        }
      }
      // 更新数据
      for (let i = 0; i < this.netList.length; i++) {
        // 发送数据
        this.netChartSendData[i].data = this.netList[i].netSend
        this.netChartSendData[i].time = this.netList[i].netNowTime
        // 接收数据
        this.netChartReceiveData[i].data = this.netList[i].netResolve
        this.netChartReceiveData[i].time = this.netList[i].netNowTime
      }
      this.updateChart();
    },
    // 更新图表界面
    updateChart() {
      let nodeNetTitle = "ERROR";
      if (this.store.state.nowNodeId != null) {
        nodeNetTitle =
          "Node" + this.store.state.nowNodeId + "的Net" + this.netId + "发收速率";
      }
      const titleSize = (this.chartOffsetWidth / 100) * 2.5
      let option = {
        title: {
          text: nodeNetTitle,
          left: 20,
          textStyle: {
            fontSize: titleSize
          }
        },
        xAxis: {
          data: this.netChartSendData[this.netId].time, // 日期数据
        },
        series: [
          {
            name: "发送数据",
            data: this.netChartSendData[this.netId].data, // 发送数据
          },
          {
            name: "接收数据",
            data: this.netChartReceiveData[this.netId].data, // 接收数据
          }
        ],
      };
      this.echartsInstance.hideLoading();
      this.echartsInstance.setOption(option);
      this.echartsInstance.resize();
    },
    // 图表大小自适应
    screenAdapter() {
      const titleSize = (this.chartOffsetWidth / 100) * 2.5
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleSize,
          },
        },
      };
      if (this.echartsInstance) {
        this.echartsInstance.setOption(adapterOption);
        this.echartsInstance.resize();
      }
    },
    // 改变netId
    changeNetId(ret) {
      this.netId = ret;
      // 更新默认显示信息
      this.nowNetName = this.netShowName[ret].netName
      // 更新页面数据
      this.netResolve = this.netList[this.netId].netResolve[ this.netList[this.netId].netResolve.length - 1 ];
      this.netSend = this.netList[this.netId].netSend[ this.netList[this.netId].netSend.length - 1 ];
      this.netIpv4 = this.netList[this.netId].netIpv4;
      this.netIpv6 = this.netList[this.netId].netIpv6;
      this.netName1 = this.netList[this.netId].netName; // 3-22 增加了网卡名称
      // 更新图表数据
      this.updateChart();
    },
  },
  computed: {
    isHasData() {
      if(this.netSend != null){
        return false
      }
      return true
    }
  }
};
</script>

<style>
/* 滚动目录 */
.scrollbar-flex-content {
  display: flex;
}
/* 滚动条目 */
.scrollbar-demo-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 30px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: #409eff;
  color: white;
}
</style>