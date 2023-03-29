import Mock from 'mockjs'  //导入mockjs
//使用Mock下面提供的mock方法进行需要模拟数据的封装
//参数1，是需要拦截的完整请求地址，参数2，是请求方式，参数3，是请求的模拟数据
// Mock.mock('http://localhost:8888/test','get',{
// 	status:200, //请求成功状态码
// 	dataList:[1,2,3,4,5,6,7,8,9,10] //模拟的请求数据
// })

// 参数1：getDiskCalender
// 磁盘表格数据
// Mock.mock('http://localhost:8899/getDiskCalender', 'get', {
//   status: 200,
//   dataList: getDiskCalender
// })

// （一）登录注册部分
// 登录
Mock.mock('http://localhost:8899/getLoginPassword','post',(req) => {
  let userInfo = JSON.parse(req.body) // 接收到的数据
  // console.log('---------------,',userInfo)
  // 返回的数据
  let data = {
    data: {
      token: 'todetodetode'
    },
    vaild: false,
    isSuperUser: 1,
    reason: '登录失败，用户名或密码错误'
  }
  if(userInfo.userName === '123' && userInfo.password === '123'){ // 登录成功
    data = Mock.mock({
      // 'data': userInfo,
      'vaild': true,
      'data':{
        'token|3-4': 'tode',
      },
      'isSuperUser': 1 // 1 普通； 0 超管
    })
  }

  return data
})

// 获取userInfo
Mock.mock('http://localhost:8899/getLoginToken','post',(req) => {
  // console.log('收到的数据 = ',req)
  let userInfo = JSON.parse(req.body)
  // console.log('req headers = ',req)
  return {
    data:{
      phonenumber: '18830456767',
      userName: '张三',
      password: '1234567',
      isSuperUser: 0,
      isFinished: true // 是否完成自动化部署
    }
  }
})

// 注册
Mock.mock('http://localhost:8899/getRegister','post',(req) => {
  let userInfo = JSON.parse(req.body)
  let reason = '用户注册成功'
  let isSuccessed = true
  // 如果是root，注册失败
  if(userInfo.userName === 'root') {
    reason = '当前用户已被注册'
    isSuccessed = false
  }
  return {
    data:{
      data: userInfo,
      isSuccessed: isSuccessed, // 是否注册成功
      reason: reason
    }
  }
})

// 登出
Mock.mock('http://localhost:8899/getLogOut','post',(req) => {
  let token = JSON.parse(req.body)
  console.log('）））））））））））））））登出成功 = ',req)
})

// 修改密码
Mock.mock('http://localhost:8899/getUpdatePassword','post',(req) => {
  let token = JSON.parse(req.body)
  return {
    data: {
      isUpdated: true
    }
  }
})

// （二）PT、PG数据更新部分
// PT数据更新
Mock.mock('http://localhost:8899/getPtAll','post',(req) => {
  let ptList = []
  let nodeList = []
  // 制造180个Pt对象
  for(let i=0;i<180;i++){
    ptList.push({
      ptId: i+5,
      bv: 6,
      state: (Math.floor(Math.random() * 100)%2 === 0 ? 'PT_STATE_OK' : 'PT_STATE_NOK'),
      indexNode: 0,
      ptInfo: [
        [0,0,2],
        [0,0,2]
      ],
      ioInfo: {
        ioCount: 0,
        readCount: 1,
        readSize: 0,
        writeCount: 0,
        writeSize: 0
      },
      nodeIp:'175.34.8.' + (i%4)
    })
  }
  // 制造node对象
  for(let i=0;i<512;i++){
    let diskList = []
    // 制造两个disk
    for(let i=0;i<2;i++){
      let ptList1 = []
      // PT对象
      for(let i=0;i<5;i++){
        ptList1.push({
          ptId: i+5,
          bv: 6,
          state: (Math.floor(Math.random() * 100)%2 === 0 ? 'PT_STATE_OK' : 'PT_STATE_NOK'),
          indexNode: 0,
          ptInfo: [
            [0,0,2],
            [0,0,2]
          ],
          ioInfo: {
            ioCount: 0,
            readCount: 1,
            readSize: 0,
            writeCount: 0,
            writeSize: 0
          },
          nodeIp:'175.34.8.' + (i%4)
        })
      }
      // 每个（nodeId，diskId）对应一个ptList
      diskList.push({
        diskId: i+5,
        ptList: ptList1
      })
    }
    nodeList.push({
      nodeId: i+5,
      diskList: diskList
    })
  }
  return {
    data:{
      nodeList: nodeList,
      ptList: ptList
    }
  }
})

// PG数据更新
Mock.mock('http://localhost:8899/getPgAll','post',(req) => {
  let pgList = []
  let nodeList = []
  // 制造180个Pg对象
  for(let i=0;i<180;i++){
    pgList.push({
      pgId: i+5,
      bv: 4,
      state: (Math.floor(Math.random() * 100)%2 === 0 ? 'PG_STATE_NORMAL' : 'PG_STATE_DOWN'),
      masterNode: 0,
      masterDisk: 0,
      copyNum: 3,
      copyInfos: [
        {
          nodeId: 0,
          diskId: 0,
          copyState: 'PG_COPY_STATE_RUNNING'
        },
        {
          nodeId: 1,
          diskId: 2,
          copyState: 'PG_COPY_STATE_RUNNING'
        },
        {
          nodeId: 2,
          diskId: 4,
          copyState: 'PG_COPY_STATE_RUNNING'
        }
      ]
    })
  }
  // 制造node对象
  for(let i=0;i<512;i++){
    let diskList = []
    // 制造两个disk
    for(let i=0;i<2;i++){
      let pgList1 = []
      // 制造5个Pg对象
      for(let i=0;i<5;i++){
        pgList1.push({
          pgId: i+5,
          bv: 4,
          state: (Math.floor(Math.random() * 100)%2 === 0 ? 'PG_STATE_NORMAL' : 'PG_STATE_DOWN'),
          masterNode: 0,
          masterDisk: 0,
          copyNum: 3,
          copyInfos: [
            {
              nodeId: 0,
              diskId: 0,
              copyState: 'PG_COPY_STATE_RUNNING'
            },
            {
              nodeId: 1,
              diskId: 2,
              copyState: 'PG_COPY_STATE_RUNNING'
            },
            {
              nodeId: 2,
              diskId: 4,
              copyState: 'PG_COPY_STATE_RUNNING'
            }
          ]
        })
      }
      diskList.push({
        diskId: i+5,
        pgList: pgList1
      })
    }
    nodeList.push({
      nodeId: i+5,
      diskList: diskList
    })
  }
  return {
    data:{
      nodeList: nodeList,
      pgList: pgList
    }
  }
})

// 点击PT数据更新
Mock.mock('http://localhost:8899/getPtUpdate','post',(req) => {
  let ptList = []
  let nodeList = []
  // 制造180个Pt对象
  for(let i=0;i<180;i++){
    ptList.push({
      ptId: i+5,
      bv: 6,
      state: (Math.floor(Math.random() * 100)%2 === 0 ? 'PT_STATE_OK' : 'PT_STATE_NOK'),
      indexNode: 0,
      ptInfo: [
        [0,0,2],
        [0,0,2]
      ],
      ioInfo: {
        ioCount: 0,
        readCount: 1,
        readSize: 0,
        writeCount: 0,
        writeSize: 0
      },
      nodeIp:'175.34.8.' + (i%4)
    })
  }
  // 制造node对象
  for(let i=0;i<512;i++){
    let diskList = []
    // 制造两个disk
    for(let i=0;i<2;i++){
      let ptList1 = []
      // PT对象
      for(let i=0;i<5;i++){
        ptList1.push({
          ptId: i+5,
          bv: 6,
          state: (Math.floor(Math.random() * 100)%2 === 0 ? 'PT_STATE_OK' : 'PT_STATE_NOK'),
          indexNode: 0,
          ptInfo: [
            [0,0,2],
            [0,0,2]
          ],
          ioInfo: {
            ioCount: 0,
            readCount: 1,
            readSize: 0,
            writeCount: 0,
            writeSize: 0
          },
          nodeIp:'175.34.8.' + (i%4)
        })
      }
      // 每个（nodeId，diskId）对应一个ptList
      diskList.push({
        diskId: i+5,
        ptList: ptList1
      })
    }
    nodeList.push({
      nodeId: i+5,
      diskList: diskList
    })
  }
  return {
    data:{
      nodeList: nodeList,
      ptList: ptList
    }
  }
})

