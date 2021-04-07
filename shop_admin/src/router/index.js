import Vue from "vue";
import VueRouter from "vue-router";
// import Login from "@/views/Login";
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ "@/views/Login");
// import Home from "@/views/Home";
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ "@/views/Home");
// import Welcome from "@/views/Welcome";
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ "@/views/Welcome");
// import Users from "@/views/users/Users";
const Users = () => import(/* webpackChunkName: "users" */ "@/views/users/Users");
// import Rights from "@/views/rights/Rights";
const Rights = () => import(/* webpackChunkName: "rights" */ "@/views/rights/Rights");
// import Roles from "@/views/rights/Roles";
const Roles = () => import(/* webpackChunkName: "rights" */ "@/views/rights/Roles");
// import Categories from "@/views/goods/Categories";
const Categories = () => import(/* webpackChunkName: "goods" */ "@/views/goods/Categories");
// import Params from "@/views/goods/Params";
const Params = () => import(/* webpackChunkName: "goods" */ "@/views/goods/Params");
// import GoodsList from "@/views/goods/goodsList";
const GoodsList = () => import(/* webpackChunkName: "goods" */ "@/views/goods/goodsList");
// import Add from "@/views/goods/Add";
const Add = () => import(/* webpackChunkName: "goods" */ "@/views/goods/Add");
// import Orders from "@/views/orders/Orders";
const Orders = () => import(/* webpackChunkName: "Orders_Reports" */ "@/views/orders/Orders");
// import Reports from "@/views/reports/Reports";
const Reports = () => import(/* webpackChunkName: "Orders_Reports" */ "@/views/reports/Reports");

Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/Login" },
  { path: "/login", component: Login },
  {
    path: "/home",
    component: Home,
    redirect: "/welcome",
    children: [
      {
        path: "/welcome",
        component: Welcome,
      },
      {
        path: "/users",
        component: Users,
      },
      {
        path: "/rights",
        component: Rights,
      },
      {
        path: "/roles",
        component: Roles,
      },
      {
        path: "/categories",
        component: Categories,
      },
      {
        path: "/params",
        component: Params,
      },
      {
        path: "/goods",
        component: GoodsList,
      },
      {
        path: "/goods/add",
        component: Add,
      },
      {
        path: "/orders",
        component: Orders,
      },
      {
        path: "/reports",
        component: Reports,
      },
    ],
  },
];

const router = new VueRouter({
  routes,
});

/*导航守卫
  @to:将要访问的路由路径
  @from:从哪个路径跳转过来
  @next:表示放行，next()放行,next(路径)强制跳转
*/
router.beforeEach((to, from, next) => {
  let tokenStr = sessionStorage.getItem("token");
  if (to.path === "/login") {
    if (!tokenStr) next();
    else next("/welcome");
  } else {
    if (!tokenStr) next("/login");
    else next();
  }
});

export default router;
