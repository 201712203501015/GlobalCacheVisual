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
      isFinished: false // 是否完成自动化部署
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
          remoteIPv4: '192.156.23.3',
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
                name: 'SDE',
                type: 'SD'
            }
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
          remoteIPv4: '192.56.33.2',
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
          remoteIPv4: '192.56.37.8',
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
          remoteIPv4: '192.56.39.8',
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
          remoteIPv4: '192.77.37.8',
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
      // 返回数据的角色信息
      ceph: true,
      client: false,
      ceph1: false,
      roleName: 'ceph4',
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
      pubMask: '192.168.1.1',
      cluMask: '192.168.1.2',
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
      pubMask: '192.168.1.1',
      cluMask: '192.168.1.2',
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
      installLogInfo: "Last login: Tue Mar 21 06:49:40 2023 from 192.168.101.33\n\nbash /home/GlobalCacheScriptsNew/envs/configure/compile/configure_compile_env.sh \n\nexit\n\n\n\nWelcome to 4.19.90-2012.4.0.0053.oe1.aarch64\n\nSystem information as of time: \tTue Mar 21 07:56:21 CST 2023\n\nSystem load: \t\u001B[0;33;40m0.79\u001B[0m\nProcesses: \t1170\nMemory used: \t51.6%\nSwap used: \t0.0%\nUsage On: \t29%\nIP address: \t175.34.8.36\nUsers online: \t1\n\n\n\n[root@ceph1 ~]# bash /home/GlobalCacheScriptsNew/envs/configure/compile/configure_compile_env.sh \n[2023-03-21 07:56:21][WARN]------------Configure compile node environment start------------\njdk8u282-b08/\njdk8u282-b08/jre/\njdk8u282-b08/jre/bin/\njdk8u282-b08/jre/bin/rmid\njdk8u282-b08/jre/bin/jjs\njdk8u282-b08/jre/bin/java\njdk8u282-b08/jre/bin/rmiregistry\njdk8u282-b08/jre/bin/unpack200\njdk8u282-b08/jre/bin/tnameserv\njdk8u282-b08/jre/bin/servertool\njdk8u282-b08/jre/bin/policytool\njdk8u282-b08/jre/bin/keytool\njdk8u282-b08/jre/bin/orbd\njdk8u282-b08/jre/bin/pack200\njdk8u282-b08/jre/ASSEMBLY_EXCEPTION\njdk8u282-b08/jre/lib/\njdk8u282-b08/jre/lib/charsets.jar\njdk8u282-b08/jre/lib/tzdb.dat\njdk8u282-b08/jre/lib/content-types.properties\njdk8u282-b08/jre/lib/jfr.jar\njdk8u282-b08/jre/lib/ext/\njdk8u282-b08/jre/lib/ext/jaccess.jar\njdk8u282-b08/jre/lib/ext/sunpkcs11.jar\njdk8u282-b08/jre/lib/ext/zipfs.jar\njdk8u282-b08/jre/lib/ext/dnsns.jar\njdk8u282-b08/jre/lib/ext/sunjce_provider.jar\njdk8u282-b08/jre/lib/ext/meta-index\njdk8u282-b08/jre/lib/ext/nashorn.jar\njdk8u282-b08/jre/lib/ext/sunec.jar\njdk8u282-b08/jre/lib/ext/localedata.jar\njdk8u282-b08/jre/lib/ext/cldrdata.jar\njdk8u282-b08/jre/lib/jvm.hprof.txt\njdk8u282-b08/jre/lib/psfont.properties.ja\njdk8u282-b08/jre/lib/aarch64/\njdk8u282-b08/jre/lib/aarch64/libattach.so\njdk8u282-b08/jre/lib/aarch64/libnio.so\njdk8u282-b08/jre/lib/aarch64/libsaproc.so\njdk8u282-b08/jre/lib/aarch64/libjawt.so\njdk8u282-b08/jre/lib/aarch64/libsplashscreen.so\njdk8u282-b08/jre/lib/aarch64/jli/\njdk8u282-b08/jre/lib/aarch64/jli/libjli.so\njdk8u282-b08/jre/lib/aarch64/libfontmanager.so\njdk8u282-b08/jre/lib/aarch64/libverify.so\njdk8u282-b08/jre/lib/aarch64/server/\njdk8u282-b08/jre/lib/aarch64/server/Xusage.txt\njdk8u282-b08/jre/lib/aarch64/server/libjsig.so\njdk8u282-b08/jre/lib/aarch64/server/libjvm.so\njdk8u282-b08/jre/lib/aarch64/libawt_xawt.so\njdk8u282-b08/jre/lib/aarch64/libsctp.so\njdk8u282-b08/jre/lib/aarch64/libj2pkcs11.so\njdk8u282-b08/jre/lib/aarch64/libjsig.so\njdk8u282-b08/jre/lib/aarch64/libmanagement.so\njdk8u282-b08/jre/lib/aarch64/libj2gss.so\njdk8u282-b08/jre/lib/aarch64/libjsound.so\njdk8u282-b08/jre/lib/aarch64/libmlib_image.so\njdk8u282-b08/jre/lib/aarch64/jvm.cfg\njdk8u282-b08/jre/lib/aarch64/libawt_headless.so\njdk8u282-b08/jre/lib/aarch64/libjpeg.so\njdk8u282-b08/jre/lib/aarch64/libinstrument.so\njdk8u282-b08/jre/lib/aarch64/libjdwp.so\njdk8u282-b08/jre/lib/aarch64/libawt.so\njdk8u282-b08/jre/lib/aarch64/libnpt.so\njdk8u282-b08/jre/lib/aarch64/libjsdt.so\njdk8u282-b08/jre/lib/aarch64/libjava_crw_demo.so\njdk8u282-b08/jre/lib/aarch64/libzip.so\njdk8u282-b08/jre/lib/aarch64/libjava.so\njdk8u282-b08/jre/lib/aarch64/libj2pcsc.so\njdk8u282-b08/jre/lib/aarch64/libjaas_unix.so\njdk8u282-b08/jre/lib/aarch64/libdt_socket.so\njdk8u282-b08/jre/lib/aarch64/libsunec.so\njdk8u282-b08/jre/lib/aarch64/libhprof.so\njdk8u282-b08/jre/lib/aarch64/libunpack.so\njdk8u282-b08/jre/lib/aarch64/libjsoundalsa.so\njdk8u282-b08/jre/lib/aarch64/liblcms.so\njdk8u282-b08/jre/lib/aarch64/libnet.so\njdk8u282-b08/jre/lib/security/\njdk8u282-b08/jre/lib/security/cacerts\njdk8u282-b08/jre/lib/security/java.policy\njdk8u282-b08/jre/lib/security/policy/\njdk8u282-b08/jre/lib/security/policy/unlimited/\njdk8u282-b08/jre/lib/security/policy/unlimited/local_policy.jar\njdk8u282-b08/jre/lib/security/policy/unlimited/US_export_policy.jar\njdk8u282-b08/jre/lib/security/policy/limited/\njdk8u282-b08/jre/lib/security/policy/limited/local_policy.jar\njdk8u282-b08/jre/lib/security/policy/limited/US_export_policy.jar\njdk8u282-b08/jre/lib/security/blacklisted.certs\njdk8u282-b08/jre/lib/security/java.security\njdk8u282-b08/jre/lib/jsse.jar\njdk8u282-b08/jre/lib/images/\njdk8u282-b08/jre/lib/images/cursors/\njdk8u282-b08/jre/lib/images/cursors/motif_CopyNoDrop32x32.gif\njdk8u282-b08/jre/lib/images/cursors/motif_LinkNoDrop32x32.gif\njdk8u282-b08/jre/lib/images/cursors/invalid32x32.gif\njdk8u282-b08/jre/lib/images/cursors/cursors.properties\njdk8u282-b08/jre/lib/images/cursors/motif_MoveNoDrop32x32.gif\njdk8u282-b08/jre/lib/images/cursors/motif_MoveDrop32x32.gif\njdk8u282-b08/jre/lib/images/cursors/motif_CopyDrop32x32.gif\njdk8u282-b08/jre/lib/images/cursors/motif_LinkDrop32x32.gif\njdk8u282-b08/jre/lib/resources.jar\njdk8u282-b08/jre/lib/jfr/\njdk8u282-b08/jre/lib/jfr/profile.jfc\njdk8u282-b08/jre/lib/jfr/default.jfc\njdk8u282-b08/jre/lib/cmm/\njdk8u282-b08/jre/lib/cmm/CIEXYZ.pf\njdk8u282-b08/jre/lib/cmm/LINEAR_RGB.pf\njdk8u282-b08/jre/lib/cmm/GRAY.pf\njdk8u282-b08/jre/lib/cmm/sRGB.pf\njdk8u282-b08/jre/lib/cmm/PYCC.pf\njdk8u282-b08/jre/lib/hijrah-config-umalqura.properties\njdk8u282-b08/jre/lib/jexec\njdk8u282-b08/jre/lib/currency.data\njdk8u282-b08/jre/lib/psfontj2d.properties\njdk8u282-b08/jre/lib/logging.properties\njdk8u282-b08/jre/lib/rt.jar\njdk8u282-b08/jre/lib/jce.jar\njdk8u282-b08/jre/lib/meta-index\njdk8u282-b08/jre/lib/management-agent.jar\njdk8u282-b08/jre/lib/management/\njdk8u282-b08/jre/lib/management/management.properties\njdk8u282-b08/jre/lib/management/jmxremote.access\njdk8u282-b08/jre/lib/management/snmp.acl.template\njdk8u282-b08/jre/lib/management/jmxremote.password.template\njdk8u282-b08/jre/lib/applet/\njdk8u282-b08/jre/lib/classlist\njdk8u282-b08/jre/lib/sound.properties\njdk8u282-b08/jre/lib/calendars.properties\njdk8u282-b08/jre/lib/net.properties\njdk8u282-b08/jre/lib/flavormap.properties\njdk8u282-b08/jre/LICENSE\njdk8u282-b08/jre/THIRD_PARTY_README\njdk8u282-b08/man/\njdk8u282-b08/man/ja_JP.UTF-8/\njdk8u282-b08/man/ja_JP.UTF-8/man1/\njdk8u282-b08/man/ja_JP.UTF-8/man1/rmiregistry.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jar.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/orbd.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jjs.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jstatd.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/javadoc.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/java.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/extcheck.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jrunscript.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jdeps.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/rmic.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/native2ascii.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/wsimport.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/javap.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jinfo.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jconsole.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jarsigner.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jmap.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jcmd.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jdb.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jstack.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jstat.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/xjc.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/wsgen.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jsadebugd.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/javah.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/servertool.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/appletviewer.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/policytool.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/tnameserv.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/idlj.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/unpack200.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/pack200.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jps.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/jhat.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/javac.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/keytool.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/schemagen.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/serialver.1\njdk8u282-b08/man/ja_JP.UTF-8/man1/rmid.1\njdk8u282-b08/man/man1/\njdk8u282-b08/man/man1/rmiregistry.1\njdk8u282-b08/man/man1/jar.1\njdk8u282-b08/man/man1/orbd.1\njdk8u282-b08/man/man1/jjs.1\njdk8u282-b08/man/man1/jstatd.1\njdk8u282-b08/man/man1/javadoc.1\njdk8u282-b08/man/man1/java.1\njdk8u282-b08/man/man1/extcheck.1\njdk8u282-b08/man/man1/jrunscript.1\njdk8u282-b08/man/man1/jdeps.1\njdk8u282-b08/man/man1/rmic.1\njdk8u282-b08/man/man1/native2ascii.1\njdk8u282-b08/man/man1/wsimport.1\njdk8u282-b08/man/man1/javap.1\njdk8u282-b08/man/man1/jinfo.1\njdk8u282-b08/man/man1/jconsole.1\njdk8u282-b08/man/man1/jarsigner.1\njdk8u282-b08/man/man1/jmap.1\njdk8u282-b08/man/man1/jcmd.1\njdk8u282-b08/man/man1/jdb.1\njdk8u282-b08/man/man1/jstack.1\njdk8u282-b08/man/man1/jstat.1\njdk8u282-b08/man/man1/xjc.1\njdk8u282-b08/man/man1/wsgen.1\njdk8u282-b08/man/man1/jsadebugd.1\njdk8u282-b08/man/man1/javah.1\njdk8u282-b08/man/man1/servertool.1\njdk8u282-b08/man/man1/appletviewer.1\njdk8u282-b08/man/man1/policytool.1\njdk8u282-b08/man/man1/tnameserv.1\njdk8u282-b08/man/man1/idlj.1\njdk8u282-b08/man/man1/unpack200.1\njdk8u282-b08/man/man1/pack200.1\njdk8u282-b08/man/man1/jps.1\njdk8u282-b08/man/man1/jhat.1\njdk8u282-b08/man/man1/javac.1\njdk8u282-b08/man/man1/keytool.1\njdk8u282-b08/man/man1/schemagen.1\njdk8u282-b08/man/man1/serialver.1\njdk8u282-b08/man/man1/rmid.1\njdk8u282-b08/man/ja\njdk8u282-b08/bin/\njdk8u282-b08/bin/rmic\njdk8u282-b08/bin/appletviewer\njdk8u282-b08/bin/jcmd\njdk8u282-b08/bin/extcheck\njdk8u282-b08/bin/rmid\njdk8u282-b08/bin/jjs\njdk8u282-b08/bin/java-rmi.cgi\njdk8u282-b08/bin/jdeps\njdk8u282-b08/bin/jstat\njdk8u282-b08/bin/jdb\njdk8u282-b08/bin/jps\njdk8u282-b08/bin/xjc\njdk8u282-b08/bin/jstack\njdk8u282-b08/bin/jinfo\njdk8u282-b08/bin/jsadebugd\njdk8u282-b08/bin/clhsdb\njdk8u282-b08/bin/javap\njdk8u282-b08/bin/java\njdk8u282-b08/bin/schemagen\njdk8u282-b08/bin/jstatd\njdk8u282-b08/bin/jfr\njdk8u282-b08/bin/rmiregistry\njdk8u282-b08/bin/native2ascii\njdk8u282-b08/bin/hsdb\njdk8u282-b08/bin/wsimport\njdk8u282-b08/bin/unpack200\njdk8u282-b08/bin/javah\njdk8u282-b08/bin/jar\njdk8u282-b08/bin/tnameserv\njdk8u282-b08/bin/jarsigner\njdk8u282-b08/bin/jmap\njdk8u282-b08/bin/servertool\njdk8u282-b08/bin/jrunscript\njdk8u282-b08/bin/jconsole\njdk8u282-b08/bin/javac\njdk8u282-b08/bin/wsgen\njdk8u282-b08/bin/jhat\njdk8u282-b08/bin/idlj\njdk8u282-b08/bin/policytool\njdk8u282-b08/bin/keytool\njdk8u282-b08/bin/serialver\njdk8u282-b08/bin/orbd\njdk8u282-b08/bin/javadoc\njdk8u282-b08/bin/pack200\njdk8u282-b08/release\njdk8u282-b08/ASSEMBLY_EXCEPTION\njdk8u282-b08/lib/\njdk8u282-b08/lib/tools.jar\njdk8u282-b08/lib/aarch64/\njdk8u282-b08/lib/aarch64/libjawt.so\njdk8u282-b08/lib/aarch64/jli/\njdk8u282-b08/lib/aarch64/jli/libjli.so\njdk8u282-b08/lib/orb.idl\njdk8u282-b08/lib/sa-jdi.jar\njdk8u282-b08/lib/dt.jar\njdk8u282-b08/lib/ct.sym\njdk8u282-b08/lib/jexec\njdk8u282-b08/lib/ir.idl\njdk8u282-b08/lib/jconsole.jar\njdk8u282-b08/sample/\njdk8u282-b08/sample/nbproject/\njdk8u282-b08/sample/nbproject/project.xml\njdk8u282-b08/sample/forkjoin/\njdk8u282-b08/sample/forkjoin/mergesort/\njdk8u282-b08/sample/forkjoin/mergesort/MergeSort.java\njdk8u282-b08/sample/forkjoin/mergesort/MergeDemo.java\njdk8u282-b08/sample/scripting/\njdk8u282-b08/sample/scripting/scriptpad/\njdk8u282-b08/sample/scripting/scriptpad/nbproject/\njdk8u282-b08/sample/scripting/scriptpad/nbproject/jdk.xml\njdk8u282-b08/sample/scripting/scriptpad/nbproject/project.xml\njdk8u282-b08/sample/scripting/scriptpad/nbproject/netbeans-targets.xml\njdk8u282-b08/sample/scripting/scriptpad/nbproject/file-targets.xml\njdk8u282-b08/sample/scripting/scriptpad/src/\njdk8u282-b08/sample/scripting/scriptpad/src/com/\njdk8u282-b08/sample/scripting/scriptpad/src/com/sun/\njdk8u282-b08/sample/scripting/scriptpad/src/com/sun/sample/\njdk8u282-b08/sample/scripting/scriptpad/src/com/sun/sample/scriptpad/\njdk8u282-b08/sample/scripting/scriptpad/src/com/sun/sample/scriptpad/Main.java\njdk8u282-b08/sample/scripting/scriptpad/src/META-INF/\njdk8u282-b08/sample/scripting/scriptpad/src/META-INF/manifest.mf\njdk8u282-b08/sample/scripting/scriptpad/src/resources/\njdk8u282-b08/sample/scripting/scriptpad/src/resources/conc.js\njdk8u282-b08/sample/scripting/scriptpad/src/resources/mm.js\njdk8u282-b08/sample/scripting/scriptpad/src/resources/scriptpad.js\njdk8u282-b08/sample/scripting/scriptpad/src/resources/Main.js\njdk8u282-b08/sample/scripting/scriptpad/src/resources/gui.js\njdk8u282-b08/sample/scripting/scriptpad/src/scripts/\njdk8u282-b08/sample/scripting/scriptpad/src/scripts/mail.js\njdk8u282-b08/sample/scripting/scriptpad/src/scripts/insertfile.js\njdk8u282-b08/sample/scripting/scriptpad/src/scripts/memory.bat\njdk8u282-b08/sample/scripting/scriptpad/src/scripts/memory.js\njdk8u282-b08/sample/scripting/scriptpad/src/scripts/linewrap.js\njdk8u282-b08/sample/scripting/scriptpad/src/scripts/memmonitor.js\njdk8u282-b08/sample/scripting/scriptpad/src/scripts/memory.sh\njdk8u282-b08/sample/scripting/scriptpad/src/scripts/textcolor.js\njdk8u282-b08/sample/scripting/scriptpad/src/scripts/browse.js\njdk8u282-b08/sample/scripting/scriptpad/src/scripts/README.txt\njdk8u282-b08/sample/scripting/scriptpad/README.txt\njdk8u282-b08/sample/scripting/scriptpad/build.properties\njdk8u282-b08/sample/scripting/scriptpad/build.xml\njdk8u282-b08/sample/try-with-resources/\njdk8u282-b08/sample/try-with-resources/index.html\njdk8u282-b08/sample/try-with-resources/src/\njdk8u282-b08/sample/try-with-resources/src/ZipCat.java\njdk8u282-b08/sample/try-with-resources/src/Unzip.java\njdk8u282-b08/sample/try-with-resources/src/CustomAutoCloseableSample.java\njdk8u282-b08/sample/jmx/\njdk8u282-b08/sample/jmx/jmx-scandir/\njdk8u282-b08/sample/jmx/jmx-scandir/index.html\njdk8u282-b08/sample/jmx/jmx-scandir/docfiles/\njdk8u282-b08/sample/jmx/jmx-scandir/docfiles/scandir-start.jpg\njdk8u282-b08/sample/jmx/jmx-scandir/docfiles/scandir-config.jpg\njdk8u282-b08/sample/jmx/jmx-scandir/docfiles/scandir-result.jpg\njdk8u282-b08/sample/jmx/jmx-scandir/docfiles/remote-connection-failed.jpg\njdk8u282-b08/sample/jmx/jmx-scandir/docfiles/connect-local.jpg\njdk8u282-b08/sample/jmx/jmx-scandir/docfiles/connect-local-ant-run.jpg\njdk8u282-b08/sample/jmx/jmx-scandir/docfiles/connect-local-java-jar.jpg\njdk8u282-b08/sample/jmx/jmx-scandir/docfiles/remote-connection.jpg\njdk8u282-b08/sample/jmx/jmx-scandir/nbproject/\njdk8u282-b08/sample/jmx/jmx-scandir/nbproject/jdk.xml\njdk8u282-b08/sample/jmx/jmx-scandir/nbproject/project.xml\njdk8u282-b08/sample/jmx/jmx-scandir/nbproject/netbeans-targets.xml\njdk8u282-b08/sample/jmx/jmx-scandir/nbproject/file-targets.xml\njdk8u282-b08/sample/jmx/jmx-scandir/manifest.mf\njdk8u282-b08/sample/jmx/jmx-scandir/keystore\njdk8u282-b08/sample/jmx/jmx-scandir/src/\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/DirectoryScannerMXBean.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ResultLogManagerMXBean.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/package.html\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ScanManager.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ResultLogManager.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/DirectoryScannerConfig.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/package.html\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/FileMatch.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/ScanManagerConfig.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/ResultRecord.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/ResultLogConfig.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/config/XmlConfigUtils.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ScanDirAgent.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ScanDirConfigMXBean.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/DirectoryScanner.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ScanDirConfig.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ScanManagerMXBean.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/com/sun/jmx/examples/scandir/ScanDirClient.java\njdk8u282-b08/sample/jmx/jmx-scandir/src/etc/\njdk8u282-b08/sample/jmx/jmx-scandir/src/etc/management.properties\njdk8u282-b08/sample/jmx/jmx-scandir/src/etc/testconfig.xml\njdk8u282-b08/sample/jmx/jmx-scandir/src/etc/password.properties\njdk8u282-b08/sample/jmx/jmx-scandir/src/etc/access.properties\njdk8u282-b08/sample/jmx/jmx-scandir/test/\njdk8u282-b08/sample/jmx/jmx-scandir/test/com/\njdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/\njdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/\njdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/\njdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/scandir/\njdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/scandir/ScanManagerTest.java\njdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/scandir/DirectoryScannerTest.java\njdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/scandir/config/\njdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/scandir/config/XmlConfigUtilsTest.java\njdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/scandir/TestUtils.java\njdk8u282-b08/sample/jmx/jmx-scandir/test/com/sun/jmx/examples/scandir/ScanDirConfigTest.java\njdk8u282-b08/sample/jmx/jmx-scandir/logging.properties\njdk8u282-b08/sample/jmx/jmx-scandir/truststore\njdk8u282-b08/sample/jmx/jmx-scandir/build.properties\njdk8u282-b08/sample/jmx/jmx-scandir/build.xml\njdk8u282-b08/sample/nio/\njdk8u282-b08/sample/nio/chatserver/\njdk8u282-b08/sample/nio/chatserver/NameReader.java\njdk8u282-b08/sample/nio/chatserver/MessageReader.java\njdk8u282-b08/sample/nio/chatserver/Client.java\njdk8u282-b08/sample/nio/chatserver/DataReader.java\njdk8u282-b08/sample/nio/chatserver/README.txt\njdk8u282-b08/sample/nio/chatserver/ChatServer.java\njdk8u282-b08/sample/nio/chatserver/ClientReader.java\njdk8u282-b08/sample/nio/server/\njdk8u282-b08/sample/nio/server/Content.java\njdk8u282-b08/sample/nio/server/BP.java\njdk8u282-b08/sample/nio/server/Server.java\njdk8u282-b08/sample/nio/server/Acceptor.java\njdk8u282-b08/sample/nio/server/N2.java\njdk8u282-b08/sample/nio/server/AcceptHandler.java\njdk8u282-b08/sample/nio/server/Sendable.java\njdk8u282-b08/sample/nio/server/MalformedRequestException.java\njdk8u282-b08/sample/nio/server/B1.java\njdk8u282-b08/sample/nio/server/N1.java\njdk8u282-b08/sample/nio/server/RequestHandler.java\njdk8u282-b08/sample/nio/server/ChannelIO.java\njdk8u282-b08/sample/nio/server/DispatcherN.java\njdk8u282-b08/sample/nio/server/Dispatcher1.java\njdk8u282-b08/sample/nio/server/Handler.java\njdk8u282-b08/sample/nio/server/BN.java\njdk8u282-b08/sample/nio/server/StringContent.java\njdk8u282-b08/sample/nio/server/Reply.java\njdk8u282-b08/sample/nio/server/Dispatcher.java\njdk8u282-b08/sample/nio/server/FileContent.java\njdk8u282-b08/sample/nio/server/RequestServicer.java\njdk8u282-b08/sample/nio/server/README.txt\njdk8u282-b08/sample/nio/server/Request.java\njdk8u282-b08/sample/nio/server/URLDumper.java\njdk8u282-b08/sample/nio/server/ChannelIOSecure.java\njdk8u282-b08/sample/nio/multicast/\njdk8u282-b08/sample/nio/multicast/Sender.java\njdk8u282-b08/sample/nio/multicast/Reader.java\njdk8u282-b08/sample/nio/multicast/MulticastAddress.java\njdk8u282-b08/sample/nio/file/\njdk8u282-b08/sample/nio/file/Copy.java\njdk8u282-b08/sample/nio/file/WatchDir.java\njdk8u282-b08/sample/nio/file/AclEdit.java\njdk8u282-b08/sample/nio/file/FileType.java\njdk8u282-b08/sample/nio/file/Chmod.java\njdk8u282-b08/sample/nio/file/Xdd.java\njdk8u282-b08/sample/nio/file/DiskUsage.java\njdk8u282-b08/sample/lambda/\njdk8u282-b08/sample/lambda/BulkDataOperations/\njdk8u282-b08/sample/lambda/BulkDataOperations/index.html\njdk8u282-b08/sample/lambda/BulkDataOperations/src/\njdk8u282-b08/sample/lambda/BulkDataOperations/src/WC.java\njdk8u282-b08/sample/lambda/BulkDataOperations/src/PasswordGenerator.java\njdk8u282-b08/sample/lambda/BulkDataOperations/src/Grep.java\njdk8u282-b08/sample/lambda/BulkDataOperations/src/CSVProcessor.java\njdk8u282-b08/sample/lambda/DefaultMethods/\njdk8u282-b08/sample/lambda/DefaultMethods/Inheritance.java\njdk8u282-b08/sample/lambda/DefaultMethods/Reflection.java\njdk8u282-b08/sample/lambda/DefaultMethods/ArrayIterator.java\njdk8u282-b08/sample/lambda/DefaultMethods/SimplestUsage.java\njdk8u282-b08/sample/lambda/DefaultMethods/DiamondInheritance.java\njdk8u282-b08/sample/lambda/DefaultMethods/MixIn.java\njdk8u282-b08/sample/annotations/\njdk8u282-b08/sample/annotations/index.html\njdk8u282-b08/sample/annotations/DependencyChecker/\njdk8u282-b08/sample/annotations/DependencyChecker/Plugins/\njdk8u282-b08/sample/annotations/DependencyChecker/Plugins/src/\njdk8u282-b08/sample/annotations/DependencyChecker/Plugins/src/plugins/\njdk8u282-b08/sample/annotations/DependencyChecker/Plugins/src/plugins/ExtendedBoilerPlugin.java\njdk8u282-b08/sample/annotations/DependencyChecker/Plugins/src/plugins/TimerPlugin.java\njdk8u282-b08/sample/annotations/DependencyChecker/Plugins/src/plugins/BoilerPlugin.java\njdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/\njdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/\njdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/checker/\njdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/checker/Module.java\njdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/checker/PluginChecker.java\njdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/checker/Device.java\njdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/checker/Require.java\njdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/checker/Kettle.xml\njdk8u282-b08/sample/annotations/DependencyChecker/PluginChecker/src/checker/RequireContainer.java\njdk8u282-b08/sample/annotations/Validator/\njdk8u282-b08/sample/annotations/Validator/src/\njdk8u282-b08/sample/annotations/Validator/src/PositiveIntegerSupplier.java\njdk8u282-b08/sample/annotations/Validator/src/SupplierValidator.java\njdk8u282-b08/sample/annotations/Validator/src/Validator.java\njdk8u282-b08/sample/annotations/Validator/src/Validate.java\njdk8u282-b08/sample/README\njdk8u282-b08/LICENSE\njdk8u282-b08/THIRD_PARTY_README\njdk8u282-b08/include/\njdk8u282-b08/include/jawt.h\njdk8u282-b08/include/jni.h\njdk8u282-b08/include/classfile_constants.h\njdk8u282-b08/include/jvmticmlr.h\njdk8u282-b08/include/jdwpTransport.h\njdk8u282-b08/include/jvmti.h\njdk8u282-b08/include/linux/\njdk8u282-b08/include/linux/jni_md.h\njdk8u282-b08/include/linux/jawt_md.h\njdk8u282-b08/src.zip\napache-maven-3.6.3/README.txt\napache-maven-3.6.3/LICENSE\napache-maven-3.6.3/NOTICE\napache-maven-3.6.3/lib/\napache-maven-3.6.3/lib/cdi-api.license\napache-maven-3.6.3/lib/commons-cli.license\napache-maven-3.6.3/lib/commons-io.license\napache-maven-3.6.3/lib/commons-lang3.license\napache-maven-3.6.3/lib/guava.license\napache-maven-3.6.3/lib/guice.license\napache-maven-3.6.3/lib/jansi.license\napache-maven-3.6.3/lib/javax.inject.license\napache-maven-3.6.3/lib/jcl-over-slf4j.license\napache-maven-3.6.3/lib/jsoup.license\napache-maven-3.6.3/lib/jsr250-api.license\napache-maven-3.6.3/lib/org.eclipse.sisu.inject.license\napache-maven-3.6.3/lib/org.eclipse.sisu.plexus.license\napache-maven-3.6.3/lib/plexus-cipher.license\napache-maven-3.6.3/lib/plexus-component-annotations.license\napache-maven-3.6.3/lib/plexus-interpolation.license\napache-maven-3.6.3/lib/plexus-sec-dispatcher.license\napache-maven-3.6.3/lib/plexus-utils.license\napache-maven-3.6.3/lib/slf4j-api.license\napache-maven-3.6.3/boot/\napache-maven-3.6.3/boot/plexus-classworlds.license\napache-maven-3.6.3/lib/jansi-native/\napache-maven-3.6.3/lib/jansi-native/freebsd32/\napache-maven-3.6.3/lib/jansi-native/freebsd64/\napache-maven-3.6.3/lib/jansi-native/linux32/\napache-maven-3.6.3/lib/jansi-native/linux64/\napache-maven-3.6.3/lib/jansi-native/osx/\napache-maven-3.6.3/lib/jansi-native/windows32/\napache-maven-3.6.3/lib/jansi-native/windows64/\napache-maven-3.6.3/lib/jansi-native/freebsd32/libjansi.so\napache-maven-3.6.3/lib/jansi-native/freebsd64/libjansi.so\napache-maven-3.6.3/lib/jansi-native/linux32/libjansi.so\napache-maven-3.6.3/lib/jansi-native/linux64/libjansi.so\napache-maven-3.6.3/lib/jansi-native/osx/libjansi.jnilib\napache-maven-3.6.3/lib/jansi-native/windows32/jansi.dll\napache-maven-3.6.3/lib/jansi-native/windows64/jansi.dll\napache-maven-3.6.3/bin/m2.conf\napache-maven-3.6.3/bin/mvn.cmd\napache-maven-3.6.3/bin/mvnDebug.cmd\napache-maven-3.6.3/bin/mvn\napache-maven-3.6.3/bin/mvnDebug\napache-maven-3.6.3/bin/mvnyjp\napache-maven-3.6.3/conf/\napache-maven-3.6.3/conf/logging/\napache-maven-3.6.3/conf/logging/simplelogger.properties\napache-maven-3.6.3/conf/settings.xml\napache-maven-3.6.3/conf/toolchains.xml\napache-maven-3.6.3/lib/ext/\napache-maven-3.6.3/lib/jansi-native/\napache-maven-3.6.3/lib/ext/README.txt\napache-maven-3.6.3/lib/jansi-native/README.txt\napache-maven-3.6.3/boot/plexus-classworlds-2.6.0.jar\napache-maven-3.6.3/lib/maven-embedder-3.6.3.jar\napache-maven-3.6.3/lib/maven-settings-3.6.3.jar\napache-maven-3.6.3/lib/maven-settings-builder-3.6.3.jar\napache-maven-3.6.3/lib/maven-plugin-api-3.6.3.jar\napache-maven-3.6.3/lib/maven-model-3.6.3.jar\napache-maven-3.6.3/lib/maven-model-builder-3.6.3.jar\napache-maven-3.6.3/lib/maven-builder-support-3.6.3.jar\napache-maven-3.6.3/lib/maven-resolver-api-1.4.1.jar\napache-maven-3.6.3/lib/maven-resolver-util-1.4.1.jar\napache-maven-3.6.3/lib/maven-shared-utils-3.2.1.jar\napache-maven-3.6.3/lib/commons-io-2.5.jar\napache-maven-3.6.3/lib/guice-4.2.1-no_aop.jar\napache-maven-3.6.3/lib/guava-25.1-android.jar\napache-maven-3.6.3/lib/javax.inject-1.jar\napache-maven-3.6.3/lib/jsr250-api-1.0.jar\napache-maven-3.6.3/lib/plexus-utils-3.2.1.jar\napache-maven-3.6.3/lib/plexus-sec-dispatcher-1.4.jar\napache-maven-3.6.3/lib/plexus-cipher-1.7.jar\napache-maven-3.6.3/lib/slf4j-api-1.7.29.jar\napache-maven-3.6.3/lib/commons-lang3-3.8.1.jar\napache-maven-3.6.3/lib/maven-core-3.6.3.jar\napache-maven-3.6.3/lib/maven-repository-metadata-3.6.3.jar\napache-maven-3.6.3/lib/maven-artifact-3.6.3.jar\napache-maven-3.6.3/lib/maven-resolver-provider-3.6.3.jar\napache-maven-3.6.3/lib/maven-resolver-impl-1.4.1.jar\napache-maven-3.6.3/lib/maven-resolver-spi-1.4.1.jar\napache-maven-3.6.3/lib/org.eclipse.sisu.inject-0.3.4.jar\napache-maven-3.6.3/lib/plexus-component-annotations-2.1.0.jar\napache-maven-3.6.3/lib/maven-compat-3.6.3.jar\napache-maven-3.6.3/lib/plexus-interpolation-1.25.jar\napache-maven-3.6.3/lib/wagon-provider-api-3.3.4.jar\napache-maven-3.6.3/lib/org.eclipse.sisu.plexus-0.3.4.jar\napache-maven-3.6.3/lib/cdi-api-1.0.jar\napache-maven-3.6.3/lib/commons-cli-1.4.jar\napache-maven-3.6.3/lib/wagon-http-3.3.4-shaded.jar\napache-maven-3.6.3/lib/jsoup-1.12.1.jar\napache-maven-3.6.3/lib/jcl-over-slf4j-1.7.29.jar\napache-maven-3.6.3/lib/wagon-file-3.3.4.jar\napache-maven-3.6.3/lib/maven-resolver-connector-basic-1.4.1.jar\napache-maven-3.6.3/lib/maven-resolver-transport-wagon-1.4.1.jar\napache-maven-3.6.3/lib/maven-slf4j-provider-3.6.3.jar\napache-maven-3.6.3/lib/jansi-1.17.1.jar\nopenjdk version \"1.8.0_282\"\nOpenJDK Runtime Environment (build 1.8.0_282-b08)\nOpenJDK 64-Bit Server VM (build 25.282-b08, mixed mode)\n\u001B[1mApache Maven 3.6.3 (cecedd343002696d0abb50b32b541b8a6ba2883f)\u001B[m\nMaven home: /usr/local/apache-maven-3.6.3\nJava version: 1.8.0_282, vendor: AdoptOpenJDK, runtime: /usr/local/jdk8u282-b08/jre\nDefault locale: en_US, platform encoding: UTF-8\nOS name: \"linux\", version: \"4.19.90-2012.4.0.0053.oe1.aarch64\", arch: \"aarch64\", family: \"unix\"\n[2023-03-21 07:56:23][WARN]------------Configure compile node environment end------------[2023-03-21 07:56:23][WARN]------------Configure compile node environment end------------[2023-03-21 07:56:23][WARN]------------Configure compile node environment end------------[2023-03-21 07:56:23][WARN]------------Configure compile node environment end------------[2023-03-21 07:56:23][WARN]------------Configure compile node environment end------------[2023-03-21 07:56:23][WARN]------------Configure compile node environment end------------[2023-03-21 07:56:23][WARN]------------Configure compile node environment end------------[2023-03-21 07:56:23][WARN]------------Configure compile node environment end------------[2023-03-21 07:56:23][WARN]------------Configure compile node environment end------------[2023-03-21 07:56:23][WARN]------------Configure compile node environment end------------[2023-03-21 07:56:23][WARN]------------Configure compile node environment end------------\n[root@ceph1 ~]# \n[root@ceph1 ~]# exit\nlogout\n初始化成功\n", // 安装日志信息
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