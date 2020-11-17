<template>
  <span class="tagWrapper">
    <span class="grey">{{name}}</span>
    <span class="blue">{{range}}</span>
    <i class="el-icon-close" v-on:click="$emit('closeRelationTag')"></i>
  </span>
</template>

<script>
  export default {
    name: 'MyPropertyTag',
    props:["name", "range"],
    data () {
      return {
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .tagWrapper{
    background-color: #F1F1FD;
    border-color: #E4E7ED;
    display: inline-block;
    height: 32px;
    padding: 0 10px;
    line-height: 30px;
    font-size: 12px;
    color: #5775FB;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    white-space: nowrap;
    margin-right: 10px;
  }
  .el-icon-close{
    border-radius: 50%;
    text-align: center;
    position: relative;
    cursor: pointer;
    font-size: 12px;
    height: 16px;
    width: 16px;
    line-height: 16px;
    vertical-align: middle;
    top: -1px;
    right: -5px;
  }
  i:hover{
      color:#FFFFFF;
      background-color: #108cee;
  }
  .grey{
      color: #909399;
  }
  .blue{
      color: #5775FB;
  }
</style>