// 点击PG数据更新
Mock.mock('http://localhost:8899/getPgUpdate','post',(req) => {
  let pgList = []
  let nodeList = []
  // 制造180个Pg对象
  for(let i=0;i<180;i++){
    pgList.push({
      pgId: i+5,
      bv: 4,
      state: (Math.floor(Math.random() * 100)%2 === 0 ? 'PG_STATE_NORMAL' : 'PG_STATE_DOWN'),
      masterNode: 0,
      masterDisk: 0,
      copyNum: 3,
      copyInfos: [
        {
          nodeId: 0,
          diskId: 0,
          copyState: 'PG_COPY_STATE_RUNNING'
        },
        {
          nodeId: 1,
          diskId: 2,
          copyState: 'PG_COPY_STATE_RUNNING'
        },
        {
          nodeId: 2,
          diskId: 4,
          copyState: 'PG_COPY_STATE_RUNNING'
        }
      ]
    })
  }
  // 制造node对象
  for(let i=0;i<512;i++){
    let diskList = []
    // 制造两个disk
    for(let i=0;i<2;i++){
      let pgList1 = []
      // 制造5个Pg对象
      for(let i=0;i<5;i++){
        pgList1.push({
          pgId: i+5,
          bv: 4,
          state: (Math.floor(Math.random() * 100)%2 === 0 ? 'PG_STATE_NORMAL' : 'PG_STATE_DOWN'),
          masterNode: 0,
          masterDisk: 0,
          copyNum: 3,
          copyInfos: [
            {
              nodeId: 0,
              diskId: 0,
              copyState: 'PG_COPY_STATE_RUNNING'
            },
            {
              nodeId: 1,
              diskId: 2,
              copyState: 'PG_COPY_STATE_RUNNING'
            },
            {
              nodeId: 2,
              diskId: 4,
              copyState: 'PG_COPY_STATE_RUNNING'
            }
          ]
        })
      }
      diskList.push({
        diskId: i+5,
        pgList: pgList1
      })
    }
    nodeList.push({
      nodeId: i+5,
      diskList: diskList
    })
  }
  return {
    data:{
      nodeList: nodeList,
      pgList: pgList
    }
  }
})

