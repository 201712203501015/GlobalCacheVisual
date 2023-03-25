<template>
  <div class="com-container">
    <div class="com-select">
      <el-row>
        <!-- 面包屑：记录导航，用于跳转 -->
        <!-- 历史状态：
          nowMessage，当前是请求谁？
          ptNodeId，当前是
          ptDiskId
        -->
        <el-col :span="5" style="width: 40px;display: flex;align-items: center;">
          <el-breadcrumb separator=">">
            <el-breadcrumb-item @click="getNewData()">
              <span class="bread-style">
                <b>PT总览</b>
              </span>
            </el-breadcrumb-item>
            <el-breadcrumb-item
              @click="changeNode(this.ptNodeIds)"
              v-if="
                this.nowMessage === 'getPtNode' ||
                this.nowMessage === 'getPtNodeDisk'
              "
            >
              <span class="bread-style">
                <b>Node{{ this.ptNodeIds }}</b>
              </span>
            </el-breadcrumb-item>
            <el-breadcrumb-item
              @click="changeDisk(this.ptDiskIds)"
              v-if="this.nowMessage === 'getPtNodeDisk'"
            >
              <span class="bread-style">
                <b>Disk{{ this.ptDiskIds }}</b>
              </span>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </el-col>
        <!-- nodeId选择器 -->
        <el-col :span="9" style="width: 40px;">
          <div class="pb">
            <div class="pb-left">
              Node：
            </div>
            <div class="pb-left">
              <!-- 可选择可填写,Note:change传递的时value值-->
              <el-select
                v-model="ptNodeIds"
                placeholder="请选择Node编号"
                @change="changeNode"
                filterable
              >
                <el-option
                  v-for="(item, index) in nodeIdList"
                  :key="index"
                  :label="this.nodeList[index].nodeId"
                  :value="this.nodeList[index].nodeId"
                />
              </el-select>
              &nbsp;
            </div>
            <div class="pb-left">
              <!-- 返回当前Node按钮 -->
              <el-tooltip
                v-if="ptNodeId != null"
                effect="dark"
                content="查看Node具体信息"
                placement="top-start"
              >
                <el-button type="primary" @click="goto('nodeRightSide')"
                  >Node{{ ptNodeIds }}</el-button>
              </el-tooltip>
            </div>
          </div>
        </el-col>
        <!-- diskId选择器 -->
        <el-col :span="7" style="width: 40px;">
          <div class="pb">
            <div class="pb-left">
              Disk：
            </div>
            <div class="pb-left">
              <el-select
                v-model="ptDiskIds"
                placeholder="请选择Disk编号"
                :disabled="isDisableDisk"
                @change="changeDisk"
              >
                <el-option
                  v-for="(item, index) in diskList"
                  :key="index"
                  :label="this.diskList[index].diskId"
                  :value="this.diskList[index].diskId"
                />
              </el-select>
              &nbsp;
            </div>
          </div>
        </el-col>
        <!-- 刷新按钮 -->
        <el-col :span="3" style="width: 40px;">
          <el-button type="primary" @click="getNewData">刷新数据</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="com-show">
      <!-- 表格 -->
      <!-- 问题：刷新太快，点击后，数据自动被刷新了
      ，解决方法
      el-table 只绑定ptIdList，其他数据用ptList来渲染
      @expand-change="expendChange"
      -->
      <el-table
        v-loading="loading"
        :data="ptIdList" style="width: 100%;height: 90%;"
        :header-cell-style="{background: '#ecf5ff',height: '50px', color: 'black','border': '1px solid #a0c3f6'}"
        :row-style="isNowRow"
        border
        lazy
      >
        <!-- 名称列 -->
        <el-table-column label="PT的Id">
          <template #default="props">
            <div style="color: black">
              PT{{ this.ptList[props.row.id].ptId }} 
            </div>
          </template>
        </el-table-column>
        <!--  -->
        <el-table-column label="PT索引 (nodeId,diskId)">
          <template #default="props"
            >
            <div style="color: black">
              ( {{ this.ptList[props.row.id].ptInfo[0][0] }} ,
              {{ this.ptList[props.row.id].ptInfo[0][1] }} )
            </div>
            
          </template>
        </el-table-column>
        <!-- 状态列 -->
        <el-table-column label="状态">
          <template #default="props">
            <!-- 状态渲染 -->
            <el-tag size="large">
              <div
                class="box-normal"
                :class="{
                  'box-unnormal':
                    this.ptList[props.row.id].state === 'PT_STATE_NOK',
                }"
              >
                {{
                  this.ptList[props.row.id].state === "PT_STATE_NOK"
                    ? "异常"
                    : "正常"
                }}
              </div>
            </el-tag>
            
          </template>
        </el-table-column>

        <!-- 具体信息列 -->
        <el-table-column type="expand">
          <template #default="props" >
            <!-- PT基本信息表格 -->
              <div style="margin: 5px 25px 5px 25px;background-color: #faecd8;">
                <div style="font-size: 20px;color: #337ecc;">
                  <el-icon><Odometer /> </el-icon> PT{{ this.ptList[props.row.id].ptId }}的基本信息
                </div>
                <el-table
                  :data="[this.ptList[props.row.id]]"
                  style="width: 100%;"
                  :header-cell-style="{background: '#d9ecff',height: '50px', color: 'black'}"
                  border
                >
                  <!-- ptId表示 -->
                  <el-table-column label="PT的Id">
                    <template #default="ps"> {{ ps.row.ptId }} </template>
                  </el-table-column>
                  <el-table-column label="PT版本号">
                    <template #default="ps"> {{ ps.row.bv }} </template>
                  </el-table-column>
                  <el-table-column label="PT状态">
                    <template #default="ps">
                      <el-tag size="large">
                        <span
                          class="box-normal"
                          :class="{
                            'box-unnormal':
                              this.ptList[props.row.id].state === 'PT_STATE_NOK',
                          }"
                          >{{ this.showPTStateInfo(ps.row.state) }}
                        </span>
                      </el-tag>
                      
                    </template>
                  </el-table-column>
                  <el-table-column label="映射索引">
                    <template #default="ps">
                      {{ ps.row.indexNode }}
                    </template>
                  </el-table-column>
                  <el-table-column label="映射组[nodeId,diskId,vnodeId]">
                    <template #default="ps">
                      {{ ps.row.ptInfo }}
                    </template>
                  </el-table-column>
                  <el-table-column label="所处节点IP">
                    <template #default="ps">
                      {{ ps.row.nodeIp }}
                    </template>
                  </el-table-column>
                </el-table>
                <div style="font-size: 20px;color: #337ecc;">
                  <el-icon><Odometer /> </el-icon> PT{{ this.ptList[props.row.id].ptId }}的IO信息
                </div>
                <el-table
                  :data="[this.ptList[props.row.id]]"
                  style="width: 100%;"
                  :header-cell-style="{background: '#d9ecff',height: '50px', color: 'black'}"
                  border
                >
                  <!-- <el-table-column label="ioInfo"> -->
                  <el-table-column label="总IP个数">
                    <template #default="props">
                      {{ props.row.ioInfo.ioCount }}
                    </template>
                  </el-table-column>
                  <el-table-column label="读请求个数">
                    <template #default="props">
                      {{ props.row.ioInfo.readCount }}
                    </template>
                  </el-table-column>
                  <el-table-column label="读请求size总和">
                    <template #default="props">
                      {{ props.row.ioInfo.readSize }}
                    </template>
                  </el-table-column>
                  <el-table-column label="写请求个数">
                    <template #default="props">
                      {{ props.row.ioInfo.writeCount }}
                    </template>
                  </el-table-column>
                  <el-table-column label="写请求size总和">
                    <template #default="props">
                      {{ props.row.ioInfo.writeSize }}
                    </template>
                  </el-table-column>
                  <!-- </el-table-column> -->
                </el-table>
              </div>
            
            
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import API from '@/api/ajax.js'; // 引入API
import { ElMessage } from 'element-plus'
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
      // WebSocket 监听
      // PtList监听对象
      wsPtList: null,
      // 判断是否可以send数据
      isReady: false,
      // 监测当前传输那种数据
      nowMessage: "getPtAll",
      // 记录从后台传来的数据
      nodeListAll: [],
      ptListAll: [],
      // nodeList
      nodeList: [],
      nodeIdList: [],
      // diskList
      diskList: [],
      diskIdList: [],
      // ptList
      ptList: [],
      // ptIdList 记录所有pt的Id
      ptIdList: [],
      // 当前nodeId
      ptNodeIds: null, // 展示用
      ptNodeId: null, // 下标
      // 当前diskId
      isDisableDisk: true,
      ptDiskIds: null, // 展示用
      ptDiskId: null, // 下标
      // 当前被选中的行
      selectedRow: [],
      loading: false,
      // 定时器
      timId: null,
    };
  },
  created() {
    // 显示左侧视图
    this.store.commit("changeView", "logicView");
    // 修改左侧栏
    this.store.commit("changeLogicId", 0);
    // 发送数据
    this.getNewData()
  },
  mounted() {
    // 10min更新一次
    this.timId = setInterval(() => {
      this.getNewData()
    },600000)
  },
  unmounted() {
    if(this.timId != null) {
      clearInterval(this.timeId)
    }
  },
  methods: {
    // 选择不同的node
    changeNode(val) {
      // console.log('val = = ',val)
      // 找到val所对应的nodeList下标
      for(let i=0;i<this.nodeList.length;i++){
        if(val === this.nodeList[i].nodeId){
          this.ptNodeId = i // 下标更新
          break;
        }
      }
      this.ptNodeIds = val // 展示更新
      // console.log('ptNodeId = ',this.ptNodeId)
      // 1 过滤数据
      this.nowMessage = "getPtNode";
      this.updateWeb()
      // 2 disk解除禁用
      // 更改数据
      this.isDisableDisk = false;
      // 清空disk
      this.ptDiskId = null;
      this.ptDiskIds = null;
      // 返回当前id
      return val;
    },
    // 选择不同的disk
    changeDisk(val) {
      // 更改当前选项
      for(let i=0;i<this.diskList.length;i++){
        if(val === this.diskList[i].diskId){
          this.ptDiskId = i;
          break;
        }
      }
      this.ptDiskIds = val;
      // 1 过滤数据
      this.nowMessage = "getPtNodeDisk";
      this.updateWeb()
      return val;
    },
    // 跳转到Node
    goto(path) {
      this.$router.push({
        name: path,
        query: {
          nodeId: this.ptNodeIds,
        },
      });
    },
    // 展开行，触发事件
    // expendChange(row, rows) {
    //   // console.log('被点击的行row = ',row,'rows = ',rows)
    //   let tpArr = []
    //   for(let i=0;i<rows.length;i++) {
    //     tpArr.push(rows[i].ptId)
    //   }
    //   this.selectedRow = tpArr
    // },
    isNowRow({row}) {
      return {
        'background-color': 'rgb(211, 219, 229)'
      }
    },
    // 返回PT状态，页面展示
    showPTStateInfo(ss) {
      if(ss === 'PT_STATE_OK') {
        return 'OK状态，可以服务IO'
      }else{
        return 'NOK状态，不能服务IO'
      }
    }, 
    // 刷新数据
    getNewData() {
      this.loading = true
      API({
        url: '/getPtAll',
        method: 'post',
        data: {
          token: this.store.state.userToken,
        }
      }).then((res) => { // 请求成功后的操作，可以跳转
        let recvdata = res.data.data;
        // 1 刷新页面到getPtAll
        this.nowMessage = "getPtAll"
        // 2 更新总体信息
        this.nodeListAll = recvdata.nodeList
        this.ptListAll = recvdata.ptList
        // 3 更新页面数据
        this.updateWeb()
        // 4 从Node视图跳转过来
        this.ptNodeId = null
        this.ptNodeIds = null
        this.isDisableDisk = true // 禁用disk
        if (this.$route.query.nodeId){
          // 更改nodeId
          this.ptNodeIds = parseInt(this.$route.query.nodeId);
          // 改变节点
          this.changeNode(this.ptNodeIds);
          this.$route.query.nodeId = null
        }
        // 5 不显示Node
        this.ptDiskId = null
        this.ptDiskIds = null
        // 6 不转圈圈
        this.loading = false
      }).catch(err => {
        // 输出错误信息
        console.log(err.message)
        // 5 不转圈圈
        this.loading = false
      })
    },
    // 根据当前选项，更新页面信息
    updateWeb(){
      if(this.nowMessage === "getPtAll"){ // 更新pt、node
        // 更新pt列表、node列表
        // 1 ptList
        this.ptList = JSON.parse(JSON.stringify(this.ptListAll))
        // 2 ptIdList
        if(this.ptList.length != this.ptIdList.length) {
          this.ptIdList = []
          for(let i=0;i<this.ptList.length;i++){
            this.ptIdList.push({
              id: i
            })
          }
        }
        // 3 nodeList
        this.nodeList = []
        for(let i=0;i<this.nodeListAll.length;i++) {
          this.nodeList.push({
            nodeId: this.nodeListAll[i].nodeId
          })
        }
        // 4 nodeIdList
        if(this.nodeList.length != this.nodeIdList.length) {
          this.nodeIdList = []
          for(let i=0;i<this.nodeList.length;i++){
            this.nodeIdList.push({
              id: i
            })
          }
        }
      }else if(this.nowMessage === "getPtNode"){ // 更新pt、disk
        let nodeId = this.ptNodeId
        // 1 ptList 手机当前nodeId下的所有pt信息
        this.ptList = []
        let tpdiskList = this.nodeListAll[nodeId].diskList
        for(let j=0;j<tpdiskList.length;j++){ // nodeId 中的diskList
          let tpptList = tpdiskList[j].ptList
          for(let k=0;k<tpptList.length;k++){ // diskList 中的 ptList
            this.ptList.push(tpptList[k])
          }
        }
        // 2 ptIdList
        if(this.ptList.length != this.ptIdList.length) {
          this.ptIdList = []
          for(let i=0;i<this.ptList.length;i++){
            this.ptIdList.push({
              id: i
            })
          }
        }
        // 3 diskList
        this.diskList = []
        tpdiskList = this.nodeListAll[nodeId].diskList
        for(let i=0;i<tpdiskList.length;i++){
          this.diskList.push({
            diskId: tpdiskList[i].diskId
          })
        }
        // 4 diskIdList
        if(this.diskList.length != this.diskIdList.length){
          this.diskIdList = []
          for(let i=0;i<this.diskList.length;i++){
            this.diskIdList.push({
              id:i
            })
          }
        }
      }else if(this.nowMessage === "getPtNodeDisk"){ // 更新pt
        let nodeId = this.ptNodeId
        let diskId = this.ptDiskId
        // 1 更新ptList
        this.ptList = []
        let tp = this.nodeListAll[nodeId].diskList[diskId].ptList
        for(let i=0;i<tp.length;i++){
          this.ptList.push(tp[i])
        }
        // 2 ptIdList
        if(this.ptIdList.length != this.ptList.length){
          this.ptIdList = []
          for(let i=0;i<this.ptList.length;i++){
            this.ptIdList.push({
              id:i
            })
          }
        }
      }
    },
  },
  // watch: {
  //   // 监听变化
  //   isReady: function (newValue, oldValue) {
  //     // 变为true
  //     if (newValue === true) {
  //       // 有参数
  //       if (this.$route.query.nodeId) {
  //         // 更改nodeId
  //         this.ptNodeIds = this.$route.query.nodeId;
  //         // 根据ptNodeIds找到ptNodeId
  //         for(let i=0;i<this.nodeList.length;i++){
  //           if(this.ptNodeIds === this.nodeList[i].nodeId){
  //             this.ptnodeId = i
  //             break;
  //           }
  //         }
  //         // 改变节点
  //         this.changeNode(this.ptNodeId);
  //       }
  //     }
  //   },
  // },
};
</script>

