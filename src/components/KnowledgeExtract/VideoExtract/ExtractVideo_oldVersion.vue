<template>
  <el-container>
    <!--内容块-->
    <el-main>
      <!--顶部-->
      <div class="header">
        视频抽取
        <el-button type="primary" class="darkBtn headbutton" size="small" @click="onUpload">上传与分析</el-button>
        <el-button type="primary" class="darkBtn headbutton" size="small" >训练</el-button>
      </div>
      <!-- 上传窗口-->
      <div id="upload" v-if="isUpload">
        <el-card class="box-card">
        <div slot="header" class="clearfix">
            <span>数据上传</span>
            <i class="el-icon-close" style="float: right; padding: 3px 0" @click="cancelUpload"></i>
        </div>
        <el-upload
            class="upload-demo"
            drag
            ref="upload"
            :auto-upload="false"
            accept=".mp4"
            action="https://jsonplaceholder.typicode.com/posts/"
            :on-remove="handleRemove"
            :on-change="handleAddFile"
            :file-list="uploadList"
            :limit="1"
            :on-exceed="handleExceed"
            multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">
            仅支持上传mp4文件<br>
            限制上传1个视频<br>
            </div>
        </el-upload>
        <el-button size="small" @click="cancelUpload">取消</el-button>
        <el-button style="margin-left: 10px;" class="darkBtn" size="small" type="primary" @click="submitUpload">上传并分析</el-button>
        </el-card>
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <div class="main"
           v-loading="loadingRes"
           element-loading-text="视频正在分析中，请稍等……"
           element-loading-spinner="el-icon-loading"
           element-loading-background="rgba(0, 0, 0, 0.1)"
      >
        <div v-if="!flag" style="margin-left:50px;">提示：请先上传视频进行分析</div>
        <div class="resultContainer" style="height:50px;" v-if="vedioList.length!==0">
          <div class="picStyle title">抽取结果</div>
          <div class="graphStyle title">实体关系展示</div>
          <el-button type="primary" class="blueBtn" size="small" @click="handleExport">导出</el-button>
        </div>
        <div v-for="(item, index) in vedioList" v-bind:key="index">
          <div class="resultContainer">
            <div class="picStyle" style="display:flex; flex-direction: row;flex-wrap:wrap;">
              <video :src="item.src" controls="controls" style="width:100%;"></video>
              <!-- <video preload controls loop style="width:100%;">
                <source :src="item.src" type="video/mp4" />
                您的浏览器不支持HTML5的vedio标签。
              </video> -->
              <div style="text-align: center;font-weight: bold;width: 100%">文件名</div>
            </div>
            <v-echart :id="'graph'+index" class="graphStyle" :options="item.options" @click="clickChart"></v-echart>
          </div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  let categories=[
    {name:'实体'},
  ];
  export default {
    name: 'ExtractVideo_oldVersion',
    data () {
      return {
        vedioList: [],
        isUpload:false,
        uploadList:[],
        optList:[],
        flag:false,
        optIndex:'',
        //文件名
        fileName:'',
        //三元组数据
        tripleData:[],
        loadingRes:false,
      }
    },

    methods: {
      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      },
      onUpload(){
        this.isUpload = true;
      },
      cancelUpload(){
        this.isUpload=false;
        this.uploadList=[];
      },
      clickChart(event, instance, echarts){
        let obj = arguments[0].data;
        console.log(obj);
        if(obj.hasOwnProperty("source"))//links
        {
          //obj.source+obj.name+obj.target 头节点、关系、尾节点
          this.$http.get('http://49.232.95.141:8000/search_entity?head='+obj.source+"&relation="+obj.name+"&tail="+obj.target).then(
            (res) => {
          })
        }
        else //points
        {
          //实体名为obj.name
          this.$http.get('http://49.232.95.141:8000/search_entity?entity='+obj.name).then((res) => {
          })
        }
      },
      submitUpload() {
        this.loadingRes=true;
        this.flag = true;
        this.isUpload = false;
      //上传
        let fd = new FormData()
        fd.append('video',this.uploadList[0].raw)
        this.$http.post(
          'http://49.232.95.141:8000/pic/video_extract',fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then((res) => {
          console.log(res.data);
          this.vedioList = [];
          let graphLinks=[
            {
              source: 'node01',
              target: 'node02',
              name: 'link01',
              des: 'link01des',
              address:'1234',
            }, {
              source: 'node01',
              target: 'node03',
              name: 'link02',
              des: 'link02des',
              address:'1234',
            }, {
              source: 'node01',
              target: 'node04',
              name: 'link03',
              des: 'link03des',
              address:'1234',
            }, {
              source: 'node01',
              target: 'node05',
              name: 'link04',
              des: 'link05des',
              address:'1234',
            }];
          let graphPoints=[
            {
              name: 'node01',
              des: 'nodedes01',
              symbolSize: 70,
              category: 0,
            }, {
              name: 'node02',
              des: 'nodedes02',
              symbolSize: 50,
              category: 0,
            }, {
              name: 'node03',
              des: 'nodedes3',
              symbolSize: 50,
              category: 0,
            }, {
              name: 'node04',
              des: 'nodedes04',
              symbolSize: 50,
              category: 0,
            }, {
              name: 'node05',
              des: 'nodedes05',
              symbolSize: 50,
              category: 0,
            }];
          //设置echarts
          let option = {
            // 图的标题
            title: {
              text: 'test'
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
              data: graphPoints,
              links: graphLinks,
              categories: categories,
            }],
            grid: {
              top: "10px",
              bottom: "10px",
              height: "10px",
              width: "10px"
            }
          };
          this.vedioList.push({src:res.data, options:option});
          this.fileName = this.uploadList[0].name;
          //清空上传列表
          this.uploadList=[];
          this.loadingRes=false;
        }).catch((res) => {
          //请求失败
          this.loadingRes=false;
        });

      },
      handleRemove(file, fileList) {
        this.uploadList = fileList;
      },
      handleAddFile(file,fileList){
        console.log(file);
        console.log(fileList);
        this.uploadList = fileList;
      },
      //导出三元组
      handleExport(){
        // 处理数据
        let data="head,relation.tail\n";
        this.tripleData.forEach(function (item,index) {
          data+=item.source+","+item.name+","+item.target+"\n";
        });
        let filename = this.fileName.split(".")[0];
        console.log(filename);
        //创建<a>下载文件
        let export_blob = new Blob([data],{type: 'text/csv',endings : 'native'});
        let save_link = document.createElement("a");
        save_link.href = URL.createObjectURL(export_blob);
        save_link.download = filename+".csv";
        save_link.click();
      },
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
  .el-submenu{
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

  #daddy{
    width:100%;
    height: 100%;
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
    height: 32px;
    margin-right: 20px;
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
  /*视频及echarts样式*/
  .resultContainer{
    height: 500px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .picStyle{
    height:100%;
    width:50%;
    /* border-right: solid 1px #DCDFE6; */
    padding-right: 40px;
    padding-left: 20px;
  }

  .graphStyle{
    height:100%;
    width:50%;
    padding-left: 40px;
  }

  .el-image{
      height:100% !important;
  }

  .title{
    text-align: left;
    font-weight: bold;
    font-size: large;
    padding-bottom: 30px;
  }

  .picName{
    width:50px;
    text-align: center;
    /* border-right: solid 1px #DCDFE6; */
    padding-right: 40px;
  }
</style>
