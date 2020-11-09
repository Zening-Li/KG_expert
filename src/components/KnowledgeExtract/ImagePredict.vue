<template>
  <el-container
    v-loading="fullscreenLoading"
    element-loading-text="模型测试中，离开将中断测试……"
  >
    <div class="upload" v-show="showSingleResult">
      <el-card class="box-card">
        <div slot="header" class="clearfix" style="text-align: center">
          <span>预测结果</span>
          <i
            class="el-icon-close"
            style="float: right; padding: 3px 0"
            @click="showSingleResult = false"
          ></i>
        </div>
        <div style="padding: 0 15px; margin-top: 10px">
          <el-image :src="singleSrc" fit="contain">
            <div slot="placeholder" class="image-slot">
              加载中
              <span class="dot">...</span>
            </div>
          </el-image>
        </div>
      </el-card>
    </div>
    <!-- 分类结果 -->
    <el-dialog title="分类" :visible.sync="showClassify" width="30%">
      <el-image style="width: 100%" :src="classifySrc"></el-image>
      <div style="margin-top: 20px">分类结果：{{ classifyResult }}</div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showClassify = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 上传图片 -->
    <div class="upload" v-if="isUpload">
      <el-card class="box-card" style="text-align: center">
        <div slot="header" class="clearfix">
          <span>文件上传</span>
          <i
            class="el-icon-close"
            style="float: right; padding: 3px 0"
            @click="cancelUpload"
          ></i>
        </div>
        <el-upload
          class="upload-demo"
          drag
          ref="upload"
          :auto-upload="false"
          accept=".jpg,.JPEG"
          action=""
          :on-remove="handleRemove"
          :on-change="handleAddFile"
          :file-list="uploadFileList"
          :limit="1"
          :on-exceed="handleExceed"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">
            仅支持上传.jpg, .JPEG文件<br />
          </div>
        </el-upload>
        <el-button size="small" @click="cancelUpload">取消</el-button>
        <el-button
          style="margin-left: 10px"
          class="darkBtn"
          size="small"
          type="primary"
          @click="submitUpload"
          >上传</el-button
        >
      </el-card>
    </div>
    <!--内容块-->
    <el-main>
      <!--上传窗口-->
      <!--<div id="upload" v-if="isUpload">-->
      <!--<el-card class="box-card">-->
      <!--<div slot="header" class="clearfix">-->
      <!--<span>数据上传</span>-->
      <!--<i class="el-icon-close" style="float: right; padding: 3px 0" @click="cancelUpload"></i>-->
      <!--</div>-->
      <!--<el-upload-->
      <!--class="upload-demo"-->
      <!--drag-->
      <!--ref="upload"-->
      <!--:auto-upload="false"-->
      <!--accept=".jpg, .jpeg"-->
      <!--action="https://jsonplaceholder.typicode.com/posts/"-->
      <!--:on-remove="handleRemove"-->
      <!--:on-change="handleAddFile"-->
      <!--:file-list="uploadList"-->
      <!--:limit="3"-->
      <!--:on-exceed="handleExceed"-->
      <!--multiple-->
      <!--&gt;-->
      <!--<i class="el-icon-upload"></i>-->
      <!--<div class="el-upload__text">-->
      <!--将文件拖到此处，或-->
      <!--<em>点击上传</em>-->
      <!--</div>-->
      <!--<div class="el-upload__tip" slot="tip">-->
      <!--支持上传jpg文件及jpeg文件-->
      <!--<br />限制上传最多3张图片-->
      <!--<br />-->
      <!--</div>-->
      <!--</el-upload>-->
      <!--<el-button size="small" @click="cancelUpload">取消</el-button>-->
      <!--<el-button-->
      <!--style="margin-left: 10px;"-->
      <!--class="darkBtn"-->
      <!--size="small"-->
      <!--type="primary"-->
      <!--@click="submitUpload"-->
      <!--&gt;上传并分析</el-button>-->
      <!--</el-card>-->
      <!--</div>-->
      <!--顶部-->
      <div class="header">
        图片预测
        <!--<el-button-->
        <!--type="primary"-->
        <!--class="darkBtn headbutton"-->
        <!--size="small"-->
        <!--style="float:right; margin-right:20px;"-->
        <!--@click="showGraph"-->
        <!--v-if="!resultFlag&&!graphFlag"-->
        <!--&gt;加入图谱</el-button>-->
        <!--<el-button-->
        <!--type="primary"-->
        <!--class="darkBtn headbutton"-->
        <!--size="small"-->
        <!--style="float:right; margin-right:20px;"-->
        <!--@click="isUpload=true"-->
        <!--v-if="!resultFlag&&!graphFlag"-->
        <!--&gt;文件上传</el-button>-->

        <el-button
          class="darkBtn headbutton"
          size="small"
          @click="isUpload = true"
          v-if="!resultFlag"
          >上传文件</el-button
        >
        <el-button
          class="blueBtn headbutton"
          size="small"
          @click="loadList"
          v-if="!resultFlag"
          >加载测试图像</el-button
        >
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--      列表页-->
      <div class="main" v-if="!resultFlag">
        <div id="matchInfo" v-if="picList.length !== 0">
          已有预测数据数量 : {{ picList.length }}
        </div>
        <!--文书列表-->
        <el-row
          v-loading="loadingRes"
          element-loading-text="正在加载中，请稍等……"
          element-loading-spinner="el-icon-loading"
        >
          <el-col :span="12">
            <el-table
              :data="picList.slice((curPage - 1) * 10, curPage * 10)"
              :header-cell-style="{ background: '#EBEEF7', color: '#606266' }"
              height="626"
              style="width: 97%"
              border
            >
              <el-table-column prop="title" label="预测数据"></el-table-column>
              <el-table-column label="浏览" width="80" align="center">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click="handleShow(scope.row)"
                    type="primary"
                    plain
                    size="small"
                    >浏览</el-button
                  >
                </template>
              </el-table-column>
              <el-table-column label="分类" width="80" align="center">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click="handleClassify(scope.row)"
                    type="primary"
                    plain
                    size="small"
                    >分类</el-button
                  >
                </template>
              </el-table-column>
              <el-table-column label="预测" width="80" align="center">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click="handleAnalysis(scope.row)"
                    type="primary"
                    plain
                    size="small"
                    >预测</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页符-->
            <el-pagination
              background
              layout="prev, pager, next, jumper"
              :total="picList.length"
              :current-page.sync="curPage"
              @current-change="handleCurrentChange"
            ></el-pagination>
            <!--</el-pagination> -->
          </el-col>
          <el-col
            :span="12"
            style="
              background-color: #fff;
              min-height: 625px;
              box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
            "
          >
            <div class="tableHeader">
              图片浏览
              <span v-if="src === ''">(选择图片以浏览内容)</span>
            </div>
            <div style="padding: 0 15px; margin-top: 100px">
              <el-image :src="src" fit="contain" v-if="src !== ''">
                <div slot="placeholder" class="image-slot">
                  加载中
                  <span class="dot">...</span>
                </div>
              </el-image>
            </div>
          </el-col>
        </el-row>
      </div>
      <!--结果页-->
      <div
        class="main"
        style="display: flex; flex-direction: column"
        v-if="resultFlag"
      >
        <!--<div style="text-align:center;font-size:large;">-&#45;&#45;&#45;&#45;以下内容仅为随机展示的部分结果-&#45;&#45;&#45;&#45;</div>-->
        <!--<div class="picStyle" v-for="(item, index) in resultList" :key="index">-->
        <!--<el-image :src="item" fit="contain">-->
        <!--<div slot="placeholder" class="image-slot">-->
        <!--加载中-->
        <!--<span class="dot">...</span>-->
        <!--</div>-->
        <!--</el-image>-->
        <!--<div style="text-align: center;font-weight: bold;width: 100%">图{{index + 1}}</div>-->
        <!--</div>-->

        <!--结果列表-->
        <el-row>
          <el-col :span="12">
            <el-table
              :data="
                resultList.slice((curPageResult - 1) * 10, curPageResult * 10)
              "
              :header-cell-style="{ background: '#EBEEF7', color: '#606266' }"
              height="626"
              style="width: 97%"
              border
            >
              <el-table-column prop="title" label="结果列表"> </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click="handleAnalysisResult(scope.row.url)"
                    type="primary"
                    plain
                    size="small"
                    >浏览</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页符-->
            <el-pagination
              background
              layout="prev, pager, next, jumper"
              :total="resultList.length"
              :current-page.sync="curPageResult"
              @current-change="handleCurrentChangeResult"
            ></el-pagination>
            <!--</el-pagination> -->
          </el-col>
          <el-col
            :span="12"
            style="
              background-color: #fff;
              min-height: 625px;
              box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
            "
          >
            <div class="tableHeader">图片浏览</div>
            <div style="padding: 0 15px; margin-top: 100px">
              <el-image :src="resultSrc" fit="contain" v-if="resultSrc !== ''">
                <div slot="placeholder" class="image-slot">
                  加载中
                  <span class="dot">...</span>
                </div>
              </el-image>
            </div>
          </el-col>
        </el-row>
      </div>

    </el-main>

    <!-- 分析页 -->
    <!-- <el-main v-show="!isList">
      <div class="header">
        <i class="el-icon-back" @click="isList=true"></i>
        <el-button type="primary" class="headbutton" size="small" @click="handleExport">导出</el-button>
      </div>
      <el-divider></el-divider>
      <div class="main" id="daddy">
        <div id="graph" style="width: 1000px;height:800px;"></div>
      </div>
    </el-main>-->
  </el-container>
