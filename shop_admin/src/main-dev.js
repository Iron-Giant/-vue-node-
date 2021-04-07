import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
// 全局样式表
import "@/assets/global.less";
import axios from "axios";
// 表格树形组件
import TreeTable from "vue-table-with-tree-grid";
// 富文本编辑器（vue-quill-editor）
import VueQuillEditor from "vue-quill-editor";
// 富文本编辑器样式
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
// nprogress
import NProgress from "nprogress";
import "nprogress/nprogress.css";

Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.use(VueQuillEditor);

// 解决所有打开dialog对话框页面抖动的问题，取消锁定body滚动条
ElementUI.Dialog.props.lockScroll.default = false;

//将axios添加到vue原型中，因为单文件组件都是vue的实例，所以都能使用axios而不用重复导入
Vue.prototype.$axios = axios;

////配置公共路径，使用axios时只需写接口路径即可，axios会自动将公共路径和接口路径组合
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1";

//请求拦截器，在发送请求前在请求头中添加Authorization属性
axios.interceptors.request.use(config => {
  NProgress.start();
  config.headers.Authorization = sessionStorage.getItem("token");
  return config;
});
// 响应拦截器
axios.interceptors.response.use(config => {
  NProgress.done();
  return config;
});

Vue.component("tree-table", TreeTable);

// 日期格式化全局过滤器
Vue.filter("dateFormat", oldDate => {
  const dt = new Date(oldDate);
  const year = dt.getFullYear();
  const month = (dt.getMonth() + 1 + "").padStart(2, "0");
  const day = (dt.getDate() + "").padStart(2, "0");
  const hh = (dt.getHours() + "").padStart(2, "0");
  const mm = (dt.getMinutes() + "").padStart(2, "0");
  const ss = (dt.getSeconds() + "").padStart(2, "0");
  return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
});

new Vue({
  router,
  render: h => h(App),
}).$mount("#app");
