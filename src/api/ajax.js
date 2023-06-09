//axiosInstance.js
//导入axios
import axios from 'axios'
import { getToken } from '@/utils/auth'
import { AJAX_PORT,AJAX_IP } from '@/api/port.js'

//使用axios下面的create([config])方法创建axios实例，其中config参数为axios最基本的配置信息。
const API = axios.create({
	baseURL: AJAX_IP+AJAX_PORT, //请求后端数据的基本地址，自定义8888
	timeout: 200000                   //请求超时设置，单位ms
})

// API.defaults.withCredentials = true
// 添加拦截器
API.interceptors.request.use(config => {
	let token = getToken()
	// console.log('token ==== ',token)
	if(token != null && token != undefined) {
		config.headers['token'] = getToken()
	}else{
		config.headers['token'] = ''
	}
	// config.headers['content-type'] = 'application/x-www-form-urlencoded'
	return config
}, error => {
	return Promise.reject(error)
})

export default API