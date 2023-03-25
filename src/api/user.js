import API from '@/api/ajax'

export function login(data) {
  // return API.post('/getLoginPassword',data)
  return API({
    url: '/getLoginPassword',
    method: 'post',
    data  // {name=xx,xx=xx}
  })
}

export function getInfo(token) {
  return API({
      url: '/getLoginToken',
      method: 'post',
    // headers: {
    //   "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    //   token: token
    // }
    // data: {
    //   token:token
    // } // name=xx&xxx=xxx
  })
}

export function logout(token) {
  return API({
    url: '/getLogOut',
    method: 'post',
    data: {
      token:token
    }
  })
}
