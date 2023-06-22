<template>
  <el-row :gutter="10" style="height: 100%; margin: 5px">
    <el-col :span="14" style="height: 100%">
      <div id="diskCharts" style="height: 100%; width: 100%"></div>
    </el-col>
    <el-col
      :span="10"
      style="height: 100%;"
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
        Node{{ nowNodeId }}的{{ this.diskInfo.diskShowName[this.diskId] }}信息
      </span>
      <el-row :gutter="10">
        <el-select
          style="margin: 5px 5px 0px 0px;" 
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
      <el-row :gutter="10">
        <el-col :span="12"
          ><div class="grid-content ep-bg-purple" />
          名称：<span style="font-size: 24px">{{
            diskInfo.diskName[this.diskId]
          }}</span></el-col
        >
        <el-col :span="12"
          ><div class="grid-content ep-bg-purple" />
          类型：<span style="font-size: 24px">{{
            diskInfo.diskType[this.diskId]
          }}</span></el-col
        >
      </el-row>
      <!-- <el-row :gutter="20">
        <el-col :span="20"
          ><div class="grid-content ep-bg-purple" />
          Sn号：<span style="font-size: 24px">{{
            diskInfo.diskSn[this.diskId]
          }}</span></el-col
        >
      </el-row> -->
      <el-row :gutter="10">
        <el-col :span="24"
          ><div class="grid-content ep-bg-purple" />
          容量：<span style="font-size: 24px"
            >{{ diskInfo.diskCapacity[this.diskId] }}TB</span
          ></el-col
        >
      </el-row>
      <!-- <el-col :span="20">
        <div class="grid-content ep-bg-purple" />
        状态：<span style="font-size: 24px">
          <el-tag size="large">
            {{
              this.TranInfo(diskInfo.state[this.diskId])
            }}
          </el-tag>
        </span>
      </el-col> -->
      <el-row :gutter="10" 
        v-if="diskInfo.type[this.diskId] === 1"
        style="margin: 5px 0px 5px 5px;background-color: #faecd8;"
      >
        <el-table
          :data="this.diskInfo.Child[this.diskId]"

          height="200"
          :header-cell-style="{background: '#d9ecff',height: '50px', color: 'black'}" 
          border
        >
          <el-table-column prop="cacheName" label="cache名称"></el-table-column>
          <el-table-column prop="diskId" label="diskId"></el-table-column>
          <el-table-column prop="diskSn" label="Sn号"></el-table-column>
          <el-table-column label="状态">
            <template #default="st">
              <el-tag size="large" :class="st.row.state === 'VDISK_STATE_UP' ? 'blue-tag':'red-tag' ">
                {{ this.TranInfo(st.row.state) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
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
      nodeId: -1,
      // nodeDisk的监听
      wsNodeDisk: null,
      dkData: [], // 6-22，临时数据
      diskId: 0, // 页面选中的diskId

      // 2-20 修改数据
      // echarts实时数据
      diskIORatio: [],
      diskIORatioLength: 0, // （虚拟磁盘个数）IO速率的磁盘个数
      // 页面展示数据
      diskInfo: {
        diskShowName: [], // el-option 遍历
        diskId: [],
        diskName: [],
        // diskSn: [],
        diskCapacity: [],
        // state: [],
        diskType: [],
        type: [],
        Child: [], // 子菜单
        // echarts 数据
        diskIORatio: []
      },
      // 当前页面磁盘名称
      nowDiskName: "",
      diskInfoLength: 0, // （实际磁盘个数）页面展示磁盘信息个数
      // echarts图表
      echartsInstance: null,
      // echarts图表数据
      diskChartData: {
        name: null,
        readRatio: [],
        writeRatio: [],
        diskNowTime: []
      },
      // echarts图表宽度
      chartOffsetWidth: null,
      // 下拉菜单
      formInline: {
        user: "",
        region: "",
      },
      timeId: null
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
  beforeUnmount() {
    if(this.wsNodeDisk != null)
    {
      this.wsNodeDisk.close(1000,'前端wsNodeDisk主动关闭');
    }
    window.clearTimeout(this.timeId)
  },
  unmounted() {
    // 销毁长连接
    // if(this.wsNodeDisk.readyState === WebSocket.OPEN){
    // }
    
    // 销毁时，取消监听
    window.removeEventListener("resize", this.screenAdapter);
  },
  expose: ['destroydiskWS'],
  methods: {
    // 解释状态
    TranInfo(ss) {
      if(ss === 'VDISK_STATE_UP'){
        return "UP，可服务IO"
      }else if(ss === 'VDISK_STATE_DOWN'){
        return "DOWN，不可服务IO"
      }
    },
    destroydiskWS() {
      // console.log("调用了disk")
      if(this.wsNodeDisk != null)
      {
        this.wsNodeDisk.close(1000,'前端wsNodeDisk主动关闭');
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
      if(this.wsNodeDisk != null && this.wsNodeDisk.readyState === 1 && this.store.state.nowNodeId != null && this.store.state.nowNodeId != undefined) {
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
      //链接建立失败重连
      window.clearTimeout(this.timeId)
      this.timeId = setTimeout(()=>{
        this.initNodeDisk();
      },1000)
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
        // 接收数据
        let tpdata = JSON.parse(JSON.stringify(sendData.params['diskInfoMap']));
        this.dkData = []
        let i = 0
        for(let key in tpdata)
        {
          this.dkData.push({
            name: key,
            diskId: i,
            type: (key[0] == 's' ? 0:1),// 0:sda,1:nvme
            diskBasicInfo: tpdata[key]['diskBasicInfo'],
            diskIORatio: tpdata[key]['diskIORatio']
          })
          i += 1
        }
        // console.log("处理数组数据：",this.dkData)
        // 6-22 修改数据
        this.diskInfoLength = this.dkData.length;
        for (let i = 0; i < this.dkData.length; i++) {
          // 初始化
          if (i === 0) {
            this.diskInfo.diskShowName = [];
            this.diskInfo.diskId = [];
            this.diskInfo.diskName = [];
            this.diskInfo.diskCapacity = [];
            this.diskInfo.diskType = [];
            this.diskInfo.Child = [];
            this.diskInfo.type = [];
            this.diskInfo.diskIORatio = [];
          }
          // 页面显示数据
          this.diskInfo.diskShowName.push((this.dkData[i].type === 1?'缓存盘':'数据盘') + this.dkData[i].name)
          this.diskInfo.diskId.push(this.dkData[i].diskId);
          this.diskInfo.diskName.push(this.dkData[i].diskBasicInfo.name);
          this.diskInfo.diskCapacity.push(
            this.dkData[i].diskBasicInfo.diskCapacity.toFixed(2)
          );
          this.diskInfo.diskType.push(this.dkData[i].diskBasicInfo.diskType);
          this.diskInfo.type.push(this.dkData[i].type)
          if(this.dkData[i].type === 1) {
            this.diskInfo.Child.push(
              JSON.parse(JSON.stringify(this.dkData[i].diskBasicInfo.cacheInfolist)) // 子菜单
            )
          } else {
            this.diskInfo.Child.push([]) 
          }
          // echarts显示数据
          this.diskInfo.diskIORatio.push({
            name: this.dkData[i].diskIORatio.name,
            readRatio: this.dkData[i].diskIORatio.readRatioArr,
            writeRatio: this.dkData[i].diskIORatio.writeRatioArr,
            diskNowTime: this.dkData[i].diskIORatio.diskNowTimeArr
          })
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
      // (1) 先销毁实例
      this.wsNodeDisk = null
      if(ret.code === 1006)
      {
        if(this.nodeId === this.store.state.nowNodeId)
        {
          ElMessage({
            message: '网络连接断开，Disk信息获取失败',
            type: 'warning',
          })
        }
      }
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
        this.nodeId = this.store.state.nowNodeId
      }
      let chartDom = document.getElementById("diskCharts");
      this.echartsInstance = markRaw(this.$echarts.init(chartDom));
      let option = {
        title: {
          text: nodeDiskTitle,
          left: 20,
        },
        grid: {
          x: 70,
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
      // 更新名称
      this.diskChartData.name = this.diskInfo.diskShowName[this.diskId]
      // 覆盖数组
      this.diskChartData.readRatio = this.toFix2(this.diskInfo.diskIORatio[ this.diskId ].readRatio);
      this.diskChartData.writeRatio = this.toFix2(this.diskInfo.diskIORatio[ this.diskId ].writeRatio);
      this.diskChartData.time = this.diskInfo.diskIORatio[ this.diskId ].diskNowTime;
      this.updateChart();
    },
    // 更新图表界面
    updateChart() {
      let nodeDiskTitle = "ERROR";
      if (this.store.state.nowNodeId != null) {
        nodeDiskTitle =
          "Node" +
          this.store.state.nowNodeId.toString() +
          "的" + this.diskChartData.name + 
          "读写速率";
        this.nodeId = this.store.state.nowNodeId
      }
      let seriesList = [];
      let legendData = [];
      let name = this.diskChartData.name;
      let readRatio = this.diskChartData.readRatio;
      let writeRatio = this.diskChartData.writeRatio;
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
      // 时间数据
      let time = this.diskChartData.time;
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
      this.getChartData();
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

.red-tag {
  color: #f56c6c;
  background-color: #fde2e2;
}

.blue-tag {
  color: #409eff;
  background-color: #ecf5ff;
}
</style>