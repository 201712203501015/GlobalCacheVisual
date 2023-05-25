<template>
  <el-row :gutter="10" style="height: 100%; margin: 5px">
    <el-col :span="14" style="height: 100%">
      <div id="diskCharts" style="height: 100%; width: 100%"></div>
    </el-col>
    <el-col
      :span="10"
      style="height: 100%"
      v-loading="isHasData"
      element-loading-text="loading..."
    >
      <!-- 下拉菜单 -->
      <!-- <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="磁盘:">
          <el-select v-model="nowDiskName" placeholder="磁盘号">
            <el-option
              v-for="(item, id) in this.diskInfoLength"
              :key="id"
              :label="this.diskInfo.diskShowName[id]"
              :value="this.diskInfo.diskShowName[id]"
              @click="changeDisk(id)"
            >
              
            </el-option>
          </el-select>
        </el-form-item>
      </el-form> -->
      <!-- 下拉菜单结束 -->
      <span style="font-weight: bold; color=black; font-size: 20px;">
        Node{{ nowNodeId }}的缓存盘 {{ this.diskInfo.diskId[this.diskId] }} 信息
      </span>
      <el-row :gutter="20">
        <el-select
          style="margin: 10px 10px 5px 5px;" 
          v-model="nowDiskName"
        >
          <el-option
            v-for="(item, id) in this.diskInfoLength"
            :key="id"
            :label="this.diskInfo.diskShowName[id]"
            :value="this.diskInfo.diskShowName[id]"
            @click="changeDisk(id)"
          >
          </el-option>
        </el-select>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="20"
          ><div class="grid-content ep-bg-purple" />
          名称：<span style="font-size: 24px">{{
            diskInfo.diskName[this.diskId]
          }}</span></el-col
        >
      </el-row>
      <el-row :gutter="20">
        <el-col :span="20"
          ><div class="grid-content ep-bg-purple" />
          Sn号：<span style="font-size: 24px">{{
            diskInfo.diskSn[this.diskId]
          }}</span></el-col
        >
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24"
          ><div class="grid-content ep-bg-purple" />
          容量：<span style="font-size: 24px"
            >{{ diskInfo.diskCapacity[this.diskId] }}TB</span
          ></el-col
        >
        <!-- <el-col :span="12"
          ><div class="grid-content ep-bg-purple" />
          类型：<span style="font-size: 24px">{{
            diskInfo.diskType[diskId]
          }}</span></el-col
        > -->
      </el-row>
      <el-col :span="20">
        <div class="grid-content ep-bg-purple" />
        状态：<span style="font-size: 24px">
          <el-tag size="large">
            {{
              this.TranInfo(diskInfo.state[this.diskId])
            }}
          </el-tag>
        </span>
      </el-col>
      <el-row :gutter="20"> </el-row>
      <!--<el-scrollbar style="height: 20%">
        <div class="scrollbar-flex-content">
          <p
            v-for="(item, id) in this.diskInfoLength"
            :key="id"
            @click="changeDisk(id)"
            class="scrollbar-demo-item"
          >
            磁盘{{ this.diskInfo.diskId[id] }}
          </p>
        </div>
      </el-scrollbar> -->
    </el-col>
  </el-row>
</template>

