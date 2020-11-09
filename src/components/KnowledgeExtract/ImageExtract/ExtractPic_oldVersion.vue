<template>
  <el-container>
    <!--内容块-->
    <el-main>
      <!--顶部-->
      <div class="header">
        图片抽取
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
            accept=".jpg,.jpeg"
            action="https://jsonplaceholder.typicode.com/posts/"
            :on-remove="handleRemove"
            :on-change="handleAddFile"
            :file-list="uploadList"
            :limit="3"
            :on-exceed="handleExceed"
            multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">
            支持上传jpg文件及jpeg文件<br>
            限制上传最多3张图片<br>
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
           element-loading-text="图片正在分析中，请稍等……"
           element-loading-spinner="el-icon-loading"
           element-loading-background="rgba(0, 0, 0, 0.1)"
      >
        <div v-if="!flag" style="margin-left:50px;">提示：请先上传图片进行分析</div>
        <div class="resultContainer" style="height:50px;border:none;" v-if="picList.length!==0">
          <div class="picStyle title" style="height:50px;">抽取结果</div>
          <div class="graphStyle title" style="height:50px;">实体关系展示</div>
        </div>
        <div v-for="(item, index) in picList" v-bind:key="index">
          <div class="resultContainer">
            <!-- <div class="picName">
              <span style="position:relative; top:230px;">
                图{{index + 1}}
              </span>
            </div> -->
            <div class="picStyle">
              <el-image :src="item.src"  fit="contain">
                  <div slot="placeholder" class="image-slot">
                      加载中<span class="dot">...</span>
                  </div>
              </el-image>
              <div style="text-align: center;font-weight: bold;width: 100%">
                图{{index + 1}}
                <el-button type="primary" class="blueBtn" size="small" @click="handleExport(index)">导出</el-button>
              </div>
            </div>
            <div class="graphStyle">
              <v-echart :id="'graph'+index" style="width:100%;height:100%;" :options="item.options" @click="clickChart"></v-echart>
            </div>
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
    name: 'ExtractPic',
    data () {
      return {
        picList: [],
        isUpload:false,
        uploadList:[],
        optList:[],
        flag:false,
        optIndex:'',
        //三元组数组
        // [
        // [[ent1,rel,ent2],[ent1,rel,ent2]……]图1
        // [[ent1,rel,ent2],[ent1,rel,ent2]……]图2
        // [[ent1,rel,ent2],[ent1,rel,ent2]……]图2
        // ]
        tripleData:[],
        loadingRes:false,
      }
    },

    methods: {
      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
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
          // this.$http.get('http://39.102.71.123:23352/search_entity?head='+obj.source+"&relation="+obj.name+"&tail="+obj.target).then(
          //   (res) => {
          //   })
          alert("1");
        }
        else //points
        {
          //实体名为obj.name
          // this.$http.get('http://39.102.71.123:23352/search_entity?entity='+obj.name).then((res) => {
          // })
          alert("2");
        }
      },
      submitUpload() {
        //上传的请求
        this.loadingRes = true;
        let fd = new FormData();
        for(let i=0;i<this.uploadList.length;i++)
          fd.append('pic',this.uploadList[i].raw)
        this.$http.post('http://39.102.71.123:23352/pic/pic_extract',fd,
          {
            headers: {'Content-Type': 'multipart/form-data'}
          }).then((res) => {
            //清空上传列表
            this.uploadList=[];
            //成功 设置echarts
            console.log(res);
            this.tripleData=res.data[1];
            this.picList = [];
            for(let i=0; i<res.data[0].length; i++)//遍历图片
            {
              let graphPoint=[];
              let graphLink=[];
              let tmpPoints=[];
              for(let j=0;j<res.data[1][i].length;j++)//遍历第i张图的三元组
              {
                let tmpLink={};
                if(tmpPoints.indexOf(res.data[1][i][j][0])===-1)
                  tmpPoints.push(res.data[1][i][j][0]);
                if(tmpPoints.indexOf(res.data[1][i][j][2])===-1)
                  tmpPoints.push(res.data[1][i][j][2]);
                tmpLink.source=res.data[1][i][j][0];//第i张图第j个三元组
                tmpLink.name=res.data[1][i][j][1];
                tmpLink.des=tmpLink.name;
                tmpLink.target=res.data[1][i][j][2];
                graphLink.push(tmpLink);
              }
              for(let j =0;j<tmpPoints.length;j++)
              {
                let tmpEnt ={};
                tmpEnt.des =tmpPoints[j];
                tmpEnt.name=tmpPoints[j];
                tmpEnt.category=0;
                graphPoint.push(tmpEnt);
              }
              let option ={
                // 图的标题
                // title: {
                //   text: ''
                // },
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
                    repulsion: 2500,//节点间的斥力因子。
                    gravity : 1,//节点受到的向中心的引力因子。该值越大节点越往中心点靠拢。
                    edgeLength: [10, 50],
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
              };
              this.picList.push({src: res.data[0][i], options:option})
            }
            this.loadingRes = false;
            this.uploadList = []
          }).catch((e)=>{
          this.loadingRes = false;
          console.log(e)
        });
        this.flag = true;
        this.isUpload = false;
      },
      handleRemove(file, fileList) {
        this.uploadList = fileList;
      },
      handleAddFile(file,fileList){
        console.log(file);
        console.log(fileList);
        this.uploadList = fileList;
      },
      handleExport(index) {
        //导出三元组
        //处理数据
        let data="head,relation,tail\n";
        let tripleData=this.tripleData[index];
        for(let i=0;i<tripleData.length;i++)
        {
          data+=tripleData[i][0]+","+tripleData[i][1]+","+tripleData[i][2]+"\n";
        }
        let filename = "图片"+index;
        //创建<a>下载文件
        let export_blob = new Blob([data],{type: 'text/csv',endings : 'native'});
        let save_link = document.createElement("a");
        save_link.href = URL.createObjectURL(export_blob);
        save_link.download = filename+".csv";
        save_link.click();
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
    width: 100%;
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
    margin-left: 5%;
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
  /*图片及echarts样式*/
  .resultContainer{
    height: 500px;
    width: 100%;
    padding:0 20px;
    display: flex;
    justify-content: center;
    margin-top: 20px;
    border-bottom: solid 1px #DCDFE6;
  }

  .picStyle{
    height:450px;
    width:600px;
    /* border-right: solid 1px #DCDFE6; */
    padding-right: 70px;
  }

  .graphStyle{
    height:100%;
    width:600px;
    padding-left: 70px;
  }

  .el-image{
      height:100% !important;
  }

  .title{
    /* text-align: center; */
    font-weight: bold;
    font-size: large;
    /* padding-bottom: 30px; */
  }

  .picName{
    width:50px;
    text-align: center;
    /* border-right: solid 1px #DCDFE6; */
    padding-right: 40px;
  }
</style>
