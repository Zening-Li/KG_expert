// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App'
import router from './router'
import axios from 'axios'
import store from '../src/store/index'
import ECharts from "vue-echarts";
import "echarts/lib/chart/line";
Vue.component("v-echart", ECharts);
Vue.use(ElementUI);
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

Vue.prototype.$http = axios


// axios.defaults.timeout = 500000000000

/* axios.interceptors.response.use(response => {
  return response
}, err => {
    if(err.message == 'timeout of 5000ms exceeded'){
        return {code : 10,message:'请求超时'}
    }else{
        return {code :500, message:'网络连接失败，请稍后重试'}
    }
}) */


let axiosPromiseArr=[] //储存cancel token

axios.interceptors.request.use(function (config) {
  // 在发送请求设置cancel token
  config.cancelToken = new axios.CancelToken(cancel => {
    axiosPromiseArr.push({cancel})
  });
  return config;
}, function (error) {
  // 对请求错误的处理
  return Promise.reject(error);
});


router.beforeEach((to, from, next) => {
  axiosPromiseArr.forEach((ele, index) => {
    ele.cancel();
    delete axiosPromiseArr[index];
  });
  next();
});

// axios.interceptors.response.use(response => {
//   //请求成功时的处理
// }, error => {
//   //请求取消时，也会进入error，根据axios.isCancel()：true--请求取消  false--请求失败
//   //仅在请求失败时做后续处理
//   if(axios.isCancel(error)) {
//     alert('请求取消')
//   }else {
//     Toast({
//       message: '连接服务器失败，请稍后再试！',
//       duration: 2000,
//       className: 'globalMsg'
//     });
//     return Promise.reject(error);
//   }
// });

