import router from './router'
import store from './store'
import { ElMessage } from 'element-plus' 
import { getToken } from '@/utils/auth' // get token from cookie

const whiteList = ['/loginView','/registerView'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // determine whether the user has logged in
  const hasToken = getToken()
  // console.log('toName = ',to.name)
  if (hasToken) {
    if (to.path === '/loginView') {
      // if is logged in, redirect to 用户界面
      next({ path: '/userView' })
    } else {
      const hasGetUserName = store.state.userName
      if (hasGetUserName) {
        // 判断是不是要去mainView/nodeRightSide 或者 mainView/healthRightSide 或者 mainView/ptRightSide，需要知道是不是进行过自动化部署
        if(to.name === 'mainView' || to.name === 'nodeRightSide' || to.name === 'ptRightSide' || to.name === 'pgRightSide' || to.name === 'cliRightSide' || to.name === 'healthRightSide') {
          if(store.state.isFinished === false) {
            ElMessage.error('未完成自动化部署，无法查看视图')
            next('/userView')
          }
        }
        next()
      } else {
        try {
          // get user info
          await store.dispatch('getInfo')
          // 判断是不是要去mainView/nodeRightSide 或者 mainView/healthRightSide 或者 mainView/ptRightSide，需要知道是不是进行过自动化部署
          if(to.name === 'mainView' || to.name === 'nodeRightSide' || to.name === 'ptRightSide' || to.name === 'pgRightSide' || to.name === 'cliRightSide' || to.name === 'healthRightSide') {
            if(store.state.isFinished === false) {
              ElMessage.error('未完成自动化部署，无法查看视图')
              next('/userView')
            }
          }
          next()
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('resetToken')
          ElMessage.error(error || 'Has Error')
          next(`/loginView?redirect=${to.path}`)
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      // next(`/loginView?redirect=${to.path}`)
      next('/loginView')
    }
  }
})

router.afterEach(() => {
  // 啥也不干
})
