//axiosInstance.js
//导入axios
import axios from 'axios'
import { getToken } from '@/utils/auth'
import { AJAX_PORT,AJAX_IP } from '@/api/port.js'

// getInstall的API接口，超时时间2h
const APIInstall = axios.create({
	baseURL: AJAX_IP+AJAX_PORT, //请求后端数据的基本地址，自定义8888
	timeout: 7200000                   //请求超时设置，单位ms
})

// 添加拦截器
APIInstall.interceptors.request.use(config => {
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

export default APIInstall