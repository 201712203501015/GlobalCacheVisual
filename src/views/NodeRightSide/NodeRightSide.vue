<template>
    <div class="com-container">
      <div class="com-top">
          <!-- 这里的nodeList.nodeId 包括{nodeId: 'node1', isSelect: false} -->
        <el-table
          v-loading="loading"
          :data="nodeList.nodeId"
          @cell-click="clickNode"
          :cell-style="cellColor"
          style="width: 100%; height: 100%;"
        >
          <el-table-column
              v-for="(item,index) in columns"
              
          >
            <template #header>
                <span style="display:none;">{{ item.key }} 你就别显示了</span>
            </template>
            <template #default="props">
                <div class="cell-com">
                    <div class="dot-box">
                        <div
                          :class="this.nodeList.nodeIsc[ props.row[item.key].nodeIdNum ] === true?'dot-normal':'dot-abnormal'"
                        ></div>
                    </div>
                    <div class="dot-text">
                      <div v-if="this.nodeList.nodeIsOnline[ props.row[item.key].nodeIdNum ] === true">
                        {{ props.row[item.key].nodeId }}
                        <br />
                        <!-- 3-27 不乘以100 -->
                        {{ this.nodeList.nodeValue[ props.row[item.key].nodeIdNum ] }}%
                      </div>
                      <div v-if="this.nodeList.nodeIsOnline[ props.row[item.key].nodeIdNum ] === false">
                        {{ props.row[item.key].nodeId }}
                        <br />
                        Node离线
                      </div>
                    </div>
                </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="com-bottom">
          <!-- :key作用： 给vue 元素渲染的时候用的，每次渲染的时候会去拿这个key 值做对比，
          如果这一次的key 值和上一次的key值是不一样的才会重新渲染dom 元素，否则保持上一次的元素状态 :key="this.store.state.nowNodeId" -->
          <Cpu ref="cpu" v-if="nodeCpu" :key="nowF"></Cpu>
          <Disk ref="disk" v-if="nodeDisk" :key="nowF"></Disk>
          <Memory ref="memory" v-if="nodeMemory" :key="nowF"></Memory>
          <Net ref="net" v-if="nodeNet" :key="nowF"></Net>
          <Ptpg ref="ptpg" v-if="nodePtpg" :key="nowF"></Ptpg>
          <Health ref="health" v-if="nodeHealth" :key="nowF"></Health>
          <div
            v-if="this.store.state.nodeIsOnline === false"
            style="border-radius: 10px;"
            class="offline"
          >
            <span style="font-weight: bold;">
              {{ this.nowNodeName }}处于离线状态
            </span>
          </div>
      </div>
    </div>
  </template>
  
  <script>
  import { useStore } from 'vuex'
  import { defineAsyncComponent,nextTick } from "vue"
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
        // WebSocket 监听
        // wsNodeList nodeList的监听
        wsNodeList: null,
        // 是否可以send数据
        isReady: false,
        // com-top：列数据
        columns : [
            {
                "key": "column0"
            },
            {
                "key": "column1"
            },
            {
                "key": "column2"
            },
            {
                "key": "column3"
            },
            {
                "key": "column4"
            },
            {
                "key": "column5"
            },
            {
                "key": "column6"
            },
            {
                "key": "column7"
            },
            {
                "key": "column8"
            },
            {
                "key": "column9"
            }
        ],
        // com-top：nodeList
        nodeList: {
          nodeId: null,// 表格信息
          nodeValue: null, // 颜色信息
          nodeIsIn: null,
          nodeIsRunning: null,
          nodeIsOnline: null,
          nodeIsc: null
        },
        // 当前被标记的节点
        nowNode: null,
        nowNodeName: null,
        // 底部左侧数据 
        bottomLeft: null,
        // 底部右侧数据
        bottomRight: null,
        loading: true,
      }
    },
    created () {
      // 清空所有Node信息
      // 显示左侧视图
      this.store.commit('changeView', 'nodeView')
      // 更新vuex中newNodeId
      this.store.commit('changeNodeId', null)
      // 更新vuex中newNodeType
      this.store.commit('changeNodeType', null)
      // 更新vuex中newNodeHealth
      this.store.commit('changeNodeIsIn',null)
      this.store.commit('changeNodeIsRunning',null)
      this.store.commit('changeNodeIsOnline',null)
      // 开启长连接
      this.initNodeList()
    },
    mounted () {
      // 发送数据
      
      // this.$socket.send({
      //     action: 'getDiskCalender',
      //     socketType: 'getDiskCalender',
      //     chartName: '让我测试'
      // })
      // 监听
      // this.$socket.registerCallBack('getDiskCalender', this.getData)
      // 获取nodeList信息
      // this.getDiskList()
    },
    beforeUnmount () {
      // console.log("nodeRightSide berdestory")
      // 销毁所有子组件
      if(this.nodeCpu === true) this.$refs.cpu.destroycpuWS();
      if(this.nodeDisk === true) this.$refs.disk.destroydiskWS();
      if(this.nodeMemory === true) this.$refs.memory.destroymemoryWS();
      if(this.nodeNet === true) this.$refs.net.destroynetWS();
    },
    unmounted () {
      if(this.wsNodeList) this.wsNodeList.close(1000,"wsNodeList主动断开连接")
    },
    methods: {
      // 
      getNodeList(ret) {
          let tp = []
          let tp_col = []
          let tp_isIn = []
          let tp_isRunning = []
          let tp_isOnline = []
          let tp_isc = []
          let DiskLen = Math.ceil(ret.length / 10) * 10
          for(let i = 0,row_id = 0;i<DiskLen;i += 10,row_id += 1) {
              // 10行一对象
              let tp_item = {}
              for(let j=i;j<i+10;j++){
                  tp_item['id'] = row_id
                  if(j<ret.length){
                      tp_item[ this.columns[j-i]["key"] ] = {
                          nodeId: "Node" + ret[j]['nodeId'].toString(), // 记录nodeId
                          isSelect: false, // 记录是否使用过了
                          nodeIdNum: ret[j]['nodeId'] // nodeId的num形式，用于定位
                      }
                      tp_col[j] = (ret[j]['isOnline'] === true ? ret[j]['nodeValue'].toFixed(2) : 1000) // 有颜色，保留两位小数,1000是挂掉的状态
                      tp_isIn[j] = ret[j]['isIn']
                      tp_isRunning[j] = ret[j]['isRunning']
                      tp_isOnline[j] = ret[j]['isOnline']
                      tp_isc[j] = true
                      if(tp_isOnline[j] === false || tp_isRunning[j] != 'NODE_STATE_RUNNING' || tp_isIn[j] != 'NODE_STATE_IN') 
                      {
                        tp_isc[j] = false
                      }
                  }else{
                      tp_item[ this.columns[j-i]["key"] ] = {
                          nodeId: "null",
                          isSelect: false,
                          nodeIdNum: -1 // nodeId的num形式，用于定位
                      }
                      tp_col[j] = -1 // 非法
                      tp_isIn[j] = 'invalid'// 非法状态
                      tp_isRunning[j] = 'invalid'
                      tp_isOnline[j] = false
                      tp_isc[j] = false
                  }
              }
              tp.push(tp_item)
          }
          // 更新表格数据
          if(this.nodeList.nodeId === null) {
              // 第一次才更新表格选中状态
              this.nodeList.nodeId = tp
          }
          // console.log("node列表",tp)
          // 更新频率
          this.nodeList.nodeValue = tp_col
          // 更新状态
          this.nodeList.nodeIsIn = tp_isIn
          this.nodeList.nodeIsRunning = tp_isRunning
          this.nodeList.nodeIsOnline = tp_isOnline
          this.nodeList.nodeIsc = tp_isc
          // 解除转圈圈
          if(this.loading === true)
          {
            this.loading = false // 第一次就变为false
            this.clickNode({id:0}, {no:0}) // 点击0点
          }
          // 如果当前节点状态 和 之前节点状态不一致，要重新点击
          if(this.nodeList.nodeIsOnline[this.nowNode] != this.store.state.nodeIsOnline) {
            let lr = Math.floor(this.nowNode / 10)
            let lc = this.nowNode % 10
            this.clickNode({id:lr}, {no:lc})
          }
      },
      
      // 点击单元格事件，改为pink粉色，表示选中
      clickNode(row, column) {
          let id = row.id * 10 + column.no
          // 判断id范围越界
          if(id < 0 || id >= this.nodeList.nodeValue.length) {
            return ;
          }
          // 判断非法id, 状态是-1，不进行任何操作
          if(this.nodeList.nodeValue[id] === -1) {
            return ;
          }
          // 重复点击
          if(id === this.nowNode && this.store.state.nodeIsOnline === this.nodeList.nodeIsOnline[id]) {
            // console.log('重复点击')
            return ;
          }
  
          let lastNode = this.nowNode // 上一个节点
          let colName = "column" + column.no.toString()
          let idNum = this.nodeList.nodeId[row.id][colName].nodeIdNum // nodeId的实际编号
          // 更新当前节点
          this.nowNode = id
          // 变为选中节点
          this.nodeList.nodeId[row.id][colName].isSelect = true
          // 改变当前节点名称
          this.nowNodeName = this.nodeList.nodeId[row.id][colName].nodeId
          if(this.nodeList.nodeIsOnline[id] === false)
          {
            // 更新vuex中newNodeId,显示Node左侧栏
            this.store.commit('changeNodeId', idNum)
            this.store.commit('changeNodeType', null)
            this.store.commit('changeNodeIsIn',this.nodeList.nodeIsIn[id])
            this.store.commit('changeNodeIsRunning',this.nodeList.nodeIsRunning[id])
            this.store.commit('changeNodeIsOnline',this.nodeList.nodeIsOnline[id])
          }
          else
          {
            // 更新vuex中newNodeId,显示Node左侧栏
            this.store.commit('changeNodeId', idNum)
            // 更新vuex中newNodeType
            if(this.store.state.nowNodeType == null) {
                this.store.commit('changeNodeType', 'cpu')
            }
            // 更新vuex中newNodeHealth
            this.store.commit('changeNodeIsIn',this.nodeList.nodeIsIn[id])
            this.store.commit('changeNodeIsRunning',this.nodeList.nodeIsRunning[id])
            this.store.commit('changeNodeIsOnline',this.nodeList.nodeIsOnline[id])
            // 更新vuex中nowHealthState
            this.store.commit('changeHealthState', this.nodeList.nodeValue[id])  
          }
          // 还原原来节点
          if(lastNode != null) {
              let lastRow = Math.floor(lastNode / 10)
              let lastCol = lastNode % 10
              let colName1 = "column" + lastCol.toString()
              this.nodeList.nodeId[lastRow][colName1].isSelect = false
          }
      },
      // 给单元格添加颜色
      cellColor ({ rowIndex, columnIndex }) {
          let id = rowIndex * 10 + columnIndex // 编号
          let colName = "column" + columnIndex.toString()
          let colVal = this.nodeList.nodeValue[id] // 频率
          let isIn = this.nodeList.nodeIsIn[id]
          let isRunning = this.nodeList.nodeIsRunning[id]
          let isOnline = this.nodeList.nodeIsOnline[id]
          // console.log('当前行 = ',this.nodeList.nodeId[rowIndex][colName].nodeId,isOnline)
          let isNodeSelect = this.nodeList.nodeId[rowIndex][colName].isSelect // 是否被选中
          // 为空，永远不会被选中
          if(colVal === -1){
              return {
                  display: 'none'
                  // color: 'white',
                  // 'background-color': 'gray',
                  // 'font-size': '10px'
              }
          }
          let cellDom = {
            'border-left': '1px solid white',
            'border-right': '1px solid white',
            'box-shadow': '5px 5px 5px 5px #C0C0C0',
            'border-radius': '5px',
            'color': 'white',
            'font-size': '10px',
            // border-left:1px solid,
            // border-right:1px solid,
          }
          if(isNodeSelect === true) {
            // 被选中的节点，变为粉色
            cellDom['background-color'] = 'pink'
          }else{
            if(this.nodeList.nodeIsOnline[id] === false) {
              // 节点离线，变为灰色
              cellDom['background-color'] = 'gray'
            }else{
              // 正常状态
              if(0 <= colVal && colVal < 25) {
                  cellDom['background-color'] = '#B4CDEF'
              }else if(25 <= colVal && colVal < 50) {
                  cellDom['background-color'] = '#98BAFE'
              }else if(50 <= colVal && colVal < 75) {
                  cellDom['background-color'] = '#5F94FD'
              }else if(75 <= colVal && colVal < 100) {
                  cellDom['background-color'] = '#023EB6'
              }
            }
          }
          
          return cellDom
      },
  
      // wsNodeList 初始化
      initNodeList () {
          this.wsNodeList = new WebSocket("ws://"+IP+WEBSOCKET_PORT);
          this.wsNodeList.onopen = this.websocketonopen
          this.wsNodeList.onerror = this.websocketonerror
          this.wsNodeList.onmessage = this.websocketonmessage
          this.wsNodeList.onclose = this.websocketclose
      },
      websocketonopen() { // 连接成功
        //   console.log("NodeList WebSocket连接成功")
          // 连接成功后直接发送数据
          if(this.wsNodeList.readyState === 1) {
            this.wsNodeList.send(JSON.stringify({
              url: '/getCpuCalender',
              params: {
                token: this.store.state.userToken
              }
            }))
          }
      },
      websocketonerror() { // 连接失败
        ElMessage({
          message: '网络连接异常，CPU列表获取失败，开始重连',
          type: 'warning',
        })
        this.initNodeList()
      },
      websocketonmessage(ret) { // 数据接收
          // 接收到的类似send的数据，其中sendData.data 是要接受的数据
          let sendData = JSON.parse(ret.data)
          // 根据发送过来的url采取不同的措施
          if (sendData.url === 'getCpuCalender' && sendData.token === this.store.state.userToken) {
              // 接收数据
              this.getNodeList(sendData.params)
              // this.getNodeList(obj.params)
          }
          // 可以发送数据了
          this.isReady = true
      },
      websocketclose(ret) { // 关闭
        //   console.log('wsNodeList连接关闭 (' + ret.code + '),reason = ',ret.reason)
      }
    },
    components: {
      Cpu: defineAsyncComponent(() => import("@/components/Cpu/Cpu.vue")),
      Disk: defineAsyncComponent(() => import("@/components/Disk/Disk.vue")),
      Memory: defineAsyncComponent(() => import("@/components/Memory/Memory.vue")),
      Net: defineAsyncComponent(() => import("@/components/Net/Net.vue")),
      Ptpg: defineAsyncComponent(() => import("@/components/Ptpg/Ptpg.vue")),
      Health: defineAsyncComponent(() => import("@/components/Health/Health.vue"))
    },
    computed: {
      // bottom中是否显示cpu组件
      nodeCpu(){
          if(this.store.state.nowNodeType === 'cpu' && this.store.state.nodeIsOnline === true) {
              return true
          }
          return false
      },
      nodeDisk(){
          if(this.store.state.nowNodeType === 'disk' && this.store.state.nodeIsOnline === true) {
              return true
          }
          return false
      },
      nodeMemory(){
          if(this.store.state.nowNodeType === 'memory' && this.store.state.nodeIsOnline === true) {
              return true
          }
          return false
      },
      nodeNet(){
          if(this.store.state.nowNodeType === 'net' && this.store.state.nodeIsOnline === true) {
              return true
          }
          return false
      },
      nodePtpg(){
          if(this.store.state.nowNodeType === 'ptpg' && this.store.state.nodeIsOnline === true) {
              return true
          }
          return false
      },
      nodeHealth(){
          if(this.store.state.nowNodeType === 'health' && this.store.state.nodeIsOnline === true) {
              return true
          }
          return false
      },
      // 是否刷新页面
      nowF() {
          // let time = new Date()
          // console.log("time = ",time.toString())
          let ss = this.store.state.nowNodeType + this.store.state.nowNodeId
          return ss
      }
    },
    watch: {
      isReady: function(newValue,oldValue) {
          if(newValue === true) {
              // 有参数
              if(this.$route.query.nodeId) {
                  // 触发nodeId事件
                  let index = this.$route.query.nodeId
                  let rowId = {
                      id: Math.floor(index / 10)
                  }
                  let colId = {
                      no: index % 10
                  }
                  this.clickNode(rowId,colId)
              }
          }
      }
    }
  }
  </script>
  
  <style scoped>
  .com-container {
    height: 100%;
    width: 100%;
  }
  .com-top {
    height: 60%;
  }
  
  .com-bottom {
    height: 40%;
  }
  /* 左右区域 */
  .bottom-div {
    height:100%;
    width: 45%;
    /* color: gray; */
  }

  .cell-style {
    border: 5px solid white;
    box-shadow: 10px 10px 10px 10px #888888;
    border-radius: 15px;
    color: white;
    font-size: 10px;
    border-left:1px solid;
    border-right:1px solid;
  }

  .dot-normal {
    /* position: absolute; */
    width: 9px;
    height: 9px;
    border-radius: 100%;
    background: white; /* 正常白色 */
    margin: auto;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .2);
  }
  .dot-abnormal {
    /* position: absolute; */
    width: 9px;
    height: 9px;
    border-radius: 100%;
    background: red; /* 异常红色 */ 
    margin: auto;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .2);
  }
  .dot-text {
    float: left;
    width: calc(100% - 10px);
    margin-left: 5px;
    height: 100%;
    box-sizing: border-box;
  }
  .dot-box {
    width: 10px; 
    float: left;
    height: 100%;
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .cell-com {
    display: flex;
    align-items: center;
  }

  .offline {
    display: flex;
    justify-content: center;
    align-items: center;
    font:25px arial,sans-serif;
    width: 100%;
    height: 100%;
    border: 1px solid #e1e3e7;
    background-color: gray;
    color: black;
  }
  </style>
  