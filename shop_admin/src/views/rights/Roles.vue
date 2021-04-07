<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" :border="true" :stripe="true">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item_1, index) in scope.row.children"
              :key="item_1.id"
              :class="['bdbottom', index === 0 ? 'bdtop' : '']"
            >
              <!-- 一级菜单权限 -->
              <el-col :span="5">
                <el-tag type="primary" :closable="true" @close="deleteRightByID(scope.row, item_1.id)">
                  {{ item_1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级菜单权限 -->
              <el-col :span="19">
                <!-- 循环得到二级菜单权限 -->
                <el-row
                  v-for="(item_2, index) in item_1.children"
                  :key="item_2.id"
                  :class="[index !== 0 ? 'bdtop' : '']"
                >
                  <el-col :span="6">
                    <el-tag type="success" :closable="true" @close="deleteRightByID(scope.row, item_2.id)">
                      {{ item_2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 循环得到三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      :closable="true"
                      @close="deleteRightByID(scope.row, item_3.id)"
                      v-for="item_3 in item_2.children"
                      :key="item_3.id"
                    >
                      {{ item_3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" width="50" align="center"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" align="center"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="small" @click="showEiditDialog(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteRole(scope.row.id)">
              删除
            </el-button>
            <el-button type="warning" icon="el-icon-s-order" size="small" @click="showSetRightDialog(scope.row)">
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="35%" @close="addRoleDialogClose">
      <span>
        <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editRoleDialogVisible" width="35%" @close="editRoleDialogClose">
      <span>
        <el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="35%" @close="setRightDialogClose">
      <span>
        <!-- 树形控件 -->
        <el-tree
          :data="rightTree"
          :show-checkbox="true"
          node-key="id"
          :default-expand-all="true"
          :props="rightProps"
          :default-checked-keys="defCheckedKeys"
          ref="rightTreeRef"
        >
        </el-tree>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRight(roleID)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      addRoleDialogVisible: false,
      // 添加角色的表单数据
      addRoleForm: { roleName: "", roleDesc: "" },
      // 添加角色的表单验证
      addRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 2, max: 8, message: "长度在 3 到 8 个字符", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          { min: 2, max: 8, message: "长度在 3 到 15 个字符", trigger: "blur" },
        ],
      },
      roleList: [],
      editRoleDialogVisible: false,
      editRoleForm: {},
      editRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 2, max: 8, message: "长度在 3 到 8 个字符", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          { min: 2, max: 8, message: "长度在 3 到 15 个字符", trigger: "blur" },
        ],
      },
      setRightDialogVisible: false,
      rightTree: [],
      rightProps: { label: "authName", children: "children" },
      // 角色拥有的权限id数组
      defCheckedKeys: [],
      // 角色ID
      roleID: "",
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    // 获得角色表单
    async getRoleList() {
      const { data: res } = await this.$axios.get("roles");
      if (res.meta.status !== 200) return this.$message.error("获取角色列表失败");
      this.roleList = res.data;
    },
    // 删除角色权限
    deleteRightByID(role, rightID) {
      this.$confirm("确认删除权限", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$axios.delete(`roles/${role.id}/rights/${rightID}`);
          if (res.meta.status !== 200) return this.$message.error("删除权限失败");
          role.children = res.data;
          this.$message.success("删除成功");
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
    // 添加角色
    addRole() {
      this.$refs.addRoleFormRef.validate(async isvalid => {
        if (!isvalid) return;
        const { data: res } = await this.$axios.post("roles", this.addRoleForm);
        if (res.meta.status !== 201) return this.$message.error("添加角色失败");
        this.addRoleDialogVisible = false;
        this.$message.success("添加角色成功");
        this.getRoleList();
      });
    },
    // 添加角色的对话框关闭事件
    addRoleDialogClose() {
      this.$refs.addRoleFormRef.resetFields();
    },
    // 编辑角色对话框
    async showEiditDialog(role) {
      this.editRoleDialogVisible = true;
      const { data: res } = await this.$axios.get("roles/" + role.id);
      if (res.meta.status !== 200) return this.$message.error("获取角色失败");
      this.editRoleForm = res.data;
    },
    //编辑角色对话框关闭事件
    editRoleDialogClose() {
      this.$refs.editRoleFormRef.resetFields();
    },
    // 编辑角色
    editRole() {
      this.$refs.editRoleFormRef.validate(async isvalid => {
        if (!isvalid) return;
        console.log(this.editRoleForm);
        const { data: res } = await this.$axios.put("roles/" + this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc,
        });
        if (res.meta.status !== 200) return this.$message.error("修改角色失败");
        this.editRoleDialogVisible = false;
        this.$message.success("修改角色成功");
        this.getRoleList();
      });
    },
    // 删除角色
    deleteRole(roleID) {
      this.$confirm("确认删除角色", "提示", {
        lockScroll: false,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$axios.delete("roles/" + roleID);
          if (res.meta.status !== 200) return this.$message.error("删除角色失败");
          this.$message.success("删除角色成功");
          this.getRoleList();
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
    // 显示分配权限对话框和权限树
    async showSetRightDialog(role) {
      this.setRightDialogVisible = true;
      this.roleID = role.id;
      const { data: res } = await this.$axios.get("rights/tree");
      if (res.meta.status !== 200) return this.$message.error("获取角色权限失败");
      this.rightTree = res.data;
      this.getDefCheckedKeys(role, this.defCheckedKeys);
    },
    //递归获得角色权限id数组
    getDefCheckedKeys(node, arr) {
      if (!node.children) return arr.push(node.id);
      node.children.forEach(el => {
        this.getDefCheckedKeys(el, arr);
      });
    },
    // 分配权限对话框关闭事件
    setRightDialogClose() {
      this.defCheckedKeys = [];
    },
    // 分配权限
    async setRight(roleID) {
      const checkedKeys = [
        ...this.$refs.rightTreeRef.getCheckedKeys(),
        ...this.$refs.rightTreeRef.getHalfCheckedKeys(),
      ];
      const str = checkedKeys.join(",");
      const { data: res } = await this.$axios.post(`roles/${roleID}/rights`, { rids: str });
      if (res.meta.status !== 200) return this.$message.error("分配权限失败");
      this.setRightDialogVisible = false;
      this.$message.success("分配权限成功");
      this.getRoleList();
    },
  },
};
</script>
<style lang="less" scoped>
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.el-tag {
  margin: 7px 7px 7px 0;
}
.el-row {
  display: flex;
  align-items: center;
}
.el-form {
  padding-right: 10px;
}
</style>
