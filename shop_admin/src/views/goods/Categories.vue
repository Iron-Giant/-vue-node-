<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col><el-button type="primary" @click="showAddCatDialog">添加分类</el-button></el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :data="catList"
        :columns="columns"
        :border="true"
        :stripe="true"
        :show-index="true"
        index-text="#"
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
      >
        <!-- 是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.deleted" style="color: green; font-size: 15px"></i>
          <i class="el-icon-error" v-else style="color: red; font-size: 15px"></i>
        </template>
        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag type="primary" size="small" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="small" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="small" v-else>三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template slot="option" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCatDialog(scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCat(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        :page-sizes="[3, 6, 9, 12]"
        :page-size="queryInfo.pagesize"
        :current-page="queryInfo.pagenum"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCatDialogVisible" width="35%" @close="addCatDialogClose">
      <span>
        <el-form :model="addCatForm" :rules="addCatFormRules" ref="addCatFormRef" label-width="80px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCatForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <!-- 级联选择器 -->
            <el-cascader
              v-model="selectedCatKeys"
              :options="parentCatList"
              :props="cascaderProps"
              :clearable="true"
              @change="handleChange"
            ></el-cascader>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCat">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCatDialogVisible" width="35%" @close="editCatDialogClose">
      <span>
        <el-form :model="editCatForm" :rules="editCatFormRules" ref="editCatFormRef" label-width="80px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCatForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCatDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCat">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: { type: 3, pagenum: 1, pagesize: 3 },
      // 商品分类列表
      catList: [],
      // 总数据条数
      total: 0,
      // 表格列属性
      columns: [
        { label: "分类名称", prop: "cat_name" },
        { label: "是否有效", type: "template", template: "isok" },
        { label: "排序", type: "template", template: "order" },
        { label: "操作", type: "template", template: "option" },
      ],
      // 添加分类对话框的显示
      addCatDialogVisible: false,
      // 添加分类的form表单数据
      addCatForm: {
        // 分类的名称
        cat_name: "",
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级
        cat_level: 0,
      },
      // 添加分类的表单验证规则
      addCatFormRules: {
        cat_name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
      },
      // 父级商品分类数据
      parentCatList: [],
      // 级联选择器的配置选项
      cascaderProps: { value: "cat_id", expandTrigger: "hover", label: "cat_name", checkStrictly: true },
      // 选中的父级分类id数组
      selectedCatKeys: [],
      // 修改分类对话框的显示
      editCatDialogVisible: false,
      // 修改分类的数据
      editCatForm: {},
      // 修改分类的校验规则
      editCatFormRules: {
        cat_name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getCatList();
  },
  methods: {
    //获取商品分类列表
    async getCatList() {
      const { data: res } = await this.$axios.get("categories", { params: this.queryInfo });
      if (res.meta.status !== 200) return this.$message.error("获取商品分类失败");
      this.catList = res.data.result;
      this.total = res.data.total;
    },
    // 当前页码改变的事件
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getCatList();
    },
    // 每页显示条数改变的事件
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getCatList();
    },
    // 添加分类对话框的显示
    showAddCatDialog() {
      this.getParentCatList();
      this.addCatDialogVisible = true;
    },
    // 获取父级数据的分类列表
    async getParentCatList() {
      const { data: res } = await this.$axios.get("categories", { params: { type: 2 } });
      if (res.meta.status !== 200) return this.$message.error("获取父级分类数据失败");
      this.parentCatList = res.data;
    },
    // 级联选择器选项改变事件
    handleChange() {
      if (this.selectedCatKeys.length > 0) {
        this.addCatForm.cat_pid = this.selectedCatKeys[this.selectedCatKeys.length - 1];
        this.addCatForm.cat_level = this.selectedCatKeys.length;
      } else {
        this.addCatForm.cat_pid = 0;
        this.addCatForm.cat_level = 0;
      }
    },
    // 添加分类对话框关闭事件
    addCatDialogClose() {
      this.selectedCatKeys = [];
      this.$refs.addCatFormRef.resetFields();
    },
    // 添加分类
    addCat() {
      this.$refs.addCatFormRef.validate(async isvalid => {
        if (!isvalid) return;
        const { data: res } = await this.$axios.post("categories", this.addCatForm);
        if (res.meta.status !== 201) return this.$message.error("添加商品分类失败");
        this.$message.success("添加商品分类成功");
        this.getCatList();
        this.addCatDialogVisible = false;
      });
    },
    // 修改分类对话框
    async showEditCatDialog(cateRow) {
      const { data: res } = await this.$axios.get("categories/" + cateRow.cat_id);
      if (res.meta.status !== 200) return this.$message.error("获取商品分类失败");
      this.editCatForm = res.data;
      this.editCatDialogVisible = true;
    },
    // 关闭修改分类对话框的事件
    editCatDialogClose() {
      this.$refs.editCatFormRef.resetFields();
    },
    // 修改分类
    editCat() {
      this.$refs.editCatFormRef.validate(async isvalid => {
        if (!isvalid) return;
        const { data: res } = await this.$axios.put(`categories/${this.editCatForm.cat_id}`, {
          cat_name: this.editCatForm.cat_name,
        });
        if (res.meta.status !== 200) return this.$message.error("添加商品分类失败");
        this.$message.success("更新商品分类成功");
        this.getCatList();
        this.editCatDialogVisible = false;
      });
    },
    // 删除分类
    deleteCat(catID) {
      this.$confirm("确认删除分类", "提示", {
        lockScroll: false,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$axios.delete("categories/" + catID);
          if (res.meta.status !== 200) return this.$message.error("删除商品分类失败");
          this.$message.success("删除商品分类成功");
          this.queryInfo.pagenum = 1;
          this.getCatList();
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
  },
};
</script>
<style lang="less" scoped>
.el-row {
  margin-bottom: 15px;
}
.el-form {
  padding-right: 15px;
}
</style>