// （三）自动化部署部分
// getIpList
Mock.mock('http://localhost:8899/getIpList','post',(req) => {
  return {
    data:{
      ipList:[
        {
          name: '192.156.23.3',
          isConnected: true, // 能否连接
          isCpu: false, // CPU是否满足要求
          isMemory: false, // 内存是否满足要求
          // getRoleSet
          ceph: false,
          client: false,
          ceph1: true,
          roleName: 'ceph1',
          // getIPSet
          localIPv4: '192.156.23.3',
          clusterIPv4: '192.156.23.3',
          // getDiskClassification
          dataDisk:[ // Data盘列表
              {
                  id: 0,
                  name: 'SDA',
                  type: 'SD'
              },
              {
                  id: 1,
                  name: 'SDB',
                  type: 'SD'
              },
              {
                  id: 2,
                  name: 'SDC',
                  type: 'SD'
              },
              {
                  id: 3,
                  name: 'SDD',
                  type: 'SD'
              },
              {
                  id: 4,
                  name: 'SDE',
                  type: 'SD'
              },
              {
                  id: 5,
                  name: 'SDF',
                  type: 'SD'
              },
          ],
          cacheDisk: [ // Ceph盘列表
              {
                  id: 0,
                  name: 'nvme01',
                  type: 'nvme'
              },
              {
                  id: 1,
                  name: 'nvme02',
                  type: 'nvme'
              },
              {
                  id: 2,
                  name: 'nvme03',
                  type: 'nvme'
              },
              {
                  id: 3,
                  name: 'nvme04',
                  type: 'nvme'
              },
          ],
          dataList: [
            {
              id: 0,
              name: 'SDA',
              type: 'SD'
            },
            {
                id: 1,
                name: 'SDB',
                type: 'SD'
            },
            {
                id: 2,
                name: 'SDC',
                type: 'SD'
            },
            {
                id: 3,
                name: 'SDD',
                type: 'SD'
            },
          ], // Data盘列表
          cacheList: [
            {
              id: 0,
              name: 'nvme01',
              type: 'nvme'
            },
            {
                id: 1,
                name: 'nvme02',
                type: 'nvme'
            },
          ], // Cache盘列表
        },
        {
          name: '192.22.34.2',
          isConnected: false, // 能否连接
          isCpu: true, // CPU是否满足要求
          isMemory: false, // 内存是否满足要求
          // getRoleSet
          ceph: false,
          client: true,
          ceph1: false,
          roleName: 'client1',
          // getIPSet
          localIPv4: null,
          clusterIPv4: null,
          // getDiskClassification
          dataDisk:[],
          cacheDisk: [],
          dataList: [],
          cacheList: [],
        },
        {
          name: '192.56.33.2',
          isConnected: true, // 能否连接
          isCpu: true, // CPU是否满足要求
          isMemory: true, // 内存是否满足要求
          // getRoleSet
          ceph: true,
          client: false,
          ceph1: false,
          roleName: 'ceph2',
          // getIPSet
          localIPv4: '192.56.33.2',
          clusterIPv4: '192.56.33.2',
          // getDiskClassification
          dataDisk:[ // Data盘列表
              {
                  id: 0,
                  name: 'SDA',
                  type: 'SD'
              },
              {
                  id: 1,
                  name: 'SDB',
                  type: 'SD'
              },
              {
                  id: 2,
                  name: 'SDC',
                  type: 'SD'
              },
              {
                  id: 3,
                  name: 'SDD',
                  type: 'SD'
              },
              {
                  id: 4,
                  name: 'SDE',
                  type: 'SD'
              },
              {
                  id: 5,
                  name: 'SDF',
                  type: 'SD'
              },
          ],
          cacheDisk: [ // Ceph盘列表
              {
                  id: 0,
                  name: 'nvme01',
                  type: 'nvme'
              },
              {
                  id: 1,
                  name: 'nvme02',
                  type: 'nvme'
              },
              {
                  id: 2,
                  name: 'nvme03',
                  type: 'nvme'
              },
              {
                  id: 3,
                  name: 'nvme04',
                  type: 'nvme'
              },
          ],
          dataList: [
            {
              id: 0,
              name: 'SDA',
              type: 'SD'
            },
            {
                id: 1,
                name: 'SDB',
                type: 'SD'
            },
            {
                id: 2,
                name: 'SDC',
                type: 'SD'
            },
            {
                id: 3,
                name: 'SDD',
                type: 'SD'
            },
          ], // Data盘列表
          cacheList: [
            {
              id: 0,
              name: 'nvme01',
              type: 'nvme'
            },
            {
                id: 1,
                name: 'nvme02',
                type: 'nvme'
            },
          ], // Cache盘列表
        },
        {
          name: '192.56.37.8',
          isConnected: true, // 能否连接
          isCpu: true, // CPU是否满足要求
          isMemory: true, // 内存是否满足要求
          // getRoleSet
          ceph: true,
          client: false,
          ceph1: false,
          roleName: 'ceph3',
          // getIPSet
          localIPv4: '192.56.37.8',
          clusterIPv4: '192.56.37.8',
          // getDiskClassification
          dataDisk:[ // Data盘列表
              {
                  id: 0,
                  name: 'SDA',
                  type: 'SD'
              },
              {
                  id: 1,
                  name: 'SDB',
                  type: 'SD'
              },
              {
                  id: 2,
                  name: 'SDC',
                  type: 'SD'
              },
              {
                  id: 3,
                  name: 'SDD',
                  type: 'SD'
              },
              {
                  id: 4,
                  name: 'SDE',
                  type: 'SD'
              },
              {
                  id: 5,
                  name: 'SDF',
                  type: 'SD'
              },
          ],
          cacheDisk: [ // Ceph盘列表
              {
                  id: 0,
                  name: 'nvme01',
                  type: 'nvme'
              },
              {
                  id: 1,
                  name: 'nvme02',
                  type: 'nvme'
              },
              {
                  id: 2,
                  name: 'nvme03',
                  type: 'nvme'
              },
              {
                  id: 3,
                  name: 'nvme04',
                  type: 'nvme'
              },
          ],
          dataList: [
            {
              id: 0,
              name: 'SDA',
              type: 'SD'
            },
            {
                id: 1,
                name: 'SDB',
                type: 'SD'
            },
            {
                id: 2,
                name: 'SDC',
                type: 'SD'
            },
            {
                id: 3,
                name: 'SDD',
                type: 'SD'
            },
          ], // Data盘列表
          cacheList: [
            {
              id: 0,
              name: 'nvme01',
              type: 'nvme'
            },
            {
                id: 1,
                name: 'nvme02',
                type: 'nvme'
            },
          ], // Cache盘列表
        },
        {
          name: '192.56.39.8',
          isConnected: true, // 能否连接
          isCpu: true, // CPU是否满足要求
          isMemory: true, // 内存是否满足要求
          // getRoleSet
          ceph: true,
          client: false,
          ceph1: false,
          roleName: 'ceph3',
          // getIPSet
          localIPv4: '192.56.39.8',
          clusterIPv4: '192.56.39.8',
          // getDiskClassification
          dataDisk:[ // Data盘列表
              {
                  id: 0,
                  name: 'SDA',
                  type: 'SD'
              },
              {
                  id: 1,
                  name: 'SDB',
                  type: 'SD'
              },
              {
                  id: 2,
                  name: 'SDC',
                  type: 'SD'
              },
              {
                  id: 3,
                  name: 'SDD',
                  type: 'SD'
              },
              {
                  id: 4,
                  name: 'SDE',
                  type: 'SD'
              },
              {
                  id: 5,
                  name: 'SDF',
                  type: 'SD'
              },
          ],
          cacheDisk: [ // Ceph盘列表
              {
                  id: 0,
                  name: 'nvme01',
                  type: 'nvme'
              },
              {
                  id: 1,
                  name: 'nvme02',
                  type: 'nvme'
              },
              {
                  id: 2,
                  name: 'nvme03',
                  type: 'nvme'
              },
              {
                  id: 3,
                  name: 'nvme04',
                  type: 'nvme'
              },
          ],
          dataList: [
            {
              id: 0,
              name: 'SDA',
              type: 'SD'
            },
            {
                id: 1,
                name: 'SDB',
                type: 'SD'
            },
            {
                id: 2,
                name: 'SDC',
                type: 'SD'
            },
            {
                id: 3,
                name: 'SDD',
                type: 'SD'
            },
          ], // Data盘列表
          cacheList: [
            {
              id: 0,
              name: 'nvme01',
              type: 'nvme'
            },
            {
                id: 1,
                name: 'nvme02',
                type: 'nvme'
            },
          ], // Cache盘列表
        },
        {
          name: '192.77.37.8',
          isConnected: true, // 能否连接
          isCpu: true, // CPU是否满足要求
          isMemory: true, // 内存是否满足要求
          // getRoleSet
          ceph: true,
          client: false,
          ceph1: false,
          roleName: 'ceph3',
          // getIPSet
          localIPv4: '192.77.37.8',
          clusterIPv4: '192.77.37.8',
          // getDiskClassification
          dataDisk:[ // Data盘列表
              {
                  id: 0,
                  name: 'SDA',
                  type: 'SD'
              },
              {
                  id: 1,
                  name: 'SDB',
                  type: 'SD'
              },
              {
                  id: 2,
                  name: 'SDC',
                  type: 'SD'
              },
              {
                  id: 3,
                  name: 'SDD',
                  type: 'SD'
              },
              {
                  id: 4,
                  name: 'SDE',
                  type: 'SD'
              },
              {
                  id: 5,
                  name: 'SDF',
                  type: 'SD'
              },
          ],
          cacheDisk: [ // Ceph盘列表
              {
                  id: 0,
                  name: 'nvme01',
                  type: 'nvme'
              },
              {
                  id: 1,
                  name: 'nvme02',
                  type: 'nvme'
              },
              {
                  id: 2,
                  name: 'nvme03',
                  type: 'nvme'
              },
              {
                  id: 3,
                  name: 'nvme04',
                  type: 'nvme'
              },
          ],
          dataList: [
            {
              id: 0,
              name: 'SDA',
              type: 'SD'
            },
            {
                id: 1,
                name: 'SDB',
                type: 'SD'
            },
            {
                id: 2,
                name: 'SDC',
                type: 'SD'
            },
            {
                id: 3,
                name: 'SDD',
                type: 'SD'
            },
          ], // Data盘列表
          cacheList: [
            {
              id: 0,
              name: 'nvme01',
              type: 'nvme'
            },
            {
                id: 1,
                name: 'nvme02',
                type: 'nvme'
            },
          ], // Cache盘列表
        },
      ]
    }
  }
})

// getAddIP
Mock.mock('http://localhost:8899/getAddIP','post',(req) => {
  let ipAddress = JSON.parse(req.body).ipAddress
  if(ipAddress === '127.0.0.1') {
    return {
      data:{
        isConnected: true,
        isCpu: true,
        isMemory: true,
        isValid: false,
        reason: 'ip地址范围错误'
      }
    }
  }
  return {
    data:{
      isValid: true,
      isConnected: true,
      isCpu: true,
      isMemory: true,
      reason: 'ip添加成功'
    }
  }
})

// getDeleteIP
Mock.mock('http://localhost:8899/getDeleteIP','post',(req) => {
  let ipAddress = JSON.parse(req.body).ipAddress
  return {
    data:{
      isValid: true,
    }
  }
})

// getCheckRootPassword
Mock.mock('http://localhost:8899/getCheckRootPassword','post',(req) => {
  let password = JSON.parse(req.body).password
  // console.log('密码是：',password)
  if(password === '123') {
    return {
      data:{
        isRight: true
      }
    }
  }
  return {
    data:{
      isRight: false
    }
  }
})

// getHardwareDetect
Mock.mock('http://localhost:8899/getHardwareDetect','post',(req) => {
  let ipName = JSON.parse(req.body).ipAddress
  return {
    data:{
      name: ipName,
      isConnected: true, // 能否连接
      isCpu: true, // CPU是否满足要求
      isMemory: true // 内存是否满足要求
    }
  }
})

// getRoleSet
Mock.mock('http://localhost:8899/getRoleSet','post',(req) => {
  return {
    data:{
      isSuccessed: true // 返回接收状态
    }
  }
})

// getIPSet
Mock.mock('http://localhost:8899/getIPSet','post',(req) => {
  return {
    data:{
      isSuccessed: true // 返回接收状态
    }
  }
})

// getDiskClassification
Mock.mock('http://localhost:8899/getDiskClassification','post',(req) => {
  let redata = JSON.parse(req.body)
  // console.log('diskData === ',redata)
  return {
    data:{
      isSuccessed: true // 返回接收状态
    }
  }
})

// getClusterSet
Mock.mock('http://localhost:8899/getClusterSet','post',(req) => {
  return {
    data:{
      isSuccessed: true // 返回接收状态
    }
  }
})

// getClusterInfo
Mock.mock('http://localhost:8899/getClusterInfo','post',(req) => {
  return {
    data:{
      pnet: '192.168.0.0',
      cnet: '192.168.0.0',
      netMask: '192.168.0.0',
      ptNum: 360,
      pgNum: 360,
    }
  }
})

