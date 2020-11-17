<template>
  <el-container>
    <!-- 左侧导航栏-->
    <el-aside width="200px">
      <el-menu
        default-active=""
        background-color="#343643"
        text-color="#fff"
        active-text-color="#fff"
        :router="true">
        <el-menu-item index="/definelabel">
          <i class="el-icon-menu"></i>
          <span slot="title" >模式定义</span>
        </el-menu-item>
        <el-menu-item index="/corpustagging">
          <i class="el-icon-document"></i>
          <span slot="title">语料标注</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <!--内容块-->
    <router-view/>
  </el-container>
</template>

<script>
  export default {
    name: 'DataLabel',
    data () {
      return {
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  html,body,.el-container{
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding: 0;
    overflow: hidden;
  }


  body > .el-container {
    width: 100%;
    height: 100%;
  }

  .el-aside {
    background-color: #343643;
    min-height: calc(100% - 0px);
  }

  .el-main {
    background-color: #F1F2F6;
    color: #333;
    text-align: center;
    height: 100%;
  }

  .el-menu-item{
    width: 200px;
  }

.is-active {
  background-color: rgba(255,255,255,0.2) !important;
  border-right: 4px solid #5775FB !important;
}
</style>
