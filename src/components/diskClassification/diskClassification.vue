<template>
  <div class="diskClassification-com">
    <el-row class="diskClassification-top">
      <span style="background-color: #ead086; border-radius: 4px;"><el-icon><Bell /></el-icon> 请确保Cache盘数可被Data盘数整除，并且每个IP都set完毕！！！</span>
    </el-row>
    <el-row>
      <el-table
        :header-cell-style="{height: '50px', color: 'black'}"
        style="height: 500px;" v-if="this.ipList.length > 0" :data="this.ipList" :default-expand-all="this.expandValue"
      >
        <!-- 节点IP -->
        <el-table-column width="150">
          <template #header>
              <span>节点IP</span>
          </template>
          <template #default="scope">
            <el-tag>{{ scope.row.remoteIPv4 }}</el-tag>
          </template>
        </el-table-column>
        <!-- 节点名称 -->
        <el-table-column width="150">
          <template #header>
              <span>节点名称</span>
          </template>
          <template #default="scope">
            <el-tag>{{ scope.row.roleName }}</el-tag>
          </template>
        </el-table-column>
        <!-- Data盘数 -->
        <el-table-column>
          <template #header>
              <span>Data盘数</span>
          </template>
          <template #default="scope">
            <el-select v-model="this.ipList[ scope.row.id ].diskNum">
              <el-option
                v-for="(item,index) in this.ipList[ scope.row.id ].diskSum"
                :key="item"
                :label="item"
                :value="item"
                @click="changeDiskNum(scope.row.id,item)"
              />
            </el-select>
          </template>
        </el-table-column>
        <!-- Cache盘数 -->
        <el-table-column>
          <template #header>
              <span>Cache盘数</span>
          </template>
          <template #default="scope">
            <el-select v-model="this.ipList[ scope.row.id ].cephNum" disabled>
              <el-option
                v-for="(item,index) in this.ipList[ scope.row.id ].cephChoice"
                :key="index"
                :label="item"
                :value="item"
                @click="changeCephNum(scope.row.id,item)"
              />
            </el-select>
          </template>
        </el-table-column>
        <!-- 详细设置 -->
        <el-table-column width="150" type="expand">
          <template #header>
              <span>详细设置</span>
          </template>
          <template #default="scope">
            <table>
              <!-- Data盘:  -->
              <tr>
                <td>Data盘: </td>
              </tr>
              <!-- Data选项 -->
              <tr>
                <td>
                  <!-- 多选 -->
                  <el-checkbox-group v-model="this.ipList[ scope.row.id ].disklist" size="large" :disabled="this.ipList[ scope.row.id ].isDiskEdit">
                    <el-checkbox
                      v-for="(item,index) in this.ipList[ scope.row.id ].diskListall" 
                      :key="item" 
                      :label="item"
                    >
                      {{ item }}
                    </el-checkbox>
                  </el-checkbox-group>
                </td>
                <!-- 按钮 -->
                <td>
                  <el-tag size="large" @click="changeState(scope.row.id,'disk',false)" :class="{'button-select':this.ipList[ scope.row.id ].isDiskEdit === false}">edit</el-tag>
                </td>
                <td>
                  <el-tag size="large" @click="changeState(scope.row.id,'disk',true)" :class="{'button-select':this.ipList[ scope.row.id ].isDiskEdit === true}">set</el-tag>
                </td>
              </tr>
              <!-- Cache盘:  -->
              <tr>
                <td>Cache盘: </td>
              </tr>
              <!-- Cache选项 -->
              <tr>
                <td>
                  <!-- 多选 -->
                  <el-checkbox-group v-model="this.ipList[ scope.row.id ].cachelist" size="large" :disabled="this.ipList[ scope.row.id ].isCephEdit">
                    <el-checkbox
                      v-for="(item,index) in this.ipList[ scope.row.id ].cephListall" 
                      :key="item" 
                      :label="item"
                    >
                      {{ item }}
                    </el-checkbox>
                  </el-checkbox-group>
                </td>
                <!-- 按钮 -->
                <td>
                  <el-tag size="large" @click="changeState(scope.row.id,'ceph',false)" :class="{'button-select':this.ipList[ scope.row.id ].isCephEdit === false}">edit</el-tag>
                </td>
                <td>
                  <el-tag size="large" @click="changeState(scope.row.id,'ceph',true)" :class="{'button-select':this.ipList[ scope.row.id ].isCephEdit === true}">set</el-tag>
                </td>
              </tr>
            </table>
            
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <!-- 下一步按钮 -->
    <el-row>
      <el-col :span="12">
        <el-button @click="nextStep(-1)" type="primary">上一步</el-button>
      </el-col>
      <el-col :span="12">
        <el-button v-loading="loading" @click="beforeNextStep(1)" type="primary">下一步</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import API from '@/api/ajax.js'; // 引入API