</template>

<script>
let echarts = require("echarts");
let myChart;
import { option } from "../../js/echartSettings";
export default {
  name: "ImagePredict",
  data() {
    return {
      classifyResult: "分类结果",
      showClassify: false,
      classifySrc: "",
      inputEntity: "",
      levelList: [
        {
          label: "一级查询",
          value: 1,
        },
        {
          label: "二级查询",
          value: 2,
        },
        {
          label: "三级查询",
          value: 3,
        },
      ],
      level: 1,
      isUpload: false,
      resultFlag: false,
      curPage: 1,
      curPageResult: 1,
      uploadFileList: [],
      //表格数据 测试集
      picList: [],
      //选中行
      choosenRow: {},
      //三元组数据
      tripleData: [],
      //弹出框可视
      selectTitle: "图片名",
      loadingRes: false,
      fullscreenLoading: false,
      src: "",
      resultList: [],
      //结果
      resultSrc: "",
      //单独结果
      showSingleResult: false,
      singleSrc: "",
      //图谱
      graphWidth: "100%",
      graphHeight: "100%",
    };
  },

  methods: {
    cancelUpload() {
      this.isUpload = false;
      this.uploadFileList = [];
    },
    handleRemove(file, uploadFileList) {
      this.uploadFileList = uploadFileList;
    },
    handleAddFile(file, uploadFileList) {
      this.uploadFileList = uploadFileList;
    },
    submitUpload() {
      //上传的请求
      this.fullscreenLoading = true;
      let fd = new FormData();
      fd.append("pic", this.uploadFileList[0].raw);
      this.$http
        .post("http://39.102.71.123:23352/pic/pic_detect_submit", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        .then(res => {
          //清空上传列表
          this.uploadFileList = [];
          console.log(res);
          this.isUpload = false;
          this.fullscreenLoading = false;
          this.loadList();
        })
        .catch(e => {
          this.fullscreenLoading = false;
          console.log(e);
          this.isUpload = false;
        });
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${files.length} 个文件,共选择了 ${
          files.length + fileList.length
        } 个文件`
      );
    },
    loadList() {
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/pic_detect", {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          this.picList = res.data.map((cur) => {
            return { title: cur };
          });

          this.loadingRes = false;
        })
        .catch((res) => {
          console.log(res);
          alert("出错了！");
          this.loadingRes = false;
        });
    },
    handleCurrentChange(cpage) {
      this.curPage = cpage;
    },
    handleCurrentChangeResult(cpage) {
      this.curPageResult = cpage;
    },
    //查看图片内容
    handleShow(row) {
      this.selectTitle = row.title;
      let fd = new FormData();
      fd.append("filename", row.title);
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/pic_detect_view", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          this.src = res.data;
          this.loadingRes = false;
        })
        .catch((res) => {
          console.log(res);
          this.loadingRes = false;
        });
    },
    handleClassify(row) {
      this.selectTitle = row.title;
      let fd = new FormData();
      fd.append("filename", row.title);
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/pic_detect_classification", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          this.classifySrc = res.data[0];
          this.showClassify = true;
          this.classifyResult  = res.data[1];
          this.loadingRes = false;
        })
        .catch((res) => {
          console.log(res);
          this.loadingRes = false;
        });
    },

    //预测单个
    handleAnalysis(row) {
      this.selectTitle = row.title;
      let fd = new FormData();
      fd.append("filename", row.title);
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/pic_detect_predict", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res);
          this.showSingleResult = true;
          this.singleSrc = res.data;
          this.loadingRes = false;
        })
        .catch((res) => {
          console.log(res);
          this.loadingRes = false;
        });
    },
    handleAnalysisResult(row) {
      this.resultSrc = row;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
html,
body,
.el-container {
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
  background-color: #e9eef3;
  color: #333;
  text-align: left;
  height: 100%;
  background-color: #f1f2f6;
}

/**************左侧导航栏***************/
.is-active {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-right: 4px solid #5775fb !important;
}
.el-menu-item {
  text-align: left;
  width: 200px;
}
.el-submenu {
  text-align: left;
  width: 200px;
}
/**************内容顶部***************/
.header {
  width: 100%;
  height: 20px;
  line-height: 20px;
  text-align: left;
  margin-left: 20px;
  font-weight: bold;
  font-size: large;
}
.headbutton {
  float: right;
  margin-right: 20px;
}
.top-tip {
  margin-top: -10px;
  margin-bottom: 10px;
  padding-left: 20px;
}
/*************内容中心*************/
.main {
  line-height: 30px;
  height: 90%;
  width: 100%;
}
/*表格*/
.el-table {
  height: 80%;
  width: 47%;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}
/*分页符*/
.el-pagination {
  right: 60px;
  height: 10%;
  text-align: right;
  margin-top: 40px;
}

/*echarts*/

.el-pagination.is-background .el-pager li:not(.disabled).active {
  background-color: #5775fb !important;
}
.el-pagination.is-background .el-pager li:hover {
  color: #5775fb !important;
}

/***************上传弹窗***********/
.upload {
  text-align: center;
  z-index: 99;
  position: fixed;
  top: 20%;
  left: 30%;
  right: 30%;
}
.upload-demo {
  margin-bottom: 20px;
}
.el-upload__tip {
  padding-left: 30%;
  text-align: left;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

/***********按钮样式***********/
.blueBtn {
  background-color: #eff0ff;
  border: 1px solid #5775fb;
  color: #5775fb;
}

.blueBtn:hover,
.blueBtn:active,
.blueBtn:focus {
  background-color: #5775fb;
  color: #ffffff;
}

.darkBtn {
  background-color: #5775fb;
  border: 1px solid #5775fb;
  color: #ffffff;
}
.darkBtn:hover {
  background-color: #708bf7;
}

.tableHeader {
  height: 55px;
  width: 100%;
  background-color: #ebeef7;
  color: #606266;
  line-height: 55px;
  padding: 0 10px;
  font-weight: bold;
  font-size: 14px;
}

#matchInfo {
  background-color: #f0f9eb;
  color: #67c23a;
  padding: 8px 16px;
  width: 95%;
  padding: 8px 16px;
  border-radius: 10px;
  margin: 0 0 15px 10px;
  font-size: 13px;
}
.picStyle {
  width: 60%;
  align-self: center;
  margin-top: 20px;
}
.picStyle:first {
  width: 60%;
  align-self: center;
}

/*#kgPic {*/
/*height: 800px;*/
/*width: 100%;*/
/*margin-top: 20px;*/
/*box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);*/
/*background-color: #fff;*/
/*}*/
</style>

