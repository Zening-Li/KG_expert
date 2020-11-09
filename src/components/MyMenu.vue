<template>
  <el-menu
      :default-active="$route.path"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#2C2B31"
      text-color="#fff"
      active-text-color="#409EFF"
      :router="true"
      style="position:absolute; right:0;border:none;"
      @select="selectMenu">
      <el-menu-item index="/relationalData">数据浏览</el-menu-item>
      <el-menu-item index="/definelabel">数据标注</el-menu-item>
      <el-menu-item index="/">知识抽取</el-menu-item>
      <el-menu-item index="/correct">知识校正</el-menu-item>
      <el-menu-item index="/entitySearch">知识检索</el-menu-item>
    </el-menu>
</template>

<script>
  export default {
    name: 'MyMenu',
    data () {
      return {
        activeIndex:''
      }
    },
    methods:{
      selectMenu(index){
        this.activeIndex = index;
        this.$store.dispatch('changeIndex',index);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.is-active{
    background-color: rgba(255, 255, 255, 0.2)  !important;
    color: white !important;
    border-bottom: none !important;
    border-top: 4px solid #5775FB !important;
}
</style>
