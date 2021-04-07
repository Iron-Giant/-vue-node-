<template>
  <el-row type="flex" class="login_page" justify="center" align="middle">
    <el-col :xs="12" :sm="10" :md="8" :lg="6" :xl="4">
      <el-form :model="loginForm" status-icon :rules="rules" ref="loginForm" label-width="70px" class="login_form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            autocomplete="off"
            prefix-icon="el-icon-lock"
            ref="elInputRef"
          ></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>
<script>
export default {
  data() {
    return {
      loginForm: {
        username: "",
        password: "",
      },
      rules: {
        username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
      },
    };
  },
  mounted() {
    // 回车登陆
    this.$refs.elInputRef.$refs.input.addEventListener("keydown", e => {
      if (e.keyCode === 13) this.login("loginForm");
    });
  },
  methods: {
    login() {
      this.$refs.loginForm.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$axios.post("login", this.loginForm);
        if (res.meta.status !== 200)
          return this.$message({
            message: "登录失败",
            type: "error",
            duration: 1000,
          });
        this.$message.success("登陆成功");
        sessionStorage.setItem("token", res.data.token);
        this.$router.push("/home");
      });
    },
    resetForm() {
      this.$refs.loginForm.resetFields();
    },
  },
};
</script>
<style lang="less" scoped>
.login_page {
  width: 100%;
  height: 100%;
  background: url("../assets/bimg.jpg") no-repeat center;
  background-size: cover;
  .login_form {
    background-color: #fff;
    border-radius: 20px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 40px 30px;
    padding-left: 10px;
  }
  .btns {
    margin: 0;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