<script>
import { useStore } from "vuex";
import { markRaw } from "@vue/reactivity";
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
      // nodeDisk的监听
      wsNodeDisk: null,

      // 2-20 修改数据
      // echarts实时数据
      diskIORatio: [],
      diskIORatioLength: 0, // （虚拟磁盘个数）IO速率的磁盘个数
      // 页面展示数据
      diskInfo: {
        diskShowName: [], // el-option 遍历
        diskId: [],
        diskName: [],
        diskSn: [],
        diskCapacity: [],
        state: [],
        diskType: [],
      },
      // 当前页面磁盘名称
      nowDiskName: "磁盘0",
      diskInfoLength: 0, // （实际磁盘个数）页面展示磁盘信息个数
      diskId: 0, // 页面选中的diskId
      // echarts图表
      echartsInstance: null,
      // echarts图表数据
      diskChartData: [],
      // echarts数据预处理
      chartDataBefore: [],
      // echarts图表宽度
      chartOffsetWidth: null,
      // 下拉菜单
      formInline: {
        user: "",
        region: "",
      },
    };
  },
  created() {
    // 建立长连接
    this.initNodeDisk();
  },
  mounted() {
    // 初始化图表
    this.initChart();
    // 建立监听
    window.addEventListener("resize", this.screenAdapter);
    // 监听宽度变化
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // console.log('宽度 = ',entry.target.offsetWidth)
        this.chartOffsetWidth = entry.target.offsetWidth;
      }
    });
    // 开启监听
    resizeObserver.observe(document.getElementById("diskCharts"));
  },
  unmounted() {
    // 销毁长连接
    if(this.wsNodeDisk.readyState === WebSocket.OPEN){
      this.wsNodeDisk.close(1000,'前端wsNodeDisk主动关闭');
    }
    
    // 销毁时，取消监听
    window.removeEventListener("resize", this.screenAdapter);
  },
  methods: {
    // 解释状态
    TranInfo(ss) {
      if(ss === 'VDISK_STATE_UP'){
        return "磁盘处于UP，可服务IO的状态"
      }else if(ss === 'VDISK_STATE_DOWN'){
        return "磁盘处于DOWN，不可服务IO的状态"
      }
    },
    // 下拉菜单
    onSubmit() {
      this.diskId = id;
      this.updateChart();
    },
    // wsNodeDisk
    initNodeDisk() {
      this.wsNodeDisk = new WebSocket("ws://"+IP+WEBSOCKET_PORT);
      this.wsNodeDisk.onopen = this.websocketonopen;
      this.wsNodeDisk.onerror = this.websocketonerror;
      this.wsNodeDisk.onmessage = this.websocketonmessage;
      this.wsNodeDisk.onclose = this.websocketclose;
    },
    websocketonopen() {
      // 连接成功
      // console.log("NodeDisk WebSocket连接成功");
      // 连接成功后直接发送数据
      if(this.wsNodeDisk.readyState === 1 && this.store.state.nowNodeId != null && this.store.state.nowNodeId != undefined) {
        this.wsNodeDisk.send(
          JSON.stringify({
            url: "/getDiskData",
            params: {
              token: this.store.state.userToken,
              nodeId: this.store.state.nowNodeId,
            },
          })
        );
      }
    },
    websocketonerror() {
      // 连接失败
      ElMessageBox.alert('连接失败', '警告', {
        confirmButtonText: 'OK'
      })
    },
    websocketonmessage(ret) {
      // 数据接收
      // 接收到的类似send的数据，其中sendData.data 是要接受的数据
      let sendData = JSON.parse(ret.data);
      // sendData = sendData.obj;
      // 根据发送过来的url采取不同的措施
      const url = sendData.url;
      // console.log(sendData.data)
      if (url === "getDiskData" && 
        this.store.state.nowNodeId != null &&
        this.store.state.nowNodeId === sendData.params.nodeId && 
        sendData.token === this.store.state.userToken
      ) {
        // sendData.params = JSON.parse(sendData.params);
        // 接收数据
        this.diskList = sendData.params;
        // 2-20 修改数据
        // echarts数据
        this.diskIORatio = [];
        this.diskIORatioLength = sendData.params.diskIORatio.length;
        for (let i = 0; i < sendData.params.diskIORatio.length; i++) {
          this.diskIORatio.push({
            name: sendData.params.diskIORatio[i].name,
            readRatio: sendData.params.diskIORatio[i].readRatio,
            writeRatio: sendData.params.diskIORatio[i].writeRatio,
            diskNowTime: sendData.params.diskIORatio[i].diskNowTime
          });
        }
        // 页面显示数据
        this.diskInfoLength = sendData.params.diskInfo.length;
        for (let i = 0; i < sendData.params.diskInfo.length; i++) {
          // 初始化
          if (i === 0) {
            this.diskInfo.diskShowName = [];
            this.diskInfo.diskId = [];
            this.diskInfo.diskName = [];
            this.diskInfo.diskSn = [];
            this.diskInfo.diskCapacity = [];
            this.diskInfo.state = [];
            this.diskInfo.diskType = [];
          }
          // 存入数据
          this.diskInfo.diskShowName.push("diskId " + sendData.params.diskInfo[i].diskId.toString())
          this.diskInfo.diskId.push(sendData.params.diskInfo[i].diskId);
          this.diskInfo.diskName.push(sendData.params.diskInfo[i].diskName);
          this.diskInfo.diskSn.push(sendData.params.diskInfo[i].diskSn);
          this.diskInfo.diskCapacity.push(
            sendData.params.diskInfo[i].diskCapacity.toFixed(2)
          );
          this.diskInfo.state.push(sendData.params.diskInfo[i].state);
          this.diskInfo.diskType.push(sendData.params.diskInfo[i].diskType);
        }
        this.nowDiskName = this.diskInfo.diskShowName[this.diskId]
        // 更新图表
        if (this.echartsInstance != null) {
          this.getChartData();
          // 建立监听
          // window.addEventListener('resize', this.screenAdapter)
        }
      }
    },
    websocketclose(ret) {
      // 关闭
      // console.log("wsNodeDisk连接关闭 (" + ret.code + "),reason = " + ret.reason);
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
      let nodeDiskTitle = "ERROR";
      if (this.store.state.nowNodeId != null) {
        nodeDiskTitle =
          "Node" +
          this.store.state.nowNodeId.toString() +
          "的缓存盘" +
          "读写速率";
      }
      let chartDom = document.getElementById("diskCharts");
      this.echartsInstance = markRaw(this.$echarts.init(chartDom));
      let option = {
        title: {
          text: nodeDiskTitle,
          left: 20,
        },
        tooltip: {
          trigger: "axis",
          valueFormatter: (value) => value.toString() + ' Kbps', // 提示框加上kbps
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
        },
        yAxis: {
          boundaryGap: [0, "50%"],
          type: "value",
          axisLabel: {
            formatter: '{value} Kbps'
          }
        },
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: "none",
            },
            dataView: { readOnly: false },
            magicType: { type: ["stack"] },
            restore: {},
            saveAsImage: {},
          },
        },
        dataZoom: [
          {
            type: "slider",
            show: true,
            realtime: true,
            showDetail: true,
          },
        ],
        color: [
          "#516b91",
          "#59c4e6",
          "#edafda",
          "#93b7e3",
          "#a5e7f0",
          "#cbb0e3",
        ],
      };
      this.echartsInstance.showLoading();
      this.echartsInstance.setOption(option);
    },
    // float保留小数点后两位
    toFix2(arr) {
      let b = []
      for(let i=0;i<arr.length;i++) {
        b.push(parseFloat(arr[i]).toFixed(2))
      }
      return b
    },
    // 更新图表数据
    getChartData() {
      // 针对diskIORatio
      if (this.diskChartData.length === 0) {
        // 根据数组长度赋值
        for (let i = 0; i < this.diskIORatioLength; i++) {
          this.diskChartData.push({
            name: this.diskIORatio[i].name,
            readRatio: [],
            writeRatio: [],
            time: [],
          });
        }
      }
      // 覆盖数组
      for (let i = 0; i < this.diskIORatioLength; i++) {
        this.diskChartData[i].readRatio = this.toFix2(this.diskIORatio[i].readRatio);
        this.diskChartData[i].writeRatio = this.toFix2(this.diskIORatio[i].writeRatio);
        this.diskChartData[i].time = this.diskIORatio[i].diskNowTime;
      }

      this.updateChart();
    },
    // 更新图表界面
    updateChart() {
      let nodeDiskTitle = "ERROR";
      if (this.store.state.nowNodeId != null) {
        nodeDiskTitle =
          "Node" +
          this.store.state.nowNodeId.toString() +
          "的缓存盘" +
          "读写速率";
      }
      let seriesList = [];
      let legendData = [];
      for (let i = 0; i < this.diskChartData.length; i++) {
        let name = this.diskChartData[i].name;
        let readRatio = this.diskChartData[i].readRatio;
        let writeRatio = this.diskChartData[i].writeRatio;
        legendData.push(name + "R");
        legendData.push(name + "W");
        seriesList.push({
          // 读数据
          name: name + "R",
          data: readRatio,
          type: "line",
          areaStyle: {
            normal: {},
          },
        });
        seriesList.push({
          // 写数据
          name: name + "W",
          data: writeRatio,
          type: "line",
          areaStyle: {
            normal: {},
          },
        });
      }
      // 时间数据
      let time = this.diskChartData[0].time;
      const titleSize = (this.chartOffsetWidth / 100) * 2.5;
      let option = {
        title: {
          text: nodeDiskTitle,
          left: 20,
          textStyle: {
            fontSize: titleSize,
          },
        },
        legend: {
          type: "scroll",
          top: 30,
          data: legendData,
        },
        xAxis: {
          data: time, // 时间数据
        },
        series: seriesList,
      };
      // console.log('series = ',seriesList)
      this.echartsInstance.hideLoading();
      this.echartsInstance.setOption(option);
      this.echartsInstance.resize();
    },
    // 图表大小自适应
    screenAdapter() {
      const titleSize = (this.chartOffsetWidth / 100) * 2;
      // (document.getElementById("diskCharts").offsetWidth / 100) * 3.6;
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

    // 切换磁盘id
    changeDisk(id) {
      this.diskId = id;
      this.nowDiskName = this.diskInfo.diskShowName[id]
      this.updateChart();
    },
  },
  computed: {
    nowNodeId() {
      return this.store.state.nowNodeId;
    },
    isHasData() {
      if (this.diskInfoLength > 0) {
        return false;
      }
      return true;
    },
  },
};
</script>

<style scoped>
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