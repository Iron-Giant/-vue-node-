<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="只允许为第三极分类设置相关参数" type="warning" :show-icon="true" :closable="false"></el-alert>
      <!-- 选择商品区域 -->
      <el-row>
        <el-col :span="12">
          <span>选择商品参数:</span>
          <!-- 级联选择区域 -->
          <el-cascader
            v-model="selectedCatKeys"
            :options="catList"
            :props="cascaderProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick" v-if="isTableDisabled">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParamsDialog"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" :border="true" :stripe="true">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  :closable="true"
                  @close="tagClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" align="center"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditParamsDialog(scope.row.attr_id)"
                >
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParamsDialog"
            >添加属性
          </el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" :border="true" :stripe="true" v-if="isTableDisabled">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  :closable="true"
                  @close="tagClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" align="center"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditParamsDialog(scope.row.attr_id)"
                >
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数或属性对话框 -->
    <el-dialog
      :title="'添加' + titleName"
      :visible.sync="addParamsDialogVisible"
      width="35%"
      @close="addParamsDialogClose"
    >
      <span>
        <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef" label-width="80px">
          <el-form-item :label="titleName" prop="attr_name">
            <el-input v-model="addParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑参数或属性对话框 -->
    <el-dialog
      :title="'修改' + titleName"
      :visible.sync="editParamsDialogVisible"
      width="35%"
      @close="editParamsDialogClose"
    >
      <span>
        <el-form :model="editParamsForm" :rules="editParamsFormRules" ref="editParamsFormRef" label-width="80px">
          <el-form-item :label="titleName" prop="attr_name">
            <el-input v-model="editParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catList: [],
      // 选中的级联选择器选项id
      selectedCatKeys: [],
      // 级联选择器配置项
      cascaderProps: { value: "cat_id", expandTrigger: "hover", label: "cat_name" },
      // 激活的标签页选项
      activeName: "many",
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 添加对话框的显示
      addParamsDialogVisible: false,
      // 添加对话框的数据
      addParamsForm: { attr_name: "", attr_sel: "" },
      // 添加对话框的表单校验
      addParamsFormRules: { attr_name: [{ required: true, message: "请输入内容", trigger: "blur" }] },
      // 编辑对话框的显示
      editParamsDialogVisible: false,
      // 编辑对话框的数据
      editParamsForm: {},
      // 编辑对话框的表单校验
      editParamsFormRules: { attr_name: [{ required: true, message: "请输入内容", trigger: "blur" }] },
    };
  },
  created() {
    this.getCatList();
  },
  methods: {
    // 获取商品分类列表
    async getCatList() {
      const { data: res } = await this.$axios.get("categories");
      if (res.meta.status !== 200) return this.$message.error("获取商品分类失败");
      this.catList = res.data;
    },
    // 级联选择器选项改变事件
    handleChange() {
      this.getParamsData();
    },
    // 标签页选项点击事件
    handleTabClick() {
      this.getParamsData();
    },
    // 获取参数列表
    async getParamsData() {
      if (this.selectedCatKeys.length != 3) {
        this.selectedCatKeys = [];
        this.onlyTableData = [];
        this.manyTableData = [];
        return;
      }
      // 获取参数列表
      const { data: res } = await this.$axios.get(`categories/${this.catID}/attributes`, {
        params: { sel: this.activeName },
      });
      if (res.meta.status !== 200) return this.$message.error("获取参数列表失败");
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals !== "" ? item.attr_vals.split(" ") : [];
        // 解决文本框共用inputVisible和inputValue的问题，为每一条数据添加各自的inputVisible和inputValue
        // 文本框的显示
        item.inputVisible = false;
        // 文本框的数据
        item.inputValue = "";
      });
      if (this.activeName === "many") this.manyTableData = res.data;
      else this.onlyTableData = res.data;
    },
    // 添加对话框
    showAddParamsDialog() {
      this.addParamsDialogVisible = true;
    },
    // 添加对话框的关闭事件
    addParamsDialogClose() {
      this.$refs.addParamsFormRef.resetFields();
    },
    // 添加参数或属性
    addParams() {
      this.$refs.addParamsFormRef.validate(async isvalid => {
        if (!isvalid) return;
        this.addParamsForm.attr_sel = this.activeName;
        const { data: res } = await this.$axios.post(`categories/${this.catID}/attributes`, this.addParamsForm);
        if (res.meta.status !== 201) return this.$message.error("添加失败");
        this.$message.success("添加成功");
        this.addParamsDialogVisible = false;
        this.getParamsData();
      });
    },
    // 编辑对话框
    async showEditParamsDialog(attr_id) {
      this.editParamsDialogVisible = true;
      const { data: res } = await this.$axios.get(`categories/${this.catID}/attributes/${attr_id}`, {
        params: { attr_sel: this.activeName },
      });
      if (res.meta.status !== 200) return this.$message.error("获取参数失败");
      this.editParamsForm = res.data;
    },
    // 编辑对话框的关闭事件
    editParamsDialogClose() {
      this.$refs.editParamsFormRef.resetFields();
    },
    // 编辑参数
    async editParams() {
      this.$refs.editParamsFormRef.validate(async isvalid => {
        if (!isvalid) return;
        const { data: res } = await this.$axios.put(
          `categories/${this.catID}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 200) return this.$message.error("更新失败");
        this.$message.success("更新成功");
        this.editParamsDialogVisible = false;
        this.getParamsData();
      });
    },
    // 删除参数
    deleteParams(attr_id) {
      this.$confirm("确认删除", "提示", {
        lockScroll: false,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$axios.delete(`categories/${this.catID}/attributes/${attr_id}`);
          if (res.meta.status !== 200) return this.$message.error("删除参数失败");
          this.$message.success("删除参数成功");
          this.getParamsData();
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
    // 文本框
    showInput(row) {
      row.inputVisible = true;
      // 文本框自动聚焦
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 文本框blur或enter事件
    async handleInputConfirm(row) {
      // 没输内容或者仅输入空格
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      // 输入了内容
      row.attr_vals.push(row.inputValue);
      const res = await this.saveAttrVals(row);
      console.log(res);
      row.inputVisible = false;
      row.inputValue = "";
      if (res.meta.status !== 200) return this.$message.error("添加失败");
      this.$message.success("添加成功");
    },
    // 标签关闭事件（删除）
    tagClose(index, row) {
      this.$confirm("确认删除", "提示", {
        lockScroll: false,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          row.attr_vals.splice(index, 1);
          const res = await this.saveAttrVals(row);
          if (res.meta.status !== 200) return this.$message.error("删除失败");
          this.$message.success("删除成功");
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
    // 对attr_vals的操作
    async saveAttrVals(row) {
      const { data: res } = await this.$axios.put(`categories/${this.catID}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(" "),
      });
      return res;
    },
  },
  computed: {
    // 添加选项的显示
    isBtnDisabled() {
      return this.selectedCatKeys.length !== 3;
    },
    catID() {
      if (this.selectedCatKeys.length === 3) {
        return this.selectedCatKeys[2];
      }
      return null;
    },
    isTableDisabled() {
      return this.selectedCatKeys.length === 3;
    },
    titleName() {
      if (this.activeName === "many") return "动态参数";
      return "静态属性";
    },
  },
};
</script>
<style lang="less" scoped>
.el-row {
  margin: 15px 0;
}
.el-cascader {
  margin-left: 10px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 180px;
  margin-left: 10px;
}
</style>
