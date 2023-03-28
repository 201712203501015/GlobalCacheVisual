<template>
  <div class="com-container">
    <div class="com-select">
      <el-row>
        <!-- 面包屑：记录导航，用于跳转 -->
        <!-- 历史状态：
          nowMessage，当前是请求谁？
          pgNodeId，当前是
          pgDiskId
         -->
        <el-col :span="5" style="width: 40px;display: flex;align-items: center;">
          <el-breadcrumb separator=">">
            <el-breadcrumb-item @click="getNewData()">
              <span class="bread-style">
                <b>PG总览</b>
              </span>
            </el-breadcrumb-item>
            <el-breadcrumb-item
              @click="changeNode(this.pgNodeIds)"
              v-if="
                this.nowMessage === 'getPgNode' ||
                this.nowMessage === 'getPgNodeDisk'
              "
            >
              <span class="bread-style">
                <b>Node{{ this.pgNodeIds }}</b>
              </span>
            </el-breadcrumb-item>
            <el-breadcrumb-item
              @click="changeDisk(this.pgDiskIds)"
              v-if="this.nowMessage === 'getPgNodeDisk'"
            >
              <span class="bread-style">
                <b>Disk{{ this.pgDiskIds }}</b>
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
              <el-select
                v-model="pgNodeIds"
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
                v-if="pgNodeIds != null"
                effect="dark"
                content="查看Node具体信息"
                placement="top-start"
              >
                <el-button type="primary" @click="goto('nodeRightSide')"
                  >Node{{ pgNodeIds }}</el-button
                >
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
                v-model="pgDiskIds"
                placeholder="请选择disk编号"
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
      el-table 只绑定pgIdList，其他数据用pgList来渲染
      @expand-change="expendChange"
     -->
      <el-table
        v-loading="loading"
        :data="pgIdList" style="width: 100%;height: 90%;"
        :header-cell-style="{background: '#ecf5ff',height: '50px', color: 'black','border': '1px solid #a0c3f6'}"
        :row-style="isNowRow"
        border
        lazy
      >
        <!-- 名称列 -->
        <el-table-column label="PG的Id">
          <template #default="props"> 
            <div style="color: black">
              PG{{ this.pgList[props.row.id].pgId }} 
            </div>
          </template>
        </el-table-column>
        <!-- (nodeId,diskId) -->
        <el-table-column label="PG索引 (nodeId,diskId)">
          <template #default="props">
            <div style="color: black">
              ( {{ this.pgList[props.row.id].masterNode }} ,
            {{ this.pgList[props.row.id].masterDisk }} )
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
                    this.pgList[props.row.id].state != 'PG_STATE_NORMAL',
                }"
              >
                {{
                  this.pgList[props.row.id].state != "PG_STATE_NORMAL"
                    ? "异常"
                    : "正常"
                }}
              </div>
            </el-tag>
          </template>
        </el-table-column>

        <!-- 具体信息列 -->
        <el-table-column type="expand">
          <template #default="props">
            <!-- 表格展示 -->
            <div style="margin: 5px 25px 5px 25px;background-color: #faecd8;">
              <div style="font-size: 20px;color: #337ecc;">
                  <el-icon><Odometer /> </el-icon> PG{{ this.pgList[props.row.id].pgId }}的基本信息
              </div>
              <el-table :data="[this.pgList[props.row.id]]" 
                  style="width: 100%;"
                  :header-cell-style="{background: '#d9ecff',height: '50px', color: 'black'}" 
                border
              >
                <!-- ptId表示 -->
                <el-table-column label="PG的Id">
                  <template #default="ps"> {{ ps.row.pgId }} </template>
                </el-table-column>
                <el-table-column label="PG版本号">
                  <template #default="ps"> {{ ps.row.bv }} </template>
                </el-table-column>
                <el-table-column label="PG状态">
                  <template #default="ps">
                    <el-tag size="large">
                      <span
                        class="box-normal"
                        :class="{
                          'box-unnormal':
                            this.pgList[props.row.id].state != 'PG_STATE_NORMAL',
                        }"
                      >
                        {{ this.showPGStateInfo(this.pgList[props.row.id].state) }}
                      </span>
                    </el-tag>
                    
                  </template>
                </el-table-column>
                <el-table-column label="本主节点">
                  <template #default="ps">
                    {{ this.pgList[props.row.id].masterNode }}
                  </template>
                </el-table-column>
                <el-table-column label="主本磁盘">
                  <template #default="ps">
                    {{ this.pgList[props.row.id].masterDisk }}
                  </template>
                </el-table-column>
                <el-table-column label="副本数">
                  <template #default="ps">
                    {{ this.pgList[props.row.id].copyNum }}
                  </template>
                </el-table-column>
              </el-table>
              <div style="font-size: 20px;color: #337ecc;">
                <el-icon><Odometer /> </el-icon> PG{{ this.pgList[props.row.id].pgId }}的副本信息
              </div>
              <el-table
                :data="this.pgList[props.row.id].copyInfos"
                style="width: 100%;"
                :header-cell-style="{background: '#d9ecff',height: '50px', color: 'black'}" 
                border
              >
                <el-table-column prop="nodeId" label="nodeId" />
                <el-table-column prop="diskId" label="diskId" />
                <el-table-column label="副本状态" >
                  <template #default="pgs">
                    <el-tag size="large">
                      {{ this.showPGCOPYStateInfo(pgs.row.copyState) }}
                    </el-tag>
                  </template>
                </el-table-column>
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
import { ElMessageBox  } from 'element-plus'
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
      // webSocket 监听
      wsPgList: null,
      // 监听是否可以send数据
      isReady: false,
      // 检测当前传输哪种数据
      nowMessage: "getPgAll",
      // 存放所有数据
      nodeListAll: [],
      pgListAll: [],
      // nodeList
      nodeList: [],
      nodeIdList: [],
      // nodeListOption: [], //用于接收nodeList的选项
      // diskList
      diskList: [],
      diskIdList: [],
      // pgList
      pgList: [],
      pgIdList: [],
      // 页面展示信息+实际编号
      pgNodeId: null,
      pgNodeIds: null,// 界面显示
      pgDiskId: null,
      pgDiskIds: null, // 界面显示
      // 
      isDisableDisk: true,// 禁用Disk
      // 选中的行
      selectedRow: [],
      loading: true,
      // 定时器
      timId: null,
    }
  },
  created() {
    // 显示左侧视图
    this.store.commit("changeView", "logicView");
    // 修改左侧栏
    this.store.commit("changeLogicId", 1);
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
      // 找到val所对应的nodeList下标
      for(let i=0;i<this.nodeList.length;i++){
        if(val === this.nodeList[i].nodeId){
          this.pgNodeId = i // 下标更新
          break;
        }
      }
      this.pgNodeIds = val;
      // 1 过滤数据；
      this.nowMessage = "getPgNode"
      this.updateWeb()
      // 2 disk解除禁用
      // 更改数据
      this.isDisableDisk = false;
      // 清空disk
      this.pgDiskIds = null;
      this.pgDiskIds = null;
      // 返回当前id
      return val;
    },
    // 选择不同的disk
    changeDisk(val) {
      // 更改当前选项
      for(let i=0;i<this.diskList.length;i++){
        if(val === this.diskList[i].diskId){
          this.pgDiskId = i;
          break;
        }
      }
      this.pgDiskIds = val;
      // 1 过滤数据
      this.nowMessage = "getPgNodeDisk"
      this.updateWeb();
      return val;
    },
    // 跳转到Node
    goto(path) {
      this.$router.push({
        name: path,
        query: {
          nodeId: this.pgNodeIds,
        },
      });
    },
    // 修改行样式
    isNowRow({row}) {
      return {
        'background-color': 'rgb(211, 219, 229)'
      }
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
    // 返回PT状态，页面展示
    showPGStateInfo(ss) {
      if(ss === 'PG_STATE_NORMAL') {
        return '正常状态'
      }else if(ss === 'PG_STATE_DOWN'){
        return '切主状态'
      }else if(ss === 'PG_STATE_DEGRADE_LOSS1') {
        return '降级状态，丢失一个副本'
      }else if(ss === 'PG_STATE_DEGRADE_LOSS2') {
        return '降级状态，丢失两个副本'
      }else if(ss === 'PG_STATE_RECOVERY') {
        return '恢复状态'
      }else if(ss === 'PG_STATE_FAULT') {
        return '故障状态'
      }
    },
    // 返回PG副本，页面展示
    showPGCOPYStateInfo(ss) {
      if(ss === 'PG_COPY_STATE_RUNNING') {
        return '运行状态'
      }else if(ss === 'PG_COPY_STATE_DOWN') {
        return 'DOWN状态'
      }else if(ss === 'PG_COPY_STATE_OUT') {
        return 'OUT状态'
      }else if(ss === 'PG_COPY_STATE_RECOVERY') {
        return '恢复状态'
      }
      return "ERROR"
    },
    // 刷新数据
    getNewData() {
      this.loading = true
      API({
        url: '/getPgAll',
        method: 'post',
        data: {
          token: this.store.state.userToken,
        }
      }).then((res) => { // 请求成功后的操作，可以跳转
        let recvdata = res.data.data;
        // 1 刷新页面到getPtAll
        this.nowMessage = "getPgAll"
        // 2 更新总体信息
        this.nodeListAll = recvdata.nodeList
        this.pgListAll = recvdata.pgList
        // 3 更新页面数据
        this.updateWeb()
        // 4 从Node视图跳转过来
        this.pgNodeId = null
        this.pgNodeIds = null
        this.isDisableDisk = true // 禁用disk
        if (this.$route.query.nodeId){
          // 更改nodeId
          this.pgNodeIds = parseInt(this.$route.query.nodeId);
          // 改变节点
          this.changeNode(this.pgNodeIds);
          this.$route.query.nodeId = null
        }
        // 5 不显示Node、禁用disk
        this.pgDiskId = null
        this.pgDiskIds = null
        // 6 不转圈圈
        this.loading = false
      }).catch(err => {
        // 输出错误信息
        // console.log(err.message)
        ElMessageBox.alert('请求失败', '警告', {
          confirmButtonText: 'OK'
        })
        // 5 不转圈圈
        this.loading = false
      })
    },
    // 根据当前选项，更新页面信息
    updateWeb(){
      if(this.nowMessage === "getPgAll"){ // 更新pg、node
        // 更新pg列表、node列表
        // 1 pgList
        this.pgList = JSON.parse(JSON.stringify(this.pgListAll))
        // 2 pgIdList
        if(this.pgList.length != this.pgIdList.length) {
          this.pgIdList = []
          for(let i=0;i<this.pgList.length;i++){
            this.pgIdList.push({
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
      }else if(this.nowMessage === "getPgNode"){ // 更新pg、disk
        let nodeId = this.pgNodeId
        // console.log('nodeId = ',this.pgNodeId)
        // 1 pgList 手机当前nodeId下的所有pg信息
        this.pgList = []
        let tpdiskList = this.nodeListAll[nodeId].diskList
        for(let j=0;j<tpdiskList.length;j++){ // nodeId 中的diskList
          let tppgList = tpdiskList[j].pgList
          for(let k=0;k<tppgList.length;k++){ // diskList 中的 pgList
            this.pgList.push(tppgList[k])
          }
        }
        // 2 pgIdList
        if(this.pgList.length != this.pgIdList.length) {
          this.pgIdList = []
          for(let i=0;i<this.pgList.length;i++){
            this.pgIdList.push({
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
      }else if(this.nowMessage === "getPgNodeDisk"){ // 更新pg
        let nodeId = this.pgNodeId
        let diskId = this.pgDiskId
        // 1 更新pgList
        this.pgList = []
        let tp = this.nodeListAll[nodeId].diskList[diskId].pgList
        for(let i=0;i<tp.length;i++){
          this.pgList.push(tp[i])
        }
        // 2 pgIdList
        if(this.pgIdList.length != this.pgList.length){
          this.pgIdList = []
          for(let i=0;i<this.pgList.length;i++){
            this.pgIdList.push({
              id:i
            })
          }
        }
      }
    },

  },
  // watch: {
  //   isReady: function (newValue, oldValue) {
  //     // 变为true
  //     if (newValue === true) {
  //       // 有参数
  //       if (this.$route.query.nodeId) {
  //         // 更改
  //         this.pgNodeId = this.$route.query.nodeId;
  //         this.changeNode(this.pgNodeId);
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

.bread-style{
  cursor:pointer;
}

.com-show {
  height: 90%;
  /* border:2px solid black;  */
  margin: 10px;
}
/* PG正常状态 */
.box-normal {
  height: 90%;
  margin: auto;
  font-weight: bold;
  color: #2321c2;
}
/* PG异常状态 */
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