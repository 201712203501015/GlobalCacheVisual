import { createStore } from 'vuex'
// 登陆注册
import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { ElMessage } from 'element-plus'

export default createStore({
  // 存储组件会用到的数据
  state() {
    return {
      // 用户的登录信息
      userPhone: null,
      userName: null,
      userPassword: null,
      userToken: getToken(),
      isSuperUser: null,// 1普通 0 超管

      // 当前导航菜单页面
      nowMenuItem: null,
      // 当前是哪个视图
      nowView: null,
      // node信息
      nowNodeId: null, // 当前nodeId节点
      nowNodeType: null, // 当前nodeId节点种类：cpu，disk，memory，net，ptpg，health
      nowNodeTypeInfo: null, // 当前nodeId节点种类的信息
      nowNodeHealth: null, // 当前nodeId的健康状态
      // 逻辑信息
      nowLogicId: 0,// 0，PT；1，PG；2：CLI；
      // 健康监控信息
      // nowHealthState: null, // 
      nodeIsIn: null, // 当前节点是否是in
      nodeIsRunning: null,  // 当前节点是否running正常
      nodeIsOnline: null, // 当前节点是否在线

      // 自动化部署部分
      activeStep: 0, // 当前是第几步
      isFinished: false ,// 是否完成自动化部署了
      isHasPassword: true, // 是否输入过了root密码：true表示未输入，false表示已输入
    }
  },
  // 从 store 中的 state 中派生出一些状态：比如将A = {a:1,b:2}，我们要将A.a传给组件1，将A.b传给组件2
  getters: {
  },
  // 更改 Vuex 的 store 中的状态（同步操作）
  mutations: {
    // 登陆注册
    // 更新用户的登陆 手机号
    changeUserPhone(state, nowVal) {
      state.userPhone = nowVal
    },

    // 更改用户姓名
    changeUserName (state, nowVal) {
      state.userName = nowVal
    },
    // 更新用户的登陆 密码
    changeUserPassword (state, nowVal) {
      state.userPassword = nowVal
    },
    // 更新用户的登陆 Token
    changeUserToken (state, nowVal) {
      state.userToken = nowVal
    },
    // 更新用户的登陆 用户权限
    changeIsSuperUser (state, nowVal) {
      state.isSuperUser = nowVal
    },
    // reset
    resetState(state) {
      state.userPhone = null,
      state.userName = null,
      state.userPassword = null,
      state.isSuperUser = null,
      state.isFinished = false,
      state.userToken = getToken()
    },

    // 更新当前导航菜单页面
    changeMenuItem (state, nowItem) {
      state.nowMenuItem = nowItem
    },
    // 更新当前视图
    changeView (state, nowView) {
      state.nowView = nowView
    },
    // 更新nodeId
    changeNodeId (state, newNodeId) {
      // 更新nodeId状态
      state.nowNodeId = newNodeId
    },
    // 更新nodeIdType
    changeNodeType (state, newNodeType) {
      // 更新nodeIdType
      state.nowNodeType = newNodeType
    },
    // 更新node的健康状态
    changeNodeIsIn (state, newValue) {
      state.nodeIsIn = newValue
    },
    changeNodeIsRunning (state, newValue) {
      state.nodeIsRunning = newValue
    },
    changeNodeIsOnline (state, newValue) {
      state.nodeIsOnline = newValue
    },
    // 更新 逻辑视图 的视图选项
    changeLogicId (state, index) {
      state.nowLogicId = index
    },
    // 更新健康状态信息
    changeHealthState (state, nowHealthState) {
      state.nowHealthState = nowHealthState
    },

    // 自动化部署部分 
    // 当前是第几步
    changeActiveStep (state, nowVal) {
      state.activeStep = nowVal
    },
    // isFinished
    changeIsFinished (state, nowVal) {
      state.isFinished = nowVal
    },
    // isHasPassword
    changeIsHasPassword (state, nowVal) {
      state.isHasPassword = nowVal
    }
  },
  // Action 提交的是 mutation，而不是直接变更状态，相当于异步mutation，当
  actions: {
    // user login
    login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        const { userName, password } = userInfo
        login({
          userName: userName,
          password: password
        }).then(res => {
          const { data } = res
          // console.log('res == ',res)
          if(data.vaild === false) { // 用户不合法
            ElMessage({
              message: '用户名或密码不合法',
              type: 'warning',
            })
            reject('登录失败')
          }
          // console.log('登陆成功,token = ',data.data.token)
          commit('changeUserToken', data.data.token)
          setToken(data.data.token)
          resolve()
        }).catch(error => {
          ElMessage({
            message: '网络连接错误，登陆失败',
            type: 'warning',
          })
          reject(error)
        })
      })
    },
    // get user info
    getInfo({ commit, state }) {
      // console.log('调用了loginToken')
      return new Promise((resolve, reject) => {
        getInfo(state.userToken).then(res => {
          // const { data } = res
          
          const { data } = res
          // console.log('getInfo = **',data.data)
  
          if(!data) {
            ElMessage({
              message: '验证失败，请重新登陆',
              type: 'warning',
            })
            return reject('Verification failed, please Login again')
          }
  
          // const { phonenumber,userName,password,isSuperUser } = data
  
          commit('changeUserPhone',data.data.phonenumber)
          commit('changeUserName',data.data.userName)
          commit('changeUserPassword',data.data.password)
          commit('changeIsSuperUser',data.data.isSuperUser)
          commit('changeIsFinished',data.data.isFinished)
          resolve(data)
        }).catch(error => {
          ElMessage({
            message: '网络连接错误，获取用户信息失败',
            type: 'warning',
          })
          reject(error)
        })
      })
    },
    // user logout
    logout({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.userToken).then(() => {
          removeToken()
          resetRouter()
          commit('resetState')
          resolve()
        }).catch(error => {
          ElMessage({
            message: '网络连接失败，登出失败',
            type: 'warning',
          })
          reject(error)
        })
      })
    },
    // remove token
    resetToken({ commit }) {
      return new Promise(resolve => {
        removeToken()
        commit('resetState')
        resolve()
      })
    }
  },
  modules: {
  }
})
