<template>
  <el-container>
    <!--内容块 语料标注-->
    <el-main>
      <div class="header">
        <el-button type="primary" class="darkBtn headbutton" size="small" @click="isUpload=true">上传</el-button>
        <el-button type="primary" class="blueBtn" style="float:right; margin-right:10px;" size="small" >导出</el-button>
      </div>
      <el-divider></el-divider>

      <div class="main">
        <div class="top-tip">
          数据总量:{{fileCount}}
        </div>

        <div id="upload" v-if="isUpload">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>语料上传</span>
              <i class="el-icon-close" style="float: right; padding: 3px 0;" @click="cancelUpload"></i>
            </div>
            <el-upload
              class="upload-demo"
              drag
              ref="upload"
              :auto-upload="false"
              accept=".txt,.xls,.xlsx,.json"
              action="https://jsonplaceholder.typicode.com/posts/"
              :on-remove="handleRemove"
              :on-change="handleAddFile"
              :file-list="fileList"
              multiple>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">
                支持上传Excel文件、Json文件以及txt文件<br>
                Excel文件第一行为title，第二行为text<br>
                Json数据结构为对象数组，对象属性值含有title和text<br>
              </div>
            </el-upload>
            <el-button size="small" @click="cancelUpload">取消</el-button>
            <el-button style="margin-left: 10px;" class="darkBtn" size="small" type="primary" @click="submitUpload">上传</el-button>
          </el-card>
        </div>
        <!--文书列表-->
        <el-table
          :data="tableData.slice((curPage - 1) * 10, curPage * 10)"
          :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
          height="626"
          border>
          <el-table-column
            prop="title"
            label="标题">
          </el-table-column>
          <el-table-column
            prop="state"
            label="状态"
            width="60">
          </el-table-column>
          <el-table-column
            prop="date"
            label="完成时间"
            width="180">
          </el-table-column>
          <el-table-column
            label="操作"
            width="100"
            align="center">
            <template slot-scope="scope">
              <el-button class="blueBtn" @click="handleAnalysis(scope.row)" type="primary" plain size="small">标注</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页符-->
        <el-pagination
          background
          layout="prev, pager, next"
          :total="fileCount"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  export default {
    name: 'CorpusTagging',
    data () {
      return {
        isList:true,
        isUpload:false,
        fileCount:0,
        curPage:1,
        //上传的文件列表
        fileList: [],
        //表格数据，文书列表
        tableData: []
      }
    },


    methods: {
      cancelUpload(){
        this.isUpload=false;
        this.fileList=[];
      },
      submitUpload() {
        let now = new Date();
        let date =  now.getFullYear() + "-" + ((now.getMonth() + 1) < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
        this.$refs.upload.submit();
        for(let i=0;i<this.fileList.length;i++) {
          this.tableData.push({
            date:  date,
            title: this.fileList[i].raw.name
          })
        }
        this.fileCount = this.tableData.length;
        this.fileList = [];
      },
      handleRemove(file, fileList) {
        this.fileList = fileList;
      },
      handleAddFile(file,fileList){
        this.fileList = fileList;
      },
      handleCurrentChange(cpage) {
        this.curPage = cpage;
      },
      handleAnalysis(row){
        console.log(row);
        this.isList = false;
      },
      handleExport(){

      },
    },

    mounted() {
      for(let i = 0; i < 19; i ++){
        this.tableData.push({
          date: '2016-05-03',
          title: '文书'+i,
          state: '就绪'
        })
      }
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

  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: left;
    height: 100%;
    background-color: #F1F2F6;
  }

  .header{
    width: 100%;
    height: 20px;
    line-height: 20px;
    text-align: left;
  }
  .headbutton{
    float: right;
  }
  .darkBtn{
    background-color: #5775FB;
    border: 1px solid #5775FB;
    color: #FFFFFF;
  }
  .darkBtn:hover{
    background-color: #708BF7;
  }

  .blueBtn{
    background-color: #EFF0FF;
    border: 1px solid #5775FB;
    color: #5775FB;
  }

  .blueBtn:hover,.blueBtn:active{
    background-color: #5775FB;
    color: #FFFFFF;
  }

  .blueBtn:active{
    background-color: #5775FB;
    color: #FFFFFF;
  }

  .top-tip{
    margin-top: -10px;
    margin-bottom: 10px;
    padding-left: 20px;
  }
  /*************内容中心*************/
  .main{
    line-height: 30px;
    height: 90%;
    width: 100%;
  }
  /*表格*/
  .el-table{
    height: 80%;
    width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  }
  /*分页符*/
  .el-pagination{
    right: 60px;
    height: 10%;
    text-align: right;
    margin-top: 40px;
  }

  /***************上传弹窗***********/
  #upload{
    text-align: center;
    z-index: 99;
    position: fixed;
    top: 20%;
    left: 30%;
    right: 30%;
  }
  .upload-demo{
    margin-bottom: 20px;
  }
  .el-upload__tip{
    padding-left: 30%;
    text-align: left;
  }
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

</style>
<style>
  .el-pagination.is-background .el-pager li:not(.disabled).active{
    background-color: #5775FB !important;
  }
  .el-pagination.is-background .el-pager li:hover{
    color: #5775FB !important;
  }
</style>