// getAffirmSet
Mock.mock('http://localhost:8899/getAffirmSet','post',(req) => {
  return {
    data:{
      // 1 clusterSet
      pnet: '192.168.0.0',
      cnet: '192.168.0.0',
      netMask: '192.168.0.0',
      ptNum: 360,
      pgNum: 360,
      // 2 ceph1 信息
      ceph1: [
        {
          name: '192.168.10.7',
          dataList: [
              {
                  "id": 0,
                  "name": "SDA",
                  "type": "SD"
              },
              {
                  "id": 1,
                  "name": "SDB",
                  "type": "SD"
              },
              {
                  "id": 2,
                  "name": "SDC",
                  "type": "SD"
              },
              {
                  "id": 3,
                  "name": "SDD",
                  "type": "SD"
              },
              {
                  "id": 4,
                  "name": "SDE",
                  "type": "SD"
              },
              {
                  "id": 5,
                  "name": "SDF",
                  "type": "SD"
              }
          ],
          cacheList: [
              {
                  "id": 0,
                  "name": "nvme01",
                  "type": "nvme"
              },
              {
                  "id": 1,
                  "name": "nvme02",
                  "type": "nvme"
              },
              {
                  "id": 2,
                  "name": "nvme03",
                  "type": "nvme"
              }
          ],
        },
      ],
      // 3 其他ceph信息
      ceph:[
        {
          name: '192.56.33.2',
          roleName: 'ceph2',
          localIPv4: '192.56.33.2',
          clusterIPv4: '192.56.33.2',
          dataList: [
            {
              id: 0,
              name: 'SDA',
              type: 'SD'
            },
            {
                id: 1,
                name: 'SDB',
                type: 'SD'
            },
            {
                id: 2,
                name: 'SDC',
                type: 'SD'
            },
            {
                id: 3,
                name: 'SDD',
                type: 'SD'
            },
          ], // Data盘列表
          cacheList: [
            {
              id: 0,
              name: 'nvme01',
              type: 'nvme'
            },
            {
                id: 1,
                name: 'nvme02',
                type: 'nvme'
            },
          ], // Cache盘列表
        },
      ],
      // 4 client信息
      client:[
        {
          name: '192.22.34.2',
          roleName: 'client1',
        }
      ]
    }
  }
})

// getBeginInstall
Mock.mock('http://localhost:8899/getBeginInstall','post',(req) => {
  return {
    data:{
      isBegin: true, // 能否开始安装
    }
  }
})

