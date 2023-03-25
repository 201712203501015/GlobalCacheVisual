import { createRouter, createWebHashHistory } from 'vue-router'
export const routes = [
  {
    path: '/',
    redirect:'/userView'
    // name: 'allView',
    // component: () => import('@/views/AllView/AllView.vue')
  },
  {
    path: '/mainView',
    name: 'mainView',
    redirect:'/mainView/nodeRightSide',
    component: () => import('@/views/MainView/MainView.vue'),
    meta: {
      showView: true // 切换路由标记
    },
    children: [
      // NodeView，Node视图
      {
        path: 'nodeRightSide',
        name: 'nodeRightSide',
        component: () => import('@/views/NodeRightSide/NodeRightSide.vue')
      },
      // LogicView，逻辑视图 分为Pt，Pg，Cli
      // Pt视图
      {
        path: 'ptRightSide',
        name: 'ptRightSide',
        component: () => import('@/views/PtRightSide/PtRightSide.vue')
      },
      // Pg视图
      {
        path: 'pgRightSide',
        name: 'pgRightSide',
        component: () => import('@/views/PgRightSide/PgRightSide.vue')
      },
      // Cli视图
      // {
      //   path: 'cliRightSide',
      //   name: 'cliRightSide',
      //   component: () => import('@/views/CliRightSide/CliRightSide.vue')
      // },
      // HealthView，健康监控视图
      {
        path: 'healthRightSide',
        name: 'healthRightSide',
        component: () => import('@/views/HealthRightSide/HealthRightSide.vue')
      }
    ]
  },
  // 用户信息
  {
    path: '/userView',
    name: 'userView',
    component: () => import('@/views/UserView/UserView.vue'),
    meta: {
      showView: true
    }
  },
  // 登录
  {
    path: '/loginView',
    name: 'loginView',
    component: () => import('@/views/LoginView/LoginView.vue'),
    meta: {
      showView: true
    }
  },
  // 注册
  {
    path: '/registerView',
    name: 'registerView',
    component: () => import('@/views/RegisterView/RegisterView.vue'),
    meta: {
      showView: true
    }
  },
  // 自动化部署
  {
    path: '/autoDepl',
    name: 'autoDepl',
    component: () => import('@/views/AutoDepl/AutoDepl.vue'),
    meta: {
      showView: true
    }
  },
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  // }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHashHistory(),
    routes
  })
  router.matcher = newRouter.matcher // reset router
}

export default router
