<template>
  <el-dropdown>
      <el-button type="primary">
      {{username}}<i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
      <el-dropdown-item>登出</el-dropdown-item>
      </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
  export default {
    name: 'MyDropdown',
    props:["username"],
    data () {
      return {
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-button {
  background-color:transparent;
  border-color: transparent;
}
</style>