import { ElMessageBox,ElMessage } from 'element-plus'
export default {
  setup(){
    // 创建store对象
    const store = useStore()
    return {
        store
    }
  },
  data() {
    return {
      ipList: [], // IP的列表
      expandValue: true,
      loading: false,
    }
  },
  mounted() {
    // 获取IP列表
    API({
      url: '/getIpList',
      method: 'post',
      data: {
        token: this.store.state.userToken
      }
    }).then((res) => {
      let recvdata = res.data.data
      this.ipList = [] // 清空数组
      let tpipList = recvdata.ipList
      let jt = 0;
      // console.log("11c"); // 测试完毕，从上一步/下一步到当前页面会更新
      for(let i=0;i<tpipList.length;i++) {
        if(tpipList[i].ceph === true || tpipList[i].ceph1 === true) { // 筛选ceph节点
          // ceph 信息
          let cephListall = this.getListName(tpipList[i].cacheDisk)  // 全部的ceph
          let cephNum = 2;
          let cephChoice = [2];
          let CacheDisk = this.addSelected(tpipList[i].cacheDisk,cephNum) // 选好的
          let cachelist = this.getList('ceph',CacheDisk)
          // disk 信息
          let diskListall = this.getListName(tpipList[i].dataDisk) // 全部的disk
          // 初始化
          let diskSum = null
          let diskNum = null
          let DataDisk = null
          let disklist = null
          // case1：dataList为空，即后端没传
          if( (tpipList[i].dataList.length === 0) || (tpipList[i].dataList.length%2 != 0) )
          {
            diskSum = this.getTwo(tpipList[i].dataDisk.length);
            diskNum = diskSum[ diskSum.length-1 ];
            DataDisk = this.addSelected(tpipList[i].dataDisk,tpipList[i].dataDisk.length)
            disklist = this.getList('disk',DataDisk)
          }
          // case2: dataList非空，即dataList已经选好
          else{
            diskSum = this.getTwo(tpipList[i].dataDisk.length);
            diskNum = tpipList[i].dataList.length // 长度已经选好
            DataDisk = this.addSelected1(tpipList[i].dataDisk,tpipList[i].dataList) // 选出对应磁盘
            disklist = this.getList('disk',DataDisk)
          }
          
          this.ipList.push({
            id: jt,
            remoteIPv4: tpipList[i].remoteIPv4,
            roleName: tpipList[i].roleName,
            cephChoice: cephChoice, // new
            diskNum: diskNum,// 最后一位
            cephNum: cephNum,
            diskSum: diskSum, // disk总数
            cephSum: cephNum, // ceph总数
            DataDisk: DataDisk, // Data盘列表
            CacheDisk: CacheDisk, // Cache盘列表
            // 页面展示，只有名称
            diskListall: diskListall, // 所有列表
            cephListall: cephListall,
            disklist: disklist, // 被选中的列表
            cachelist: cachelist,
            // 是否能编辑
            isDiskEdit: true,
            isCephEdit: true,
          })
          jt += 1
        }
      }
    }).catch(err => {
      // 输出错误信息
      ElMessage({
        message: '网络连接失败，IP列表获取失败',
        type: 'warning',
      })
    })
  },
  methods: {
    // 预下一步
    beforeNextStep(ret) {
      // 1 检验是否都设置了
      let fg = true
      for(let i=0;i<this.ipList.length;i++) {
        if(this.ipList[i].isCephEdit === false || this.ipList[i].isDiskEdit === false) {
          fg = false
          break
        }
      }
      if(fg === false){
        // alert('请确保每个Data盘和Cache盘都set了')
        ElMessage({
          message: '请确保每个Data盘和Cache盘都set了',
          type: 'warning',
        })
        return ;
      }
      // 2 向后台发送数据
      let ipList = []
      for(let i=0;i<this.ipList.length;i++) {
        let dataList = this.getDataList(this.ipList[i].disklist,this.ipList[i].DataDisk)
        let cacheList = this.getDataList(this.ipList[i].cachelist,this.ipList[i].CacheDisk)
        // console.log('dataList = ',dataList); // 检测完毕，设置成功
        // console.log('cacheList = ',cacheList); // 检测完毕，设置成功
        ipList.push({
          remoteIPv4: this.ipList[i].remoteIPv4,
          roleName: this.ipList[i].roleName,
          dataList: dataList,
          cacheList: cacheList,
        })
      }
      
      this.loading = true
      API({
        url: '/getDiskClassification',
        method: 'post',
        data: {
          ipList: ipList,
          token: this.store.state.userToken
        }
      }).then((res) => {
        this.loading = false
        let recvdata = res.data.data
        if(recvdata.isSuccessed === false){
          // alert('发送失败，请重新发送')
          ElMessage.error('发送失败，请重新发送')
          return ;
        }
        // 3 下一步
        this.nextStep(ret)
      }).catch(err => {
        // 输出错误信息
        ElMessage({
          message: '网络连接错误，磁盘分类提交失败，请重新提交',
          type: 'warning',
        })
        // 结束变为false
        this.loading = false
      })
    },
    // 返回数据，根据磁盘名称，返回磁盘列表
    getDataList(arr,brr){
      // arr 是名称列表，brr是总列表
      let ans = []
      for(let i=0;i<arr.length;i++) {
        for(let j=0;j<brr.length;j++) {
          if(arr[i] === brr[j].name) {
            ans.push({
              id: j,
              name: brr[j].name,
              type: brr[j].type,
            })
            break;
          }
        }
      }
      return ans;
    },
    // 下一步
    nextStep(ret) {
      // ret = 1 前进；ret = -1 后退；，要存为vuex，防止回撤
      let newVal = this.store.state.activeStep + ret
      // console.log('newVal = ',newVal)
      if(newVal >= 0 && newVal <= 7) {
        // 更新数据
        this.store.commit('changeActiveStep', newVal)
      }else{
        // alert('到头了，不要点了')
        ElMessage({
          message: '到头了，不要点了',
          type: 'warning',
        })
      }
    },
    // 获取c的因子
    getFac(c,p) {
      let arr = []
      for(let i=1;i<=c;i++) {
        if(c%i === 0 && i<=p) {
          arr.push(i)
        }
      }
      return arr
    },
    // 获取数组名字
    getListName(arr) {
      let brr = []
      for(let i=0;i<arr.length;i++) {
        brr.push(arr[i].name)
      }
      return brr
    },
    // 只获取能%2的数
    getTwo(val){
      let arr = []
      for(let i=2;i<=val;i+=2){
        arr.push(i);
      }
      return arr
    },
    // 增加isSelected
    addSelected(arr,num) {
      for(let i=0;i<arr.length;i++) {
        arr[i]['isSelected'] = (i<num ? true : false)
      }
      return arr
    },
    // 增加isSelected1
    addSelected1(arr,arr_sd) {
      // console.log("接受的数据：",arr,arr_sd);
      let arr1 = JSON.parse(JSON.stringify(arr));
      for(let i=0;i<arr.length;i++) {
        let fg = false;
        for(let j=0;j<arr_sd.length;j++) {
          if(arr[i].name === arr_sd[j].name){
            fg = true;
            break;
          }
        }
        arr1[i]['isSelected'] = fg;
      }
      return arr1
    },
    // 更新列表数据
    getList(name,alist) {
      let arr = []
      if(name === 'disk'){
        for(let i=0;i<alist.length;i++) {
          if(alist[i].isSelected === true) {
            arr.push(alist[i].name)
          }
        }
      }else if(name === 'ceph'){
        for(let i=0;i<alist.length;i++) {
          if(alist[i].isSelected === true) {
            arr.push(alist[i].name)
          }
        }
      }
      return arr;
    },
    // 更改Disk数量
    changeDiskNum(id,val) {
      // 1 更新Disk数值
      this.ipList[id].diskNum = val
      // 2 更新Ceph可选数值
      this.ipList[id].cephChoice = this.getFac(val,this.ipList[id].cephSum)
      this.ipList[id].cephNum = Math.min(this.ipList[id].cephChoice[ this.ipList[id].cephChoice.length - 1 ],this.ipList[id].cephSum)
      // 3 更新选中的Data列表，Cache列表
      for(let i=0;i<this.ipList[id].DataDisk.length;i++) {
        if(i < this.ipList[id].diskNum) {
          this.ipList[id].DataDisk[i].isSelected = true
        }else{
          this.ipList[id].DataDisk[i].isSelected = false
        }
      }
      for(let i=0;i<this.ipList[id].CacheDisk.length;i++) {
        if(i < this.ipList[id].cephNum) {
          this.ipList[id].CacheDisk[i].isSelected = true
        }else{
          this.ipList[id].CacheDisk[i].isSelected = false
        }
      }
      // 4 更新Disk列表和Ceph列表
      this.ipList[id].disklist = this.getList('disk',this.ipList[id].DataDisk)
      this.ipList[id].cachelist = this.getList('ceph',this.ipList[id].CacheDisk)
    },
    // 更改Ceph数量
    changeCephNum(id,val) {
      // 1 更新Ceph可选数值
      this.ipList[id].cephNum = val
      // 2 更新Cache列表
      for(let i=0;i<this.ipList[id].CacheDisk.length;i++) {
        if(i < this.ipList[id].cephNum) {
          this.ipList[id].CacheDisk[i].isSelected = true
        }else{
          this.ipList[id].CacheDisk[i].isSelected = false
        }
      }
      // 3 更新Ceph列表
      this.ipList[id].cachelist = this.getList('ceph',this.ipList[id].CacheDisk)
    },
    // 更改edit状态
    changeState(id,type,val){
      if(type === 'disk') {
        if(val === true) {
          // 当提交时，判断选择是否合法
          if(this.ipList[id].disklist.length != this.ipList[id].diskNum) {
            // alert('所选disk数量与设定disk数量不一致，请重新选择')
            ElMessage.error('所选disk数量与设定disk数量不一致，请重新选择')
            return 
          }
        }
        this.ipList[id].isDiskEdit = val
      }else if(type === 'ceph') {
        // 当提交时，判断选择是否合法
        if(this.ipList[id].cachelist.length != this.ipList[id].cephNum) {
          // alert('所选ceph数量与设定ceph数量不一致，请重新选择')
          ElMessage.error('所选ceph数量与设定ceph数量不一致，请重新选择')
          return 
        }
        this.ipList[id].isCephEdit = val
      }
    }
  }
}
</script>

<style>
.diskClassification-com {
  margin: 20px;
  width: 100%;
}
.diskClassification-top {
  width: 100%;
  align-items: center;
  justify-content: center;
  /* #ead086 */
}
/* 选中状态 */
.button-select {
  color: white;
  background-color:  #409EFF;
}
</style>