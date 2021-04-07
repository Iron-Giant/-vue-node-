<template>
  <div>
    <!-- 这嵌套了一层template就是为了解决v-for不和v-if一起使用 -->
    <template v-for="(item, i) in menuList">
      <el-submenu v-if="item.children" :index="i + ''" :key="i + 66">
        <template slot="title">
          <i class="el-icon-menu"></i>
          <span slot="title">{{ item.authName }}</span>
        </template>
        <self-Menu :menu-list="item.children" />
      </el-submenu>
      <el-menu-item v-if="!item.children" :index="item.id + ''" :key="item.path" class="el-menu-item-wrap">
        <i class="el-icon-menu"></i>
        <span slot="title">{{ item.authName }}</span>
      </el-menu-item>
    </template>
  </div>
</template>

<script>
export default {
  name: "self-Menu",
  //props属性父组件传过来的,并且在模板中递归的时候需要
  props: ["menuList"],
};
</script>
<style scoped>
.el-menu-item-wrap {
  margin: 15px 0 15px 0;
}
</style>
