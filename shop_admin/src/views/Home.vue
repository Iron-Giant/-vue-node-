import axios from 'axios';
<template>
  <el-container class="home_container">
    <el-header>
      <el-row>
        <el-col :span="12">
          <div>
            <span class="logo" @click="backHome">shop-admin</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="logout">
            <el-button type="info" @click="logout">退出</el-button>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 导航菜单放缩 -->
        <div class="toggle_btn" @click="toggleCollapse">
          <i :class="toggleIcon"></i>
        </div>
        <el-menu
          :uniqueOpened="true"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template #title>
              <i :class="iconList[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" z>
              <template #title>
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconList: {
        125: "el-icon-s-custom",
        103: "el-icon-s-management",
        101: "el-icon-s-goods",
        102: "el-icon-s-order",
        145: "el-icon-s-data",
      },
      toggleIcon: "el-icon-d-arrow-left",
      isCollapse: false,
      //导航路由高亮地址
      activePath: "",
    };
  },
  created() {
    this.getMenus();
    // 导航栏路由高亮
    this.activePath = location.hash.substr(1);
  },
  methods: {
    logout() {
      this.$confirm("请确认是否退出", "提示", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        type: "warning",
      })
        .then(() => {
          //清除token
          sessionStorage.clear();
          this.$router.push("/login");
        })
        .catch(() => {
          this.$message.info("已取消");
        });
    },
    backHome() {
      this.$router.push("/home");
    },
    async getMenus() {
      const { data: res } = await this.$axios.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.message);
      // console.log(res);
      this.menuList = res.data;
    },
    toggleCollapse() {
      let leftArrow = "el-icon-d-arrow-left";
      let rightArrow = "el-icon-d-arrow-right";
      this.toggleIcon = this.toggleIcon === leftArrow ? rightArrow : leftArrow;
      this.isCollapse = !this.isCollapse;
    },
  },
  watch: {
    // 解决导航栏因浏览器前进后退路由高亮不正确的问题
    $route(to) {
      this.activePath = to.path;
    },
  },
};
</script>
<style lang="less" scoped>
.home_container {
  width: 100%;
  height: 100%;
}
.el-header {
  background-color: #373d41;
  color: #fff;
  /* text-align: center; */
  line-height: 60px;
}

.el-aside {
  background-color: #333744;
  color: #fff;
  /* text-align: center; */
  /* line-height: 200px; */

  // 清除左边菜单凸出
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
  color: #000;
  // text-align: center;
  // line-height: 160px;
}
.logo {
  cursor: pointer;
  font-size: 30px;
}
.logout {
  text-align: right;
}
.toggle_btn {
  width: 100%;
  text-align: center;
  // background-color: #4a5064;
  cursor: pointer;
}
.toggle_btn:hover {
  background-color: #292c36;
}
</style>
