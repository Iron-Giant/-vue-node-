<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="添加商品信息" type="info" :show-icon="true" :closable="false" :center="true"></el-alert>
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
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top">
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <!-- 级联选择区域 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catList"
                :props="cascaderProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="name"
                  v-for="(name, index) in item.checkedAttrVals"
                  :key="index"
                  :border="true"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 图片上传 -->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor ref="myQuillEditor" v-model="addForm.goods_introduce" />
            <el-button size="normal" type="primary" class="addBtn" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
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
// 导入lodash
import _ from "lodash";
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
      activeIndex: "0",
      // 添加商品的表单
      addForm: {
        goods_name: "",
        // 商品所属的分类
        goods_cat: [],
        goods_price: null,
        goods_number: null,
        goods_weight: null,
        // 图片在服务器临时存放地址数组
        pics: [],
        // 商品的介绍
        goods_introduce: "",
        // 商品参数
        attrs: [],
      },
      // 添加商品的表单校验
      addFormRules: {
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
      // 商品分类列表
      catList: [],
      // 级联选择器配置项
      cascaderProps: { value: "cat_id", expandTrigger: "hover", label: "cat_name" },
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 添加图片请求头
      headerObj: {
        Authorization: sessionStorage.getItem("token"),
      },
      // 图片预览路径
      previewPath: "",
      // 图片预览对话框的显示
      previewVisible: false,
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
      if (this.addForm.goods_cat.length !== 3) this.addForm.goods_cat = [];
      else {
        this.getGoodsParams("商品参数", "many");
        this.getGoodsParams("商品属性", "only");
      }
    },
    // 商品分类没有选中，不允许切花标签
    beforeTabLeave(avtiveName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品参数");
        return false;
      }
    },
    // 标签页点击的事件
    // async handleClick(tab) {
    //   if (this.activeIndex === "1") {
    //     this.getGoodsParams(tab.label, "many");
    //   } else if (this.activeIndex === "2") {
    //     this.getGoodsParams(tab.label, "only");
    //   }
    // },
    // 获取动态参数或静态属性
    async getGoodsParams(label, sel) {
      const { data: res } = await this.$axios.get(`categories/${this.catID}/attributes`, {
        params: { sel },
      });
      if (res.meta.status !== 200) return this.$message.error(`获取${label}失败`);
      if (sel === "many") {
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(" ") : [];
          item.checkedAttrVals = item.attr_vals;
        });
        this.manyTableData = res.data;
      } else if (sel === "only") this.onlyTableData = res.data;
    },
    // 图片预览的事件
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    // 图片移除的事件
    handleRemove(file) {
      if (file.response) {
        const filePath = file.response.data.tmp_path;
        const index = this.addForm.pics.findIndex(item => item.pic === filePath);
        this.addForm.pics.splice(index, 1);
      }
    },
    // 图片上传成功的处理事件
    handleSuccess(res) {
      if (res.meta.status !== 200) return this.$message.error("图片上传失败");
      const picInfo = { pic: res.data.tmp_path };
      this.addForm.pics.push(picInfo);
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
    // 添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async isvalid => {
        if (!isvalid) return this.$message.error("请填写必要表单项");
        // lodash 深拷贝
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = this.addForm.goods_cat.join(",");
        // 表单添加动态属性
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };
          this.addForm.attrs.push(newInfo);
        });
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;
        // 商品名称必须唯一
        const { data: res } = await this.$axios.post("goods", form);
        if (res.meta.status !== 201) {
          this.addForm.attrs = [];
          if (res.meta.msg === "创建商品基本信息失败") return this.$message.error("已存在商品名称");
          return this.$message.error("添加商品失败");
        }
        this.$message.success("添加商品成功");
        this.$router.push("/goods");
      });
    },
  },
  computed: {
    catID() {
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2];
      return null;
    },
  },
};
</script>
<style lang="less" scoped>
.addBtn {
  margin-top: 15px;
}
.el-image {
  width: 100%;
}
</style>
