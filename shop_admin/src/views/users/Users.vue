<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 搜索添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" :clearable="true" @clear="getUserList">
            <template #append>
              <el-button icon="el-icon-search" @click="getUserList"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" :border="true" :stripe="true">
        <el-table-column label="#" type="index" width="50" align="center"></el-table-column>
        <el-table-column label="姓名" prop="username" align="center"></el-table-column>
        <el-table-column label="邮箱" prop="email" align="center"></el-table-column>
        <el-table-column label="电话" prop="mobile" align="center"></el-table-column>
        <el-table-column label="角色" prop="role_name" align="center"></el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="handleStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
            <!-- 分配角色 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-s-order"
                size="mini"
                @click="showSetRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :background="true"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="35%" @close="addDialogClose">
      <span>
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password" :show-password="true"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="35%" @close="editDialogClose">
      <span>
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="修改用户" :visible.sync="setRoleDialogVisible" width="35%" @close="setRoleDialogClose">
      <div>
        <p>
          当前用户：<el-tag type="success">{{ userInfo.username }}</el-tag>
        </p>
        <p>
          当前角色：<el-tag type="danger">{{ userInfo.role_name }}</el-tag>
        </p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleID" :placeholder="userInfo.role_name">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    let checkEmail = (rule, value, callback) => {
      const emailReg = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,})$/;
      if (emailReg.test(value)) {
        return callback();
      }
      callback(new Error("请输入正确的邮箱地址"));
    };
    let checkMobile = (rule, value, callback) => {
      const emailReg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
      if (emailReg.test(value)) {
        return callback();
      }
      callback(new Error("请输入正确的手机号"));
    };
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      addForm: { username: "", password: "", email: "", mobile: "" },
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 5, max: 15, message: "长度在 5 到 15 个字符", trigger: "blur" },
        ],
        email: [{ required: true, message: "请输入邮箱", trigger: "blur" }, { validator: checkEmail }],
        mobile: [{ required: true, message: "请输入手机号", trigger: "blur" }, { validator: checkMobile }],
      },
      editDialogVisible: false,
      // 查询到的用户信息
      editForm: {},
      editFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" },
        ],
        email: [{ required: true, message: "请输入邮箱", trigger: "blur" }, { validator: checkEmail }],
        mobile: [{ required: true, message: "请输入手机号", trigger: "blur" }, { validator: checkMobile }],
      },
      setRoleDialogVisible: false,
      // 用户信息
      userInfo: {},
      // 角色列表
      rolesList: [],
      // 选中的角色id
      selectedRoleID: "",
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    // 获得用户数据
    async getUserList() {
      const { data: res } = await this.$axios.get("users", { params: this.queryInfo });
      if (res.meta.status !== 200) return this.$message.error("获取用户列表失败");
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 监听每页显示条数改变的事件
    handleSizeChange(currentSize) {
      this.queryInfo.pagesize = currentSize;
      this.getUserList();
    },
    // 监听页码改变的事件
    handleCurrentChange(currentPage) {
      this.queryInfo.pagenum = currentPage;
      this.getUserList();
    },
    //监听switch开关的事件
    async handleStateChange(currentState) {
      const { data: res } = await this.$axios.put(`users/${currentState.id}/state/${currentState.mg_state}`);

      if (res.meta.status !== 200) {
        currentState.mg_state = !currentState.mg_state;
        return this.$message.error("更新用户状态失败");
      }
      return this.$message.success("更新用户状态成功");
    },
    //监听添加用户对话框关闭事件
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加用户数据
    async addUser() {
      this.$refs.addFormRef.validate(async isValid => {
        if (!isValid) return;
        const { data: res } = await this.$axios.post("users", this.addForm);
        if (res.meta.status !== 201) this.$message.error("添加用户失败");
        this.$message.success("添加用户成功");
        this.addDialogVisible = false;
        this.getUserList();
        this.total++;
        // 跳转到最后一页
        this.queryInfo.pagenum =
          this.total % this.queryInfo.pagesize === 0
            ? this.total / this.queryInfo.pagesize
            : Math.floor(this.total / this.queryInfo.pagesize) + 1;
        this.getUserList();
      });
    },
    // 修改用户对话框和根据id获取数据
    async showEditDialog(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$axios.get("users/" + id);
      if (res.meta.status !== 200) return this.$message.error("获取用户失败");
      this.editForm = res.data;
    },
    // 监听修改用户对话框关闭事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改用户信息
    editUser() {
      this.$refs.editFormRef.validate(async isvalid => {
        if (!isvalid) return;
        const { data: res } = await this.$axios.put("users/" + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile,
        });
        if (res.meta.status !== 200) return this.$message.error("修改用户失败");
        //关闭对话框
        this.editDialogVisible = false;
        // 重新获得用户数据
        this.getUserList();
        // 提示消息
        this.$message.success("修改用户成功");
      });
    },
    // 删除用户
    deleteUser(userID) {
      this.$confirm("确认进行删除操作?", "提示", {
        lockScroll: false,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$axios.delete("users/" + userID);
          if (res.meta.status !== 200) return this.$message.error("删除用户失败");
          this.queryInfo.pagenum = 1;
          this.getUserList();
          this.$message.success("删除用户成功");
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
    // 分配绝对对话框和获取角色
    async showSetRoleDialog(role) {
      this.setRoleDialogVisible = true;
      this.userInfo = role;
      const { data: res } = await this.$axios.get("roles");
      if (res.meta.status !== 200) return this.$message.error("获取角色失败");
      this.rolesList = res.data;
    },
    // 关闭分配角色对话框的事件
    setRoleDialogClose() {
      this.selectedRoleID = "";
      this.userInfo = {};
      this.rolesList = [];
    },
    // 分配角色
    async setRole() {
      const id = this.userInfo.id;
      const { data: res } = await this.$axios.put(`users/${id}/role`, { rid: this.selectedRoleID });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.$message.success("设置角色成功");
      this.setRoleDialogVisible = false;
      this.getUserList();
    },
  },
};
</script>
<style lang="less" scoped>
.el-dialog {
  .el-form {
    margin-right: 20px;
  }
}
</style>