<style scoped>
.com-container {
  width: 100%;
  height: 100%;
}
.com-select {
  height: 10%;
}
/* 面包屑样式 */
.bread-style{
  cursor:pointer;
}
.com-show {
  height: 90%;
  /* border:2px solid black;  */
  margin: 10px;
}
/* PT正常状态 */
.box-normal {
  height: 90%;
  /* width: 10%; */
  margin: auto;
  font-weight: bold;
  color: #2321c2;
  /* background-color: #2321c2; */
}
/* PT异常状态 */
.box-unnormal {
  height: 90%;
  /* width: 10%; */
  margin: auto;
  font-weight: bold;
  color: red;
  /* background-color: red; */
}

/* 左右排列 */
.pb {
  display: flex;
  align-items: center;
}
.pb-left {
  float: left;
  display: flex;
}
 
/**
改变边框颜色
 */
 .el-table--border, .el-table--group {
    border: 2px solid  #a0c3f6!important;
}
/**
改变表格内竖线颜色
 */
.el-table--border  td, .el-table--border th, .el-table__body-wrapper .el-table--border.is-scrolling-left~.el-table__fixed {
    border-right: 1px solid #a0c3f6!important;
}
/**
改变表格内行线颜色
 */
.el-table  td, .el-table th.is-leaf  {
    border-bottom: 1px solid #a0c3f6!important;
}
 
.el-table thead tr th{
    border-color: #a0c3f6;
}
/* g改变表头字体颜色 */
.el-table thead {
    color: black;
}
/* 设置内边框 */
::v-deep .el-table__row > td {
  /* 去除表格线 */
  border: 1px solid #a0c3f6;
}

/* 修改背景颜色 */
.el-table .el-table__row{
  background-color: rgb(211, 219, 229);
}
</style>