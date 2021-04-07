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
      <el-aside width="200px">
        <el-menu :uniqueOpened="true" background-color="#333744" text-color="#fff" active-text-color="#ffd04b">
          <Tree :menuList="menuList"></Tree>
        </el-menu>
      </el-aside>
      <el-main>Main</el-main>
    </el-container>
  </el-container>
</template>

<script>
import Tree from "@/components/Tree";
export default {
  data() {
    return {
      menuList: [],
    };
  },
  created() {
    this.getMenus();
  },
  methods: {
    logout() {
      this.$confirm("请确认是否退出", "提示", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        type: "warning",
      }).then(() => {
        //清除token
        sessionStorage.clear();
        this.$router.push("/login");
      });
    },
    backHome() {
      this.$router.push("/home");
    },
    async getMenus() {
      const { data: res } = await this.$axios.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.message);
      console.log(res);
      this.menuList = res.data;
    },
  },
  components: { Tree },
};
</script>
<style scoped>
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
}

.el-main {
  background-color: #eaedf1;
  color: #fff;
  text-align: center;
  line-height: 160px;
}
.logo {
  cursor: pointer;
  font-size: 30px;
}
.logout {
  text-align: right;
}
</style>
