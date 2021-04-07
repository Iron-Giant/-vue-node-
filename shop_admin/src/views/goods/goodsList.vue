<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索和添加商品区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" :clearable="true">
            <template #append>
              <el-button icon="el-icon-search" @click="getGoodsList"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" :border="true" :stripe="true">
        <el-table-column label="#" type="index" width="50" align="center"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price" align="center" width="120px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" align="center" width="90px"></el-table-column>
        <el-table-column label="创建时间" align="center" width="170px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="140px">
          <template slot-scope="scope">
            <!-- 编辑 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditForm(scope.row.goods_id)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteGoods(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :background="true"
      >
      </el-pagination>
    </el-card>
    <!-- 商品编辑对话框 -->
    <el-dialog title="商品编辑" :visible.sync="editDialogVisible" width="75%" @close="handleClose">
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="Number(activeIndex)" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 标签页区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-position="top">
        <el-tabs v-model="activeIndex" tab-position="left">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="editForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="editForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="editForm.goods_number" type="number"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="(item, index) in manyAttrVals" :key="index">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_value">
                <el-checkbox
                  :label="name"
                  v-for="(name, index) in item.attr_vals"
                  :key="index"
                  :border="true"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item, index) in onlyAttrVals" :key="index">
              <el-input v-model="item.attr_value"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 图片上传 -->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :file-list="imgList"
              list-type="picture-card"
              :headers="headerObj"
              :on-success="handleSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor ref="myQuillEditor" v-model="editForm.goods_introduce" />
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoods">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <el-image :src="previewPath">
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline"></i>
        </div>
      </el-image>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkNum = (rule, value, callback) => {
      setTimeout(() => {
        if (value < 1) {
          callback(new Error("请输入大于0的数字"));
        } else {
          callback();
        }
      }, 1000);
    };
    return {
      // 查询参数对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      // 商品列表
      goodsList: [],
      // 总条数
      total: 0,
      // 商品编辑对话框的显示
      editDialogVisible: false,
      // 商品编辑表单
      editForm: {},
      // 商品编辑表单校验规则
      editFormRules: {
        goods_name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
          { validator: checkNum, trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
          { validator: checkNum, trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
          { validator: checkNum, trigger: "blur" },
        ],
      },
      // 激活的步骤条index
      activeIndex: "0",
      // 添加图片请求头
      headerObj: {
        Authorization: sessionStorage.getItem("token"),
      },
      // 图片预览路径
      previewPath: "",
      // 图片预览对话框的显示
      previewVisible: false,
      // 商品的图片列表
      imgList: [],
      // 商品的动态参数
      manyAttrVals: [],
      // 商品的静态属性
      onlyAttrVals: [],
      // 商品参数
      attrs: [],
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$axios.get("goods", { params: this.queryInfo });
      if (res.meta.status !== 200) return this.$message.error("获取商品列表失败");
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },
    // 每页条数改变的事件
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize;
      this.getGoodsList();
    },
    // 页码改变的事件
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum;
      this.getGoodsList();
    },
    // 删除商品
    deleteGoods(goodsID) {
      this.$confirm("确认进行删除操作?", "提示", {
        lockScroll: false,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$axios.delete("goods/" + goodsID);
          if (res.meta.status !== 200) return this.$message.error("删除商品失败");
          this.queryInfo.pagenum = 1;
          this.getGoodsList();
          this.$message.success("删除商品成功");
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
    // 跳转商品添加页
    goAddPage() {
      this.$router.push("/goods/add");
    },
    // 商品编辑对话框的显示
    async showEditForm(goodsID) {
      this.editDialogVisible = true;
      const { data: res } = await this.$axios.get("goods/" + goodsID);
      if (res.meta.status !== 200) return this.$message.error("获取商品失败");
      this.editForm = res.data;
      this.editForm.pics.forEach((item, index) => {
        const newInfo = {
          name: "",
          url: item.pics_mid_url,
        };
        this.imgList.push(newInfo);
        this.editForm.pics[index] = { pic: item.pics_mid_url };
      });
      this.editForm.attrs.forEach(item => {
        if (item.attr_sel === "many") {
          this.manyAttrVals.push({
            attr_id: item.attr_id,
            attr_name: item.attr_name,
            attr_vals: item.attr_vals.length !== 0 ? item.attr_vals.split(" ") : [],
            attr_value: item.attr_value.length !== 0 ? item.attr_value.split(" ") : [],
          });
        } else
          this.onlyAttrVals.push({ attr_id: item.attr_id, attr_name: item.attr_name, attr_value: item.attr_value });
      });
    },
    // 商品编辑对话框的关闭事件
    handleClose() {
      this.imgList = [];
      this.manyAttrVals = [];
      this.onlyAttrVals = [];
      this.activeIndex = "0";
      this.$refs.editFormRef.resetFields();
    },
    // 图片预览的事件
    handlePreview(file) {
      if (!file.response) this.previewPath = file.url;
      else this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    // 图片移除的事件
    handleRemove(file) {
      if (!file.response) {
        if (file.status === "success") {
          const filePath = file.url;
          const index = this.editForm.pics.findIndex(item => item.pic === filePath);
          this.editForm.pics.splice(index, 1);
        }
      } else {
        const filePath = file.response.data.tmp_path;
        const index = this.editForm.pics.findIndex(item => item.pic === filePath);
        this.editForm.pics.splice(index, 1);
      }
    },
    // 图片上传成功的处理事件
    handleSuccess(res) {
      if (res.meta.status !== 200) return this.$message.error("图片上传失败");
      const picInfo = { pic: res.data.tmp_path };
      this.editForm.pics.push(picInfo);
      console.log(this.imgList);
    },
    // 图片上传到服务器前触发的事件
    beforeAvatarUpload(file) {
      // 上传必须是图片
      const isJPG = file.type === "image/jpeg";
      // 上传图片大小
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        this.$message.error("上传图片必须是 JPG 格式");
      }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB");
      }
      return isJPG && isLt2M;
    },
    // 编辑商品
    editGoods() {
      this.$refs.editFormRef.validate(async isvalid => {
        if (!isvalid) return this.$message.error("请填写必要表单项");
        // 表单添加动态属性
        this.manyAttrVals.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_value.join(" "),
          };
          this.attrs.push(newInfo);
        });
        this.onlyAttrVals.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_value,
          };
          this.attrs.push(newInfo);
        });
        // 商品名称必须唯一
        const form = {
          goods_name: this.editForm.goods_name,
          goods_cat: this.editForm.goods_cat,
          goods_price: this.editForm.goods_price,
          goods_number: this.editForm.goods_number,
          goods_weight: this.editForm.goods_weight,
          goods_introduce: this.editForm.goods_weight,
          pics: this.editForm.pics,
          attrs: this.attrs,
        };
        const { data: res } = await this.$axios.put(`goods/${this.editForm.goods_id}`, form);
        console.log(res);
        if (res.meta.status !== 200) {
          if (res.meta.msg === '"创建商品基本信息失败"') return this.$message.error("已存在商品名称");
          return this.$message.error("编辑商品失败");
        }
        this.$message.success("编辑商品成功");
        this.getGoodsList();
        this.editDialogVisible = false;
      });
    },
  },
};
</script>
<style lang="less" scoped>
.el-image {
  width: 100%;
}
</style>
