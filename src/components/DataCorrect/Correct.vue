<template>
  <el-container>
    <!--内容块-->
    <el-main>
      <el-row type="flex" align="middle">
      <el-col class="header" :span="22">
        文本加工任务
      </el-col>
      <el-col :span="2">
        <el-button id="save">保存</el-button>
      </el-col>
      </el-row>
      <el-divider></el-divider>
      <div class="content">
        <el-table
          :data="tableData.slice((curPage - 1) * 10, curPage * 10)"
          height="626"
          border>
          <el-table-column
            prop="title"
            label="名称">
          </el-table-column>
          <el-table-column
            prop="tail"
            label="尾实体"
            width="500">
          </el-table-column>
          <el-table-column
            label="操作"
            width="170">
            <template slot-scope="scope">
              <el-button @click="handleModify(scope.row)" class="blueBtn" size="small">修改</el-button>
              <el-button @click="handleDelete(scope.row)" type="danger" plain size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-pagination
        background
        layout="total, jumper"
        :total="fileCount"
        @current-change="handleCurrentChange"
        style="margin-top:20px;">
      </el-pagination>
    </el-main>
  </el-container>
</template>

<script>
  export default {
    name: 'Correct',
    data () {
      return {
        tableData: [
          {
            tail: '横沙岛',
            title: '两栖装甲旅',
          },
          {
            tail: '横沙岛',
            title: '海岸炮兵旅',
          },
          {
            tail: '长兴岛',
            title: '坦克旅',
          },
          {
            tail: '黄沙岛',
            title: '机械化旅',
          },
          {
            tail: '助攻攻击群',
            title: '助攻攻击群',
          },
          {
            tail: '主攻攻击群',
            title: '主攻攻击群',
          },
          {
            tail: '苏门答腊',
            title: '步兵旅',
          },
          {
            tail: '陆战大富翁区',
            title: '一师',
          },
        ],
        curPage:1,
        fileCount:0
      }
    },
    methods: {
      handleDelete(row) {
        console.log(row);
      },
      handleModify(row) {
        console.log(row);
      },
      handleCurrentChange(cpage) {
        this.curPage = cpage;
      },
    },
    mounted() {
      this.fileCount = this.tableData.length;
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
  }


  body > .el-container {
    width: 100%;
    height: 100%;
  }

  .el-aside {
    background-color: #343643;
  }

  .el-main {
    background-color: #F1F2F6;
    color: #333;
    text-align: center;
    min-height: calc(100% - 0px);
  }

  .header{
    height: 20px;
    line-height: 20px;
    text-align: left;
    margin: 20px 0 0 20px;
    /* font-weight: bold; */
    /* font-size: 1.17em; */
  }

  .content{
    /* min-height: calc(100% - 88px); */
    background-color: #FFF;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    border-radius: 4px;
    padding:0 0 20px 0;
  }

  .is-active {
    background-color: rgba(255,255,255,0.2) !important;
    border-right: 4px solid #5775FB !important;
  }

  .blueBtn{
    background-color: #EFF0FF;
    border: 1px solid #108cee;
    color: #5775FB;
  }

  .blueBtn:hover{
    background-color: #108cee;
    color: #FFFFFF;
  }

  #save{
    background-color: #108cee;
    border: 1px solid #108cee;
    color: #FFFFFF;
  }
  #save:hover{
    background-color: #108cee;
  }
</style>
