<template>
  <el-container>
    <!--内容块-->
    <el-main v-if="isList">
      <!--顶部-->
      <div class="header">
        <i class="el-icon-back" v-if="!sourceFlag" @click="backToSource" style="margin-right:10px;"></i>
        数据浏览
        <!-- <el-button type="primary" class="darkBtn headbutton" size="small" @click="isUpload=true">上传与分析</el-button>
        <el-button type="primary" class="darkBtn headbutton" size="small" >训练</el-button> -->
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--      列表页-->
      <div class="main" >
        <div class="top-tip" v-if="sourceFlag">
          <span>请选择数据源：</span>
          <el-select v-model="sourceIndex" placeholder size="small" style="margin-left:52px;">
            <el-option v-for="(item, index) in sourceList" :key="index" :label="item" :value="item"></el-option>
          </el-select>
          <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="chooseSource">确定</el-button>
        </div>
        <div class="top-tip" v-if="!sourceFlag">
          请选择表格：
          <el-select v-model="tableIndex" placeholder="" size="small" style="margin-left:20px;">
            <el-option
              v-for="(item, index) in properties"
              :key="index"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
          <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="chooseTable">确定</el-button>
          <el-button type="primary" class="darkBtn headbutton" size="small" @click="isUpload=true">上传</el-button>

          <!-- <el-button type="primary" class="darkBtn" size="small" style="float:right; margin-right:20px;" @click="showGraph">查看图谱</el-button> -->
        </div>
        <!-- 上传窗口-->
        <div id="upload" v-if="isUpload">

          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>数据上传</span>
              <i class="el-icon-close" style="float: right; padding: 3px 0" @click="cancelUpload"></i>
            </div>
            <el-form :model="uploadForm" label-position="left" label-width="80px">
              <el-form-item label="表名:">
                <el-input v-model="uploadForm.tableName"></el-input>
              </el-form-item>
              <el-form-item label="主键列名">
              <el-input v-model="uploadForm.keyName"
                        placeholder="若主键有多列请用半角逗号 “,” 隔开"></el-input>
            </el-form-item>
            </el-form>
            <el-upload
              class="upload-demo"
              drag
              ref="upload"
              :auto-upload="false"
              accept=".csv"
              action=" "
              :limit="1"
              :on-remove="handleRemove"
              :on-change="handleAddFile"
              :file-list="fileList">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">
                仅支持上传csv文件<br>
              </div>
            </el-upload>
            <el-button size="small" @click="cancelUpload">取消</el-button>
            <el-button style="margin-left: 10px;" class="darkBtn" size="small" type="primary" @click="submitUpload">上传</el-button>
          </el-card>
        </div>
        <!--结构化数据列表-->
        <el-table
          :data="tableData.slice((curPage - 1) * 10, curPage * 10)"
          :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
          height="626"
          border
          v-loading="loadingRes"
          element-loading-text="正在加载中，请稍等……"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.2)">
          <el-table-column
            v-for="(item, index) in columnNames"
            :key="index"
            :prop="item.prop"
            :label="item.label">
          </el-table-column>
          <!-- <el-table-column
            label="操作"
            align="center">
            <template slot-scope="scope">
              <el-button class="blueBtn" @click="handleAnalysis(scope.row)" type="primary" plain size="small">分析</el-button>
            </template>
          </el-table-column> -->
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
    <!--分析页-->
    <el-main v-show="!isList">
      <!--顶部-->
      <div class="header">
        <i class="el-icon-back" @click="isList=true"></i>
        <el-button class="headbutton darkBtn" size="small" @click="handleExport">导出</el-button>
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <div class="main" id="daddy">
        <div id="graph" :style="{width: graphWidth,height:graphHeight}"></div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  let echarts = require('echarts');
  let myChart;
  // window.onresize = function() {
  //   document.getElementById("graph").style.width="100%";
  //   document.getElementById("graph").style.height="100%";
  //   myChart.resize();
  // };

  export default {
    name: "ViewData",
    data () {
      return {
        loadingRes:false,
        sourceIndex:"",
        sourceList:["structData", "structData2","structData3"],
        sourceFlag:true,
        isList:true,
        fileCount:0,
        isUpload:false,
        uploadForm:{
          tableName:'',
          keyName:''
        },
        curPage:1,
        //上传的文件列表
        fileList: [],
        //表格数据，结构化数据列表
        tableData: [],
        //选中行
        choosenRow:{},
        //三元组数据
        tripleData:[],
        properties:[],
        tableIndex:"",
        columnNames:[],
        //图谱
        graphWidth:"100%",
        graphHeight:"100%",
      }
    },

    methods: {
      backToSource() {
        this.tableIndex='';
        this.sourceIndex ='';
        this.tableData=[]
        this.columnNames=[]
        this.sourceFlag=true;
      },
      chooseSource() {
        let fd = new FormData()
        fd.append("source", this.sourceIndex)
        this.$http.post("http://39.102.71.123:23352/pic/struct_data_source",fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then(res => {
            console.log(res)
            this.properties = res.data
            this.sourceFlag = false;
          }).catch(res => {
            console.log(res)
          })
      },
      chooseTable() {
        // console.log(this.tableIndex)
        if(this.tableIndex === '') return;

        this.columnNames = []
        this.tableData = []
        this.loadingRes = true;
        let fd = new FormData()
        fd.append('table',this.tableIndex)
        fd.append("source", this.sourceIndex);
        this.$http.post(
          'http://39.102.71.123:23352/pic/view_structData',fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((res) => {
          this.columnNames = res.data[0].map((cur) => {
            return {prop:cur, label:cur}
          })

          let column = res.data[0]
          this.tableData = res.data[1].map((cur) => {
            let res={}
            for(let i = 0; i < column.length; i ++)
              res[column[i]] = cur[i]
            return res
          })

          this.fileCount = res.data[1].length
          this.loadingRes = false;
        }).catch((res) => {
          //请求失败
          console.log(res)
          this.loadingRes = false;
        })
      },
      cancelUpload(){
        this.isUpload=false;
        this.fileList=[];
      },
      submitUpload() {
        if(this.properties.indexOf(this.uploadForm.tableName)!==-1){
          this.$message.error("表格名不能重复，请重新输入！")
          return;
        }
        if(!this.fileList.length||!this.uploadForm.tableName||!this.uploadForm.keyName){
          this.$message.error("请完善输入信息并选择上传文件！")
          return;
        }
        if(this.uploadForm.keyName.indexOf("，")!==-1){
          this.$message.error("请使用半角逗号 "," 分隔主键！")
          return;
        }
        let fd = new FormData()
        fd.append("database", this.sourceIndex.toString())
        fd.append("csv_file", this.fileList[0].raw)
        fd.append('table_name',this.uploadForm.tableName.toString())
        fd.append('primary_key',this.uploadForm.keyName.toString())
        console.log(this.sourceIndex,this.uploadForm.tableName,this.uploadForm.keyName)
        console.log(this.fileList[0].raw)
        this.$http.post(
          'http://39.102.71.123:23352/pic/submit_struct_data', fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((res) => {
            console.log(res)
          let ffd = new FormData()
          ffd.append("source", this.sourceIndex)
          this.$http.post("http://39.102.71.123:23352/pic/struct_data_source",ffd,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }).then(res => {
            this.properties = res.data
            this.sourceFlag = false;
          }).catch(res => {
            console.log(res)
          })
        }).catch(res=>{
            console.log(res)
        });
        // this.$refs.upload.submit();
        for(let i=0;i<this.fileList.length;i++) {
          console.log(this.fileList[i].raw)
        }
        this.isUpload = false;
        this.fileList =[];
        this.uploadForm.keyName="";
        this.uploadForm.tableName="";

        //刷新列表
        // this.chooseSource();
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
      showGraph(){
        this.$http.post(
          'http://39.102.71.123:23352/pic/struct_extract',
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((res) => {
          console.log(res)
          let graphPoint = [];
          let graphLink = [];
          let pointSet = new Set();
          for(let i = 0; i < res.data.length; i ++){
            let tmp = {};
            tmp.entity1 = res.data[i][0]+"";
            tmp.entity2 = res.data[i][2]+"";
            tmp.relation = res.data[i][1]+"";

            if(!pointSet.has(tmp.entity1)) {
              pointSet.add(tmp.entity1);
              graphPoint.push({name:tmp.entity1,category:1,des:tmp.entity1});
            }
            if(!pointSet.has(tmp.entity2)) {
              pointSet.add(tmp.entity2);
              graphPoint.push({name:tmp.entity2,category:1,des:tmp.entity2});
            }

            graphLink.push({
              source: tmp.entity1,
              target: tmp.entity2,
              name: tmp.relation,
              des: tmp.entity1 + "->" + tmp.entity2
            });
          }
          let categories=[
            {name:'属性A'},
            {name:'属性B'},
          ];
          let option ={
            // 图的标题
            title: {
              text: ""
            },
            // 提示框的配置
            tooltip: {
              formatter: function (x) {
                return x.data.des;
              }
            },
            // 工具箱
            toolbox: {
              // 显示工具箱
              show: true,
              feature: {
                mark: {
                  show: true
                },
                // 还原
                restore: {
                  show: true
                },
                // 保存为图片
                saveAsImage: {
                  show: true
                }
              }
            },
            legend: [{
              // selectedMode: 'single',
              data: categories.map(function (a) {
                return a.name;
              })
            }],
            series: [{
              type: 'graph', // 类型:关系图
              layout: 'force', //图的布局，类型为力导图
              symbolSize: 40, // 调整节点的大小
              roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
              edgeSymbol: ['circle', 'arrow'],
              edgeSymbolSize: [2, 10],
              edgeLabel: {
                normal: {
                  textStyle: {
                    fontSize: 20
                  }
                }
              },
              force: {
                repulsion: 2500,
                edgeLength: [10, 50]
              },
              draggable: true,
              lineStyle: {
                normal: {
                  width: 2,
                  color: '#4b565b',
                }
              },
              edgeLabel: {
                normal: {
                  show: true,
                  formatter: function (x) {
                    return x.data.name;
                  }
                }
              },
              label: {
                normal: {
                  show: true,
                  textStyle: {}
                }
              },
              // 数据
              data: graphPoint,
              links: graphLink,
              categories: categories,
            }],
            grid:{
              top:"10px",
              bottom:"10px",
              height:"10px",
              width:"10px"
            }
          }

          myChart= echarts.init(document.getElementById('graph'));
          // 绘制图表
          myChart.setOption(option);

          this.isList = false;

        }).catch((res) => {
          //请求失败
          console.log(res)
        })
      },

      //导出三元组
      handleExport(){
        //处理数据
        let data="head,relation,tail\n";
        this.tripleData.forEach(function (item,index) {
          data+=item.source+","+item.name+","+item.target+"\n";
        });
        let filename = this.choosenRow.title.split(".")[0];
        console.log(filename);
        //创建<a>下载文件
        let export_blob = new Blob([data],{type: 'text/csv',endings : 'native'});
        let save_link = document.createElement("a");
        save_link.href = URL.createObjectURL(export_blob);
        save_link.download = filename+".csv";
        save_link.click();
      },
    },

  }
</script>

<style scoped>
  html,body,.el-container{
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding: 0;
    overflow: hidden;
  }
  /****************整体布局*******************/

  body > .el-container {
    width: 100%;
    height: 100%;
  }
  .el-aside {
    background-color: #343643;
    min-height: calc(100% - 60px);
  }
  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: left;
    height: 100%;
    background-color: #F1F2F6;
  }

  /**************左侧导航栏***************/
  .is-active {
    background-color: rgba(255,255,255,0.2) !important;
    border-right: 4px solid #5775FB !important;
  }
  .el-menu-item{
    text-align: left;
    width: 200px;
  }

  /**************内容顶部***************/
  .header{
    width: 100%;
    height: 20px;
    line-height: 20px;
    text-align: left;
    margin-left: 20px;
    font-weight: bold;
    font-size: large;
  }
  .headbutton{
    float: right;
    margin-right: 40px;
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

  .el-pagination.is-background .el-pager li:not(.disabled).active{
    background-color: #5775FB !important;
  }
  .el-pagination.is-background .el-pager li:hover{
    color: #5775FB !important;
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

  /***********按钮样式***********/
  .blueBtn{
    background-color: #EFF0FF;
    border: 1px solid #5775FB;
    color: #5775FB;
  }

  .blueBtn:hover,.blueBtn:active, .blueBtn:focus{
    background-color: #5775FB;
    color: #FFFFFF;
  }

  .darkBtn{
    background-color: #5775FB;
    border: 1px solid #5775FB;
    color: #FFFFFF;
  }
  .darkBtn:hover{
    background-color: #708BF7;
  }
  .el-table >>> .el-table__body-wrapper{
    overflow: auto !important;
  }
</style>