// getStartInstall
Mock.mock('http://localhost:8899/getStartInstall','post',(req) => {
  let date = new Date()
  return {
    data:{
      installLogInfo: "Last login: Tue Mar 21 06:49:40 2023 from 192.168.101.33||bash /home/GlobalCacheScriptsNew/envs/configure/compile/configure_compile_env.sh ||exit||||Welcome to 4.19.90-2012.4.0.0053.oe1.aarch64||System information as of time: \tTue Mar 21 07:56:21 CST 2023||System load: \t\u001B[0;33;40m0.79\u001B[0m|Processes: \t1170|Memory used: \t51.6%|Swap used: \t0.0%|Usage On: \t29%|IP address: \t175.34.8.36|Users online: \t1||||[root@ceph1 ~]# bash /home/GlobalCacheScriptsNew/envs/configure/compile/configure_compile_env.sh |[2023-03-21 07:56:21][WARN]------------Configure compile node environment start------------|jdk8u282-b08/|jdk8u282-b08/jre/|jdk8u282-b08/jre/bin/|jdk8u282-b08/jre/bin/rmid|jdk8u282-b08/jre/bin/jjs|jdk8u282-b08/jre/bin/java|jdk8u282-b08/jre/bin/rmiregistry|jdk8u282-b08/jre/bin/unpack200|jdk8u282-b08/jre/bin/tnameserv|jdk8u282-b08/jre/bin/servertool|jdk8u282-b08/jre/bin/policytool|jdk8u282-b08/jre/bin/keytool|jdk8u282-b08/jre/bin/orbd|jdk8u282-b08/jre/bin/pack200|jdk8u282-b08/jre/ASSEMBLY_EXCEPTION|jdk8u282-b08/jre/lib/|jdk8u282-b08/jre/lib/charsets.jar|jdk8u282-b08/jre/lib/tzdb.dat|jdk8u282-b08/jre/lib/content-types.properties|jdk8u282-b08/jre/lib/jfr.jar|jdk8u282-b08/jre/lib/ext/|jdk8u282-b08/jre/lib/ext/jaccess.jar|jdk8u282-b08/jre/lib/ext/sunpkcs11.jar|jdk8u282-b08/jre/lib/ext/zipfs.jar|jdk8u282-b08/jre/lib/ext/dnsns.jar|jdk8u282-b08/jre/lib/ext/sunjce_provider.jar|jdk8u282-b08/jre/lib/ext/meta-index|jdk8u282-b08/jre/lib/ext/nashorn.jar|jdk8u282-b08/jre/lib/ext/sunec.jar|jdk8u282-b08/jre/lib/ext/localedata.jar|jdk8u282-b08/jre/lib/ext/cldrdata.jar|jdk8u282-b08/jre/lib/jvm.hprof.txt|jdk8u282-b08/jre/lib/psfont.properties.ja|jdk8u282-b08/jre/lib/aarch64/|jdk8u282-b08/jre/lib/aarch64/libattach.so|jdk8u282-b08/jre/lib/aarch64/libnio.so|jdk8u282-b08/jre/lib/aarch64/libsaproc.so|jdk8u282-b08/jre/lib/aarch64/libjawt.so|jdk8u282-b08/jre/lib/aarch64/libsplashscreen.so|jdk8u282-b08/jre/lib/aarch64/jli/|jdk8u282-b08/jre/lib/aarch64/jli/libjli.so|jdk8u282-b08/jre/lib/aarch64/libfontmanager.so|jdk8u282-b08/jre/lib/aarch64/libverify.so|jdk8u282-b08/jre/lib/aarch64/server/|jdk8u282-b08/jre/lib/aarch64/server/Xusage.txt|jdk8u282-b08/jre/lib/aarch64/server/libjsig.so|jdk8u282-b08/jre/lib/aarch64/server/libjvm.so|jdk8u282-b08/jre/lib/aarch64/libawt_xawt.so|jdk8u282-b08/jre/lib/aarch64/libsctp.so|jdk8u282-b08/jre/lib/aarch64/libj2pkcs11.so|jdk8u282-b08/jre/lib/aarch64/libjsig.so|jdk8u282-b08/jre/lib/aarch64/libmanagement.so|jdk8u282-b08/jre/lib/aarch64/libj2gss.so|jdk8u282-b08/jre/lib/aarch64/libjsound.so|jdk8u282-b08/jre/lib/aarch64/libmlib_image.so|jdk8u282-b08/jre/lib/aarch64/jvm.cfg|jdk8u282-b08/jre/lib/aarch64/libawt_headless.so|jdk8u282-b08/jre/lib/aarch64/libjpeg.so|jdk8u282-b08/jre/lib/aarch64/libinstrument.so|jdk8u282-b08/jre/lib/aarch64/libjdwp.so|jdk8u282-b08/jre/lib/aarch64/libawt.so|jdk8u282-b08/jre/lib/aarch64/libnpt.so|jdk8u282-b08/jre/lib/aarch64/libjsdt.so|jdk8u282-b08/jre/lib/aarch64/libjava_crw_demo.so|jdk8u282-b08/jre/lib/aarch64/libzip.so|jdk8u282-b08/jre/lib/aarch64/libjava.so|jdk8u282-b08/jre/lib/aarch64/libj2pcsc.so|jdk8u282-b08/jre/lib/aarch64/libjaas_unix.so|jdk8u282-b08/jre/lib/aarch64/libdt_socket.so|jdk8u282-b08/jre/lib/aarch64/libsunec.so|jdk8u282-b08/jre/lib/aarch64/libhprof.so|jdk8u282-b08/jre/lib/aarch64/libunpack.so|jdk8u282-b08/jre/lib/aarch64/libjsoundalsa.so|jdk8u282-b08/jre/lib/aarch64/liblcms.so|jdk8u282-b08/jre/lib/aarch64/libnet.so|jdk8u282-b08/jre/lib/security/|jdk8u282-b08/jre/lib/security/cacerts|jdk8u282-b08/jre/lib/security/java.policy|jdk8u282-b08/jre/lib/security/policy/|jdk8u282-b08/jre/lib/security/policy/unlimited/|jdk8u282-b08/jre/lib/security/policy/unlimited/local_policy.jar|jdk8u282-b08/jre/lib/security/policy/unlimited/US_export_policy.jar|jdk8u282-b08/jre/lib/security/policy/limited/|jdk8u282-b08/jre/lib/security/policy/limited/local_policy.jar|jdk8u282-b08/jre/lib/security/policy/limited/US_export_policy.jar|jdk8u282-b08/jre/lib/security/blacklisted.certs|jdk8u282-b08/jre/lib/security/java.security|jdk8u282-b08/jre/lib/jsse.jar|jdk8u282-b08/jre/lib/images/|jdk8u282-b08/jre/lib/images/cursors/|jdk8u282-b08/jre/lib/images/cursors/motif_CopyNoDrop32x32.gif|jdk8u282-b08/jre/lib/images/cursors/motif_LinkNoDrop32x32.gif|jdk8u282-b08/jre/lib/images/cursors/invalid32x32.gif|jdk8u282-b08/jre/lib/images/cursors/cursors.properties|jdk8u282-b08/jre/lib/images/cursors/motif_MoveNoDrop32x32.gif|jdk8u282-b08/jre/lib/images/cursors/motif_MoveDrop32x32.gif|jdk8u282-b08/jre/lib/images/cursors/motif_CopyDrop32x32.gif|jdk8u282-b08/jre/lib/images/cursors/motif_LinkDrop32x32.gif|jdk8u282-b08/jre/lib/resources.jar|jdk8u282-b08/jre/lib/jfr/|jdk8u282-b08/jre/lib/jfr/profile.jfc|jdk8u282-b08/jre/lib/jfr/default.jfc|jdk8u282-b08/jre/lib/cmm/|jdk8u282-b08/jre/lib/cmm/CIEXYZ.pf|jdk8u282-b08/jre/lib/cmm/LINEAR_RGB.pf|jdk8u282-b08/jre/lib/cmm/GRAY.pf|jdk8u282-b08/jre/lib/cmm/sRGB.pf|jdk8u282-b08/jre/lib/cmm/PYCC.pf|jdk8u282-b08/jre/lib/hijrah-config-umalqura.properties|jdk8u282-b08/jre/lib/jexec|jdk8u282-b08/jre/lib/currency.data|jdk8u282-b08/jre/lib/psfontj2d.properties|jdk8u282-b08/jre/lib/logging.properties|jdk8u282-b08/jre/lib/rt.jar|jdk8u282-b08/jre/lib/jce.jar|jdk8u282-b08/jre/lib/meta-index|jdk8u282-b08/jre/lib/management-agent.jar|jdk8u282-b08/jre/lib/management/|jdk8u282-b08/jre/lib/management/management.properties|jdk8u282-b08/jre/lib/management/jmxremote.access|jdk8u282-b08/jre/lib/management/snmp.acl.template|jdk8u282-b08/jre/lib/management/jmxremote.password.template|jdk8u282-b08/jre/lib/applet/|jdk8u282-b08/jre/lib/classlist|jdk8u282-b08/jre/lib/sound.properties|jdk8u282-b08/jre/lib/calendars.properties|jdk8u282-b08/jre/lib/net.properties|jdk8u282-b08/jre/lib/flavormap.properties|jdk8u282-b08/jre/LICENSE|jdk8u282-b08/jre/THIRD_PARTY_README|jdk8u282-b08/man/|jdk8u282-b08/man/ja_JP.UTF-8/|jdk8u282-b08/man/ja_JP.UTF-8/man1/|jdk8u282-b08/man/ja_JP.UTF-8/man1/rmiregistry.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jar.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/orbd.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jjs.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jstatd.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/javadoc.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/java.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/extcheck.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jrunscript.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jdeps.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/rmic.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/native2ascii.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/wsimport.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/javap.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jinfo.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jconsole.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jarsigner.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jmap.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jcmd.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jdb.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jstack.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jstat.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/xjc.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/wsgen.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jsadebugd.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/javah.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/servertool.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/appletviewer.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/policytool.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/tnameserv.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/idlj.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/unpack200.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/pack200.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jps.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/jhat.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/javac.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/keytool.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/schemagen.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/serialver.1|jdk8u282-b08/man/ja_JP.UTF-8/man1/rmid.1|jdk8u282-b08/man/man1/|jdk8u282-b08/man/man1/rmiregistry.1|jdk8u282-b08/man/man1/jar.1|jdk8u282-b08/man/man1/orbd.1|jdk8u282-b08/man/man1/jjs.1|jdk8u282-b08/man/man1/jstatd.1|jdk8u282-b08/man/man1/javadoc.1|jdk8u282-b08/man/man1/java.1|jdk8u282-b08/man/man1/extcheck.1|jdk8u282-b08/man/man1/jrunscript.1|jdk8u282-b08/man/man1/jdeps.1|jdk8u282-b08/man/man1/rmic.1|jdk8u282-b08/man/man1/native2ascii.1|jdk8u282-b08/man/man1/wsimport.1|jdk8u282-b08/man/man1/javap.1|jdk8u282-b08/man/man1/jinfo.1|jdk8u282-b08/man/man1/jconsole.1|jdk8u282-b08/man/man1/jarsigner.1|jdk8u282-b08/man/man1/jmap.1|jdk8u282-b08/man/man1/jcmd.1|jdk8u282-b08/man/man1/jdb.1|jdk8u282-b08/man/man1/jstack.1|jdk8u282-b08/man/man1/jstat.1|jdk8u282-b08/man/man1/xjc.1|jdk8u282-b08/man/man1/wsgen.1|jdk8u282-b08/man/man1/jsadebugd.1|jdk8u282-b08/man/man1/javah.1|jdk8u282-b08/man/man1/servertool.1|jdk8u282-b08/man/man1/appletviewer.1|jdk8u282-b08/man/man1/policytool.1|jdk8u282-b08/man/man1/tnameserv.1|jdk8u282-b08/man/man1/idlj.1|jdk8u282-b08/man/man1/unpack200.1|jdk8u282-b08/man/man1/pack200.1|jdk8u282-b08/man/man1/jps.1|jdk8u282-b08/man/man1/jhat.1|jdk8u282-b08/man/man1/javac.1|jdk8u282-b08/man/man1/keytool.1|jdk8u282-b08/man/man1/schemagen.1|jdk8u282-b08/man/man1/serialver.1|jdk8u282-b08/man/man1/rmid.1|jdk8u282-b08/man/ja|jdk8u282-b08/bin/|jdk8u282-b08/bin/rmic|jdk8u282-b08/bin/appletviewer|jdk8u282-b08/bin/jcmd|jdk8u282-b08/bin/extcheck|jdk8u282-b08/bin/rmid|jdk8u282-b08/bin/jjs|jdk8u282-b08/bin/java-rmi.cgi|jdk8u282-b08/bin/jdeps|jdk8u282-b08/bin/jstat|jdk8u282-b08/bin/jdb|jdk8u282-b08/bin/jps|jdk8u282-b08/bin/xjc|jdk8u282-b08/bin/jstack|jdk8u282-b08/bin/jinfo|jdk8u282-b08/bin/jsadebugd|jdk8u282-b08/bin/clhsdb|jdk8u282-b08/bin/javap|jdk8u282-b08/bin/java|jdk8u282-b08/bin/schemagen|jdk8u282-b08/bin/jstatd|jdk8u282-b08/bin/jfr|jdk8u282-b08/bin/rmiregistry|jdk8u282-b08/bin/native2ascii|jdk8u282-b08/bin/hsdb|jdk8u282-b08/bin/wsimport|jdk8u282-b08/bin/unpack200|jdk8u282-b08/bin/javah|jdk8u282-b08/bin/jar|jdk8u282-b08/bin/tnameserv|jdk8u282-b08/bin/jarsigner|jdk8u282-b08/bin/jmap|jdk8u282-b08/bin/servertool|jdk8u282-b08/bin/jrunscript|jdk8u282-b08/bin/jconsole|jdk8u282-b08/bin/javac|jdk8u282-b08/bin/wsgen|jdk8u282-b08/bin/jhat|jdk8u282-b08/bin/idlj|jdk8u282-b08/bin/policytool|jdk8u282-b08/bin/keytool|jdk8u282-b08/bin/serialver|jdk8u282-b08/bin/orbd|jdk8u282-b08/bin/javadoc|jdk8u282-b08/bin/pack200|jdk8u282-b08/release|jdk8u282-b08/ASSEMBLY_EXCEPTION|jdk8u282-b08/lib/|jdk8u282-b08/lib/tools.jar|jdk8u282-b08/lib/aarch64/|jdk8u282-b08/lib/aarch64/libjawt.so|jdk8u282-b08/lib/aarch64/jli/|jdk8u282-b08/lib/aarch64/jli/libjli.so|jdk8u282-b08/lib/orb.idl|jdk8u282-b08/lib/sa-jdi.jar|jdk8u282-b08/lib/dt.jar|jdk8u282-b08/lib/ct.sym|jdk8u282-b08/lib/jexec|jdk8u282-b08/lib/ir.idl|jdk8u282-b08/lib/jconsole.jar|jdk8u282-b08/sample/|jdk8u282-b08/sample/nbproject/|jdk8u282-b08/sample/nbproject/project.xml|jdk8u282-b08/sample/forkjoin/|jdk8u282-b08/sample/forkjoin/mergesort/|jdk8u282-b08/sample/forkjoin/mergesort/MergeSort.java|jdk8u282-b08/sample/forkjoin/mergesort/MergeDemo.java|jdk8u282-b08/sample/scripting/|jdk8u282-b08/sample/scripting/scriptpad/|jdk8u282-b08/sample/scripting/scriptpad/nbproject/|jdk8u282-b08/sample/scripting/scriptpad/nbproject/jdk.xml|jdk8u282-b08/sample/scripting/scriptpad/nbproject/project.xml|jdk8u282-b08/sample/scripting/scriptpad/nbproject/netbeans-targets.xml|jdk8u282-b08/sample/scripting/scriptpad/nbproject/file-targets.xml|jdk8u282-b08/sample/scripting/scriptpad/src/|jdk8u282-b08/sample/scripting/scriptpad/src/com/|jdk8u282-b08/sample/scripting/scriptpad/src/com/sun/|jdk8u282-b08/sample/scripting/scriptpad/src/com/sun/sample/|jdk8u282-b08/sample/scripting/scriptpad/src/com/sun/sample/scriptpad/|jdk8u282-b08/sample/scripting/scriptpad/src/com/sun/sample/scriptpad/Main.java|jdk8u282-b08/sample/scripting/scriptpad/src/META-INF/|jdk8u282-b08/sample/scripting/scriptpad/src/META-INF/manifest.mf|jdk8u282-b08/sample/scripting/scriptpad/src/resources/|jdk8u282-b08/sample/scripting/scriptpad/src/resources/conc.js|jdk8u282-b08/sample/scripting/scriptpad/src/resources/mm.js|jdk8u282-b08/sample/scripting/scriptpad/src/resources/scriptpad.js|jdk8u282-b08/sample/scripting/scriptpad/src/resources/Main.js|jdk8u282-b08/sample/scripting/scriptpad/src/resources/gui.js|jdk8u282-b08/sample/scripting/scriptpad/src/scripts/|jdk8u282-b08/sample/scripting/scriptpad/src/scripts/mail.js|jdk8u282-b08/sample/scripting/scriptpad/src/scripts/insertfile.js|jdk8u282-b08/sample/scripting/scriptpad/src/scripts/memory.bat|jdk8u282-b08/sample/scripting/scriptpad/src/scripts/memory.js|jdk8u282-b08/sample/scripting/scriptpad/src/scripts/linewrap.js|jdk8u282-b08/sample/scripting/scriptpad/src/scripts/memmonitor.js|jdk8u282-b08/sample/scripting/scriptpad/src/scripts/memory.sh|jdk8u282-b08/sample/scripting/scriptpad/src/scripts/textcolor.js|jdk8u282-b08/sample/scripting/scriptpad/src/scripts/browse.js|jdk8u282-b08/sample/scripting/scriptpad/src/scripts/README.txt|jdk8u282-b08/sample/scripting/scriptpad/README.txt|jdk8u282-b08/sample/scripting/scriptpad/build.properties|jdk8u282-b08/sample/scripting/scriptpad/build.xml|jdk8u282-b08/sample/try-with-resources/|jdk8u282-b08/sample/try-with-resources/index.html|jdk8u282-b08/sample/try-with-resources/src/|jdk8u282-b08/sample/try-with-resources/src/ZipCat.java|jdk8u282-b08/sample/try-with-resources/src/Unzip.java|jdk8u282-b08/sample/try-with-resources/src/CustomAutoCloseableSample.java|jdk8u282-b08/sample/jmx/|jdk8u282-b08/sample/jmx/jmx-scandir/|jdk8u282-b08/sample/jmx/jmx-scandir/index.html|jdk8u282-b08/sample/jmx/jmx-scandir/docfiles/|jdk8u282-b08/sample/jmx/jmx-scandir/docfiles/scandir-start.jpg|jdk8u282-b08/sample/jmx/jmx-scandir/docfiles/scandir-config.jpg|jdk8u282-b08/sample/jmx/jmx-scandir/docfiles/scandir-result.jpg|jdk8u282-b08/sample/jmx/jmx-scandir/docfiles/remote-connection-failed.jpg|jdk8u282-b08/sample/jmx/jmx-scandir/docfiles/connect-local.jpg|jdk8u282-b08/sample/jmx/jmx-scandir/docfiles/connect-local-ant-run.jpg|jdk8u282-b08/sample/jmx/jmx-scandir/docfiles/connect-local-java-jar.jpg|jdk8u282-b08/sample/jmx/jmx-scandir/docfiles/remote-connection.jpg|jdk8u282-b08/sample/jmx/jmx-scandir/nbproject/|jdk8u282-b08/sample/jmx/jmx-scandir/nbproject/jdk.xml|jdk8u282-b08/sample/jmx/jmx-scandir/nbproject/project.xml|jdk8u282-b08/sample/jmx/jmx-scandir/nbproject/netbeans-targets.xml|jdk8u282-b08/sample/jmx/jmx-scandir/nbproject/file-targets.xml|jdk8u282-b08/sample/jmx/jmx-scandir/manifest.mf|jdk8u282-b08/sample/jmx/jmx-scandir/keystore|jdk8u282-b08/sample/jmx/jmx-scandir/src/|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/DirectoryScannerMXBean.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ResultLogManagerMXBean.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/package.html|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ScanManager.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ResultLogManager.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/DirectoryScannerConfig.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/package.html|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/FileMatch.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/ScanManagerConfig.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/ResultRecord.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/ResultLogConfig.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/XmlConfigUtils.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ScanDirAgent.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ScanDirConfigMXBean.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/DirectoryScanner.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ScanDirConfig.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ScanManagerMXBean.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ScanDirClient.java|jdk8u282-b08/sample/jmx/jmx-scandir/src/etc/|jdk8u282-b08/sample/jmx/jmx-scandir/src/etc/management.properties|jdk8u282-b08/sample/jmx/jmx-scandir/src/etc/testconfig.xml|jdk8u282-b08/sample/jmx/jmx-scandir/src/etc/password.properties|jdk8u282-b08/sample/jmx/jmx-scandir/src/etc/access.properties|jdk8u282-b08/sample/jmx/jmx-scandir/test/|jdk8u282-b08/sample/jmx/jmx-scandir/test/com/|jdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/|jdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/|jdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/|jdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/scandir/|jdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/scandir/ScanManagerTest.java|jdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/scandir/DirectoryScannerTest.java|jdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/scandir/config/|jdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/scandir/config/XmlConfigUtilsTest.java|jdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/scandir/TestUtils.java|jdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/scandir/ScanDirConfigTest.java|jdk8u282-b08/sample/jmx/jmx-scandir/logging.properties|jdk8u282-b08/sample/jmx/jmx-scandir/truststore|jdk8u282-b08/sample/jmx/jmx-scandir/build.properties|jdk8u282-b08/sample/jmx/jmx-scandir/build.xml|jdk8u282-b08/sample/nio/|jdk8u282-b08/sample/nio/chatserver/|jdk8u282-b08/sample/nio/chatserver/NameReader.java|jdk8u282-b08/sample/nio/chatserver/MessageReader.java|jdk8u282-b08/sample/nio/chatserver/Client.java|jdk8u282-b08/sample/nio/chatserver/DataReader.java|jdk8u282-b08/sample/nio/chatserver/README.txt|jdk8u282-b08/sample/nio/chatserver/ChatServer.java|jdk8u282-b08/sample/nio/chatserver/ClientReader.java|jdk8u282-b08/sample/nio/server/|jdk8u282-b08/sample/nio/server/Content.java|jdk8u282-b08/sample/nio/server/BP.java|jdk8u282-b08/sample/nio/server/Server.java|jdk8u282-b08/sample/nio/server/Acceptor.java|jdk8u282-b08/sample/nio/server/N2.java|jdk8u282-b08/sample/nio/server/AcceptHandler.java|jdk8u282-b08/sample/nio/server/Sendable.java|jdk8u282-b08/sample/nio/server/MalformedRequestException.java|jdk8u282-b08/sample/nio/server/B1.java|jdk8u282-b08/sample/nio/server/N1.java|jdk8u282-b08/sample/nio/server/RequestHandler.java|jdk8u282-b08/sample/nio/server/ChannelIO.java|jdk8u282-b08/sample/nio/server/DispatcherN.java|jdk8u282-b08/sample/nio/server/Dispatcher1.java|jdk8u282-b08/sample/nio/server/Handler.java|jdk8u282-b08/sample/nio/server/BN.java|jdk8u282-b08/sample/nio/server/StringContent.java|jdk8u282-b08/sample/nio/server/Reply.java|jdk8u282-b08/sample/nio/server/Dispatcher.java|jdk8u282-b08/sample/nio/server/FileContent.java|jdk8u282-b08/sample/nio/server/RequestServicer.java|jdk8u282-b08/sample/nio/server/README.txt|jdk8u282-b08/sample/nio/server/Request.java|jdk8u282-b08/sample/nio/server/URLDumper.java|jdk8u282-b08/sample/nio/server/ChannelIOSecure.java|jdk8u282-b08/sample/nio/multicast/|jdk8u282-b08/sample/nio/multicast/Sender.java|jdk8u282-b08/sample/nio/multicast/Reader.java|jdk8u282-b08/sample/nio/multicast/MulticastAddress.java|jdk8u282-b08/sample/nio/file/|jdk8u282-b08/sample/nio/file/Copy.java|jdk8u282-b08/sample/nio/file/WatchDir.java|jdk8u282-b08/sample/nio/file/AclEdit.java|jdk8u282-b08/sample/nio/file/FileType.java|jdk8u282-b08/sample/nio/file/Chmod.java|jdk8u282-b08/sample/nio/file/Xdd.java|jdk8u282-b08/sample/nio/file/DiskUsage.java|jdk8u282-b08/sample/lambda/|jdk8u282-b08/sample/lambda/BulkDataOperations/|jdk8u282-b08/sample/lambda/BulkDataOperations/index.html|jdk8u282-b08/sample/lambda/BulkDataOperations/src/|jdk8u282-b08/sample/lambda/BulkDataOperations/src/WC.java|jdk8u282-b08/sample/lambda/BulkDataOperations/src/PasswordGenerator.java|jdk8u282-b08/sample/lambda/BulkDataOperations/src/Grep.java|jdk8u282-b08/sample/lambda/BulkDataOperations/src/CSVProcessor.java|jdk8u282-b08/sample/lambda/DefaultMethods/|jdk8u282-b08/sample/lambda/DefaultMethods/Inheritance.java|jdk8u282-b08/sample/lambda/DefaultMethods/Reflection.java|jdk8u282-b08/sample/lambda/DefaultMethods/ArrayIterator.java|jdk8u282-b08/sample/lambda/DefaultMethods/SimplestUsage.java|jdk8u282-b08/sample/lambda/DefaultMethods/DiamondInheritance.java|jdk8u282-b08/sample/lambda/DefaultMethods/MixIn.java|jdk8u282-b08/sample/annotations/|jdk8u282-b08/sample/annotations/index.html|jdk8u282-b08/sample/annotations/DependencyChecker/|jdk8u282-b08/sample/annotations/DependencyChecker/Plugins/|jdk8u282-b08/sample/annotations/DependencyChecker/Plugins/src/|jdk8u282-b08/sample/annotations/DependencyChecker/Plugins/src/plugins/|jdk8u282-b08/sample/annotations/DependencyChecker/Plugins/src/plugins/ExtendedBoilerPlugin.java|jdk8u282-b08/sample/annotations/DependencyChecker/Plugins/src/plugins/TimerPlugin.java|jdk8u282-b08/sample/annotations/DependencyChecker/Plugins/src/plugins/BoilerPlugin.java|jdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/|jdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/|jdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/checker/|jdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/checker/Module.java|jdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/checker/PluginChecker.java|jdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/checker/Device.java|jdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/checker/Require.java|jdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/checker/Kettle.xml|jdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/checker/RequireContainer.java|jdk8u282-b08/sample/annotations/Validator/|jdk8u282-b08/sample/annotations/Validator/src/|jdk8u282-b08/sample/annotations/Validator/src/PositiveIntegerSupplier.java|jdk8u282-b08/sample/annotations/Validator/src/SupplierValidator.java|jdk8u282-b08/sample/annotations/Validator/src/Validator.java|jdk8u282-b08/sample/annotations/Validator/src/Validate.java|jdk8u282-b08/sample/README|jdk8u282-b08/LICENSE|jdk8u282-b08/THIRD_PARTY_README|jdk8u282-b08/include/|jdk8u282-b08/include/jawt.h|jdk8u282-b08/include/jni.h|jdk8u282-b08/include/classfile_constants.h|jdk8u282-b08/include/jvmticmlr.h|jdk8u282-b08/include/jdwpTransport.h|jdk8u282-b08/include/jvmti.h|jdk8u282-b08/include/linux/|jdk8u282-b08/include/linux/jni_md.h|jdk8u282-b08/include/linux/jawt_md.h|jdk8u282-b08/src.zip|apache-maven-3.6.3/README.txt|apache-maven-3.6.3/LICENSE|apache-maven-3.6.3/NOTICE|apache-maven-3.6.3/lib/|apache-maven-3.6.3/lib/cdi-api.license|apache-maven-3.6.3/lib/commons-cli.license|apache-maven-3.6.3/lib/commons-io.license|apache-maven-3.6.3/lib/commons-lang3.license|apache-maven-3.6.3/lib/guava.license|apache-maven-3.6.3/lib/guice.license|apache-maven-3.6.3/lib/jansi.license|apache-maven-3.6.3/lib/javax.inject.license|apache-maven-3.6.3/lib/jcl-over-slf4j.license|apache-maven-3.6.3/lib/jsoup.license|apache-maven-3.6.3/lib/jsr250-api.license|apache-maven-3.6.3/lib/org.eclipse.sisu.inject.license|apache-maven-3.6.3/lib/org.eclipse.sisu.plexus.license|apache-maven-3.6.3/lib/plexus-cipher.license|apache-maven-3.6.3/lib/plexus-component-annotations.license|apache-maven-3.6.3/lib/plexus-interpolation.license|apache-maven-3.6.3/lib/plexus-sec-dispatcher.license|apache-maven-3.6.3/lib/plexus-utils.license|apache-maven-3.6.3/lib/slf4j-api.license|apache-maven-3.6.3/boot/|apache-maven-3.6.3/boot/plexus-classworlds.license|apache-maven-3.6.3/lib/jansi-native/|apache-maven-3.6.3/lib/jansi-native/freebsd32/|apache-maven-3.6.3/lib/jansi-native/freebsd64/|apache-maven-3.6.3/lib/jansi-native/linux32/|apache-maven-3.6.3/lib/jansi-native/linux64/|apache-maven-3.6.3/lib/jansi-native/osx/|apache-maven-3.6.3/lib/jansi-native/windows32/|apache-maven-3.6.3/lib/jansi-native/windows64/|apache-maven-3.6.3/lib/jansi-native/freebsd32/libjansi.so|apache-maven-3.6.3/lib/jansi-native/freebsd64/libjansi.so|apache-maven-3.6.3/lib/jansi-native/linux32/libjansi.so|apache-maven-3.6.3/lib/jansi-native/linux64/libjansi.so|apache-maven-3.6.3/lib/jansi-native/osx/libjansi.jnilib|apache-maven-3.6.3/lib/jansi-native/windows32/jansi.dll|apache-maven-3.6.3/lib/jansi-native/windows64/jansi.dll|apache-maven-3.6.3/bin/m2.conf|apache-maven-3.6.3/bin/mvn.cmd|apache-maven-3.6.3/bin/mvnDebug.cmd|apache-maven-3.6.3/bin/mvn|apache-maven-3.6.3/bin/mvnDebug|apache-maven-3.6.3/bin/mvnyjp|apache-maven-3.6.3/conf/|apache-maven-3.6.3/conf/logging/|apache-maven-3.6.3/conf/logging/simplelogger.properties|apache-maven-3.6.3/conf/settings.xml|apache-maven-3.6.3/conf/toolchains.xml|apache-maven-3.6.3/lib/ext/|apache-maven-3.6.3/lib/jansi-native/|apache-maven-3.6.3/lib/ext/README.txt|apache-maven-3.6.3/lib/jansi-native/README.txt|apache-maven-3.6.3/boot/plexus-classworlds-2.6.0.jar|apache-maven-3.6.3/lib/maven-embedder-3.6.3.jar|apache-maven-3.6.3/lib/maven-settings-3.6.3.jar|apache-maven-3.6.3/lib/maven-settings-builder-3.6.3.jar|apache-maven-3.6.3/lib/maven-plugin-api-3.6.3.jar|apache-maven-3.6.3/lib/maven-model-3.6.3.jar|apache-maven-3.6.3/lib/maven-model-builder-3.6.3.jar|apache-maven-3.6.3/lib/maven-builder-support-3.6.3.jar|apache-maven-3.6.3/lib/maven-resolver-api-1.4.1.jar|apache-maven-3.6.3/lib/maven-resolver-util-1.4.1.jar|apache-maven-3.6.3/lib/maven-shared-utils-3.2.1.jar|apache-maven-3.6.3/lib/commons-io-2.5.jar|apache-maven-3.6.3/lib/guice-4.2.1-no_aop.jar|apache-maven-3.6.3/lib/guava-25.1-android.jar|apache-maven-3.6.3/lib/javax.inject-1.jar|apache-maven-3.6.3/lib/jsr250-api-1.0.jar|apache-maven-3.6.3/lib/plexus-utils-3.2.1.jar|apache-maven-3.6.3/lib/plexus-sec-dispatcher-1.4.jar|apache-maven-3.6.3/lib/plexus-cipher-1.7.jar|apache-maven-3.6.3/lib/slf4j-api-1.7.29.jar|apache-maven-3.6.3/lib/commons-lang3-3.8.1.jar|apache-maven-3.6.3/lib/maven-core-3.6.3.jar|apache-maven-3.6.3/lib/maven-repository-metadata-3.6.3.jar|apache-maven-3.6.3/lib/maven-artifact-3.6.3.jar|apache-maven-3.6.3/lib/maven-resolver-provider-3.6.3.jar|apache-maven-3.6.3/lib/maven-resolver-impl-1.4.1.jar|apache-maven-3.6.3/lib/maven-resolver-spi-1.4.1.jar|apache-maven-3.6.3/lib/org.eclipse.sisu.inject-0.3.4.jar|apache-maven-3.6.3/lib/plexus-component-annotations-2.1.0.jar|apache-maven-3.6.3/lib/maven-compat-3.6.3.jar|apache-maven-3.6.3/lib/plexus-interpolation-1.25.jar|apache-maven-3.6.3/lib/wagon-provider-api-3.3.4.jar|apache-maven-3.6.3/lib/org.eclipse.sisu.plexus-0.3.4.jar|apache-maven-3.6.3/lib/cdi-api-1.0.jar|apache-maven-3.6.3/lib/commons-cli-1.4.jar|apache-maven-3.6.3/lib/wagon-http-3.3.4-shaded.jar|apache-maven-3.6.3/lib/jsoup-1.12.1.jar|apache-maven-3.6.3/lib/jcl-over-slf4j-1.7.29.jar|apache-maven-3.6.3/lib/wagon-file-3.3.4.jar|apache-maven-3.6.3/lib/maven-resolver-connector-basic-1.4.1.jar|apache-maven-3.6.3/lib/maven-resolver-transport-wagon-1.4.1.jar|apache-maven-3.6.3/lib/maven-slf4j-provider-3.6.3.jar|apache-maven-3.6.3/lib/jansi-1.17.1.jar|openjdk version \"1.8.0_282\"|OpenJDK Runtime Environment (build 1.8.0_282-b08)|OpenJDK 64-Bit Server VM (build 25.282-b08, mixed mode)|\u001B[1mApache Maven 3.6.3 (cecedd343002696d0abb50b32b541b8a6ba2883f)\u001B[m|Maven home: /usr/local/apache-maven-3.6.3|Java version: 1.8.0_282, vendor: AdoptOpenJDK, runtime: /usr/local/jdk8u282-b08/jre|Default locale: en_US, platform encoding: UTF-8|OS name: \"linux\", version: \"4.19.90-2012.4.0.0053.oe1.aarch64\", arch: \"aarch64\", family: \"unix\"|[2023-03-21 07:56:23][WARN]------------Configure compile node environment end------------|[root@ceph1 ~]# |[root@ceph1 ~]# exit|logout|初始化成功|", // 安装日志信息
      isEnd: true,
    }
  }
})

// （四）健康监控视图
// getHealthInfo
Mock.mock('http://localhost:8899/getHealthInfo','post',(req) => {
  let healthInfo = []
  for(let i=0;i<150;i++) {
    healthInfo.push({
      abnType: ( Math.floor(Math.random() * 50)%2 === 0 ? 'LogSystem': 'Disk' ), // 异常类型
      abnLevel: ( Math.floor(Math.random() * 20)%2 === 0 ? 'WARN' : 'ERROR' ), // 异常等级
      abnDetails: ( Math.floor(Math.random() * 20)%2 === 0 ?  '日志文件打开失败' : 'Disk1 pool 容量已满' ), // 异常详情
      abnTime: '2022.10.20 09:18' // 时间
    })
  }
  return {
    data:{
      healthInfo: healthInfo, // 健康信息
      clusterState: (Math.floor(Math.random()*15)%2 === 0 ? true: false) // 集群总体状态
    }
  }
})

// getHealthInfoNum
Mock.mock('http://localhost:8899/getHealthInfoNum','post',(req) => {
  return {
    data:{
      healthInfoNum: Math.floor(Math.random()*100) // 0~100内随机数
    }
  }
})