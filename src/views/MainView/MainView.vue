<template>
  <el-container style="height: 100%;">
    <!-- 左侧边栏 -->
    <el-aside class="left-side">
      <!-- 固定选择器 -->
      <div class="left-side-select">
        <!-- <el-cascader :options="options" @change="handleChange" /> -->
        <el-select 
          v-model="defaultOption"
          @change="handleChange"
        >
          <el-option
            v-for="(item,index) in options"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <!-- 切换选项 -->
      <div class="left-side-show">
        <!-- 2-19修改 -->
        <!-- node左侧栏 -->
        <el-menu
          v-if="isNode"
          style="border-right: none;"
          :default-active="currentNodeItem.toString()"
          @select="changeNode"
        >
          <el-menu-item
            v-for="(item, index) in nodeTitle"
            :index="index.toString()"
          >
            {{ item }}
          </el-menu-item>
        </el-menu>
        <!-- 逻辑左侧栏 -->
        <el-menu
          v-if="isLogic"
          style="border-right: none;"
          :default-active="currentLogicItem.toString()"
          @select="changeLogic"
        >
          <el-menu-item
            v-for="(item, index) in logicTitle"
            :index="index.toString()"
          >
            {{ item }}
          </el-menu-item>
        </el-menu>
        <!-- 健康监控左侧栏 -->
        <div v-if="isHealth"></div>
      </div>
    </el-aside>
    <!-- 右侧内容栏 -->
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script>
import { useStore } from 'vuex'
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
      // 所选项
      options: [
        {
          value: 'nodeView',
          label: 'Node视图'
        },
        {
          value: 'logicView',
          label: '逻辑视图'
        },
        {
          value: 'healthView',
          label: '健康监控视图'
        }
      ],
      // 视图名称
      defaultOption: '请选择视图',
      // Node左侧标题
      nodeTitle: [
        'CPU','磁盘','内存','网络','PT和PG','健康状态'
      ],
      // Node左侧标题数据
      nodeData: [
        'cpu','disk','memory','net','ptpg','health'
      ],
      // Logic视图 左侧栏
      logicTitle: [
        'PT', 'PG'
      ],
    }
  },
  created() {
    // 页面初始化为 LogicId=0 
    this.store.commit('changeLogicId',0)
    // 改变当前为Node视图视图
    this.store.commit('changeView',null)
    // 监听选项卡变化
    this.$store.watch((state, getters) => {
      return state.nowView
    }, (ret) => {
      // console.log(' ==== 接收到的数据是：',ret)
      if(ret != null) {
        if(ret === 'nodeView') {
          this.defaultOption = 'Node视图'
        }else if(ret === 'logicView') {
          this.defaultOption = '逻辑视图'
        }else if(ret === 'healthView') {
          this.defaultOption = '健康监控视图'
        }
      }else{
        this.defaultOption = '请选择视图'
      }
    })
  },
  methods: {
    // 切换路由
    handleChange (ret) {
      // console.log("当前路径",ret)
      // 回到能切换的路径、
      // if (this.$route.path != '/mainView') {
      //   this.$route.path = '/mainView'
      // }
      // 判断要切换的路由
      if (ret === "nodeView") {
        // 更新视图选项
        this.defaultOption = 'Node视图'
        // catch(err=>err) 解决重复点击路由问题
        this.$router.replace({name: 'nodeRightSide'}).catch(err=>err)
        this.store.commit('changeView', 'nodeView')
      } else if (ret === "logicView") {
        // 更新视图选项
        this.defaultOption = '逻辑视图'
        // 切换前要清空nodeId
        this.store.commit('changeNodeId', null)
        // 选择logic视图
        this.store.commit('changeView', 'logicView')
        // 默认切换到 Pt
        this.currentLogicItem = 0
        this.$router.replace({name: 'ptRightSide'}).catch(err=>err)
      } else if (ret === "healthView") {
        // 更新视图选项
        this.defaultOption = '健康监控视图'
        // 切换前要清空nodeId
        this.store.commit('changeNodeId', null)
        this.$router.replace({name: 'healthRightSide'}).catch(err=>err)
        this.store.commit('changeView', 'healthView')
      } else {
        // 更新视图选项
        this.defaultOption = '请选择视图'
      }
      return ret
    },
    // node选项变化
    changeNode (key) {
      // console.log('index = ',key)
      // console.log('keyPath = ',keyPath)
      // 修改计算属性
      this.currentNodeItem = key
      // 更改vuex中的数据，引起NodeRightSide的切换
      this.store.commit('changeNodeType', this.nodeData[key])
    },
    // Logic选项变化
    changeLogic (index) {
      console.log('当前index = ',index,typeof(index))
      // 修改当前栏目
      this.currentLogicItem = index
      // 切换路由
      // 回到能切换的路径、
      // if (this.$route.path != '/mainView') {
      //   this.$route.path = '/mainView'
      // }
      if(index === "0") {
        // 切换到pt
        this.$router.replace({name: 'ptRightSide'}).catch(err=>err)
      } else if(index === "1") {
        // 切换到pg
        this.$router.replace({name: 'pgRightSide'}).catch(err=>err)
      }
    }
  },
  computed: {
    // Node左侧当前选项
    currentNodeItem: {
      get() {
        if (this.store.state.nowNodeType === 'cpu') {
          return 0
        } else if (this.store.state.nowNodeType === 'disk') {
          return 1
        } else if (this.store.state.nowNodeType === 'memory') {
          return 2
        } else if (this.store.state.nowNodeType === 'net') {
          return 3
        } else if (this.store.state.nowNodeType === 'ptpg') {
          return 4
        } else if (this.store.state.nowNodeType === 'health') {
          return 5
        }
        // null
        return 0
      },
      set(newValue) {
        return newValue
      }
    },
    // 逻辑视图 左侧当前选项
    currentLogicItem: {
      get() {
        return this.store.state.nowLogicId
      },
      set(newValue) {
        this.store.commit('changeLogicId',newValue)
        return newValue
      }
    },
    // 当前是否是Node视图
    isNode () {
      // Node左侧栏受nodeId的影响
      // nowView决定选择栏
      if(this.store.state.nowView === 'nodeView' && this.store.state.nowNodeId != null) {
        return true
      }
      return false
    },
    // 当前是否是Logic视图
    isLogic () {
      if(this.store.state.nowView === "logicView") {
        return true
      }
      return false
    },
    // 当前是否是Health视图
    isHealth () {
      if(this.store.state.nowView === "healthView") {
        return true
      }
      return false
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}
/* 主体 */
.com-container {
  width: 100%;
  height: 100%;
}
/* 左侧窗口 */
.left-side {
  padding: 20px;
  border-right: 2px solid #e1e3e7;
}
/* 方格 */
.box-style {
  height:100%; 
  border:2px solid black; 
  margin: 10px;
}
/* 文字激活状态 */
.textactive {
  color: red;
}
/* 固定选择器 */
.left-side-select {
  width: 100%;
  height: 10%;
}

/* 下部分显示 */
.left-side-show {
  width: 100%;
  height: 90%;
}
</style>