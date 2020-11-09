<template>
  <el-container
    v-loading="fullscreenLoading"
    element-loading-text="模型测试中，离开将中断测试……"
  >
    <div id="upload" v-show="showSingleResult">
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
          <video
            v-if="singleSrc !== ''"
            :src="singleSrc"
            controls="controls"
            style="width: 100%"
          ></video>
        </div>
      </el-card>
    </div>
    <!-- 设置重合区域阈值 -->
    <el-dialog
      title="设置重合区域阈值"
      :visible.sync="showThreshold"
      width="30%"
    >
      <div style="float:left;margin-bottom:20px;">请设置重合区域阈值</div>
      <el-input v-model="threshold" size="small"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showThreshold = false">取 消</el-button>
        <el-button type="primary" @click="showThreshold = false"
          >确 定</el-button
        >
      </span>

    </el-dialog>
    <!--内容块-->
    <el-main>
      <!--顶部-->
      <div class="header">
        <i
          class="el-icon-back"
          @click="
            resultFlag = false;
            graphFlag = false;
          "
          v-if="resultFlag || graphFlag"
          style="margin-right: 10px"
        ></i>
        视频抽取
        <!--<el-button-->
        <!--type="primary"-->
        <!--class="darkBtn headbutton"-->
        <!--size="small"-->
        <!--style="float:right; margin-right:20px;"-->
        <!--@click="showGraph"-->
        <!--v-if="!resultFlag&&!graphFlag"-->
        <!--&gt;加入图谱</el-button>-->
        <el-button
          type="primary"
          class="darkBtn headbutton"
          size="small"
          style="float: right; margin-right: 20px"
          @click="showHistory"
          v-if="!resultFlag && !graphFlag"
          >查看历史信息</el-button
        >
        <el-button
          type="primary"
          class="darkBtn headbutton"
          size="small"
          style="float: right; margin-right: 20px"
          @click="showResults"
          v-if="!resultFlag && !graphFlag"
          >查看测试结果</el-button
        >
        <el-button
          type="primary"
          class="darkBtn headbutton"
          size="small"
          style="float: right; margin-right: 20px"
          @click="modelTest"
          v-if="!resultFlag && !graphFlag"
          >模型测试</el-button
        >

        <el-button
          type="primary"
          class="darkBtn headbutton"
          size="small"
          style="float: right; margin-right: 20px"
          @click="showThreshold = true"
          v-if="!resultFlag && !graphFlag"
          >设置重合区域阈值</el-button
        >
        <el-button
          class="blueBtn headbutton"
          size="small"
          @click="loadList"
          v-if="!resultFlag && !graphFlag"
          >加载测试数据</el-button
        >
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--      列表页-->
      <div class="main" v-if="!resultFlag && !graphFlag">
        <div id="matchInfo" v-if="vedioList.length !== 0">
          已有测试数据数量 : {{ vedioList.length }}
        </div>
        <!--文书列表-->
        <el-row
          v-loading="loadingRes"
          element-loading-text="正在加载中，请稍等……"
          element-loading-spinner="el-icon-loading"
        >
          <el-col :span="12">
            <el-table
              :data="vedioList.slice((curPage - 1) * 10, curPage * 10)"
              :header-cell-style="{ background: '#EBEEF7', color: '#606266' }"
              height="626"
              style="width: 97%"
              border
            >
              <el-table-column prop="title" label="测试数据"></el-table-column>
              <el-table-column label="浏览" width="100" align="center">
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
              <!-- <el-table-column label="预测" width="100" align="center">
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
              </el-table-column> -->
            </el-table>
            <!-- 分页符-->
            <el-pagination
              background
              layout="prev, pager, next, jumper"
              :total="vedioList.length"
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
              视频浏览
              <span v-if="src === ''">(选择视频以浏览内容)</span>
            </div>
            <div style="padding: 0 15px; margin-top: 100px">
              <video
                v-if="src !== ''"
                :src="src"
                controls="controls"
                style="width: 100%"
              ></video>
            </div>
          </el-col>
        </el-row>
      </div>
      <div
        class="main"
        style="display: flex; flex-direction: column"
        v-if="resultFlag"
      >
        <!--<div style="text-align:center;font-size:large;">-&#45;&#45;&#45;&#45;以下内容仅为随机展示的部分结果-&#45;&#45;&#45;&#45;</div>-->
        <!--<div class="picStyle" v-for="(item, index) in resultList" :key="index">-->
        <!--<video :src="item" controls="controls" style="width:100%;"></video>-->
        <!--<div style="text-align: center;font-weight: bold;width: 100%">-->
        <!--视频{{index + 1}}-->
        <!--</div>-->
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
            <div class="tableHeader">视频浏览</div>
            <div style="padding: 0 15px; margin-top: 100px">
              <video
                v-if="resultSrc !== ''"
                :src="resultSrc"
                controls="controls"
                style="width: 100%"
              ></video>
            </div>
          </el-col>
        </el-row>
      </div>
      <!--图谱搜索页-->
      <div class="main" v-if="graphFlag">
        <el-input
          v-model="inputEntity"
          style="width: 450px"
          placeholder="请输入实体名称"
        ></el-input>
        <el-button
          style="margin-left: 20px; height: 40px"
          class="darkBtn"
          size="small"
          @click="onSearchClick"
          >搜索</el-button
        >
        <div id="kgPic">
          <div
            id="graph"
            :style="{ width: graphWidth, height: graphHeight }"
          ></div>
        </div>
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

import { option } from "../../../js/echartSettings";
export default {
  name: "ExtractVideo",
  data() {
    return {
      threshold:"",
      showThreshold: false,
      graphFlag: false,
      inputEntity: "",
      resultFlag: false,
      curPage: 1,
      curPageResult: 1,
      //上传的文件列表
      fileList: [],
      //表格数据 测试集
      vedioList: [],
      //选中行
      choosenRow: {},
      //三元组数据
      tripleData: [],
      //弹出框可视
      selectTitle: "文书名",
      loadingRes: false,
      fullscreenLoading: false,
      src: "",
      resultList: [],
      resultSrc: "",
      //单个结果
      showSingleResult: false,
      singleSrc: "",
      //图谱
      graphWidth: "100%",
      graphHeight: "100%",
    };
  },

  methods: {
    onSearchClick() {
      let fd = new FormData();
      fd.append("entity", this.inputEntity);
      this.$http
        .post("http://39.102.71.123:23352/pic/search_entity", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res.data);
          if (res.data.length === 0) {
            this.$message({
              message: "未搜索到该实体！",
              type: "warning",
            });
            return;
          }
          let graphPoint = [
            {
              name: res.data,
              category: 1,
            },
          ];
          let Myoption = JSON.parse(JSON.stringify(option));
          Myoption["series"][0]["data"] = graphPoint;

          myChart = echarts.init(document.getElementById("graph"));
          // 绘制图表
          myChart.setOption(Myoption, true);
        })
        .catch((res) => {
          console.log(res);
        });
    },
    showGraph() {
      this.graphFlag = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/JSTextJoinKG", {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res.data);
        })
        .catch((res) => {
          console.log(res);
        });
      this.inputEntity = "";
    },
    showResults() {
      this.resultFlag = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/video_test_results", {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res);
          this.resultList = res.data.map((url, index) => {
            let list;
            if (url.indexOf("\\") === -1) list = url.split("/");
            else list = url.split("\\");
            return {
              url: url,
              title: list[list.length - 1],
            };
          });
        })
        .catch((res) => {
          console.log(res);
          alert("出错了！");
        });
    },

    modelTest() {
      if(this.threshold===""){
        this.$message.error("请先设置重合区域阈值！");
        return;
      }
      this.fullscreenLoading = true;
      let fd = new FormData();
      fd.append("IoU",this.threshold);
      this.$http
        .post("http://39.102.71.123:23352/pic/video_test", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          this.$alert(
            "<p><strong>目标实体数量： <i>" +
            res.data[4] +
            "</i> 个</strong></p>" +
            "<p><strong>抽取目标数量： <i>" +
            res.data[3] +
            "</i> 个</strong></p>" +
            "<p><strong>正确抽取目标数量： <i>" +
            res.data[2] +
            "</i> 个</strong></p>" +
            "<p><strong>图像检测准确率： <i>" +
            res.data[2] +"/"+res.data[3] +"="+res.data[0] +
            "</i> %</strong></p>" +
            "<p><strong>图像检测召回率： <i>" +
            res.data[2] +"/"+res.data[4] +"="+res.data[1] +
            "</i> %</strong></p>" +
            "<p><strong>航母目标准确率： <i>" +
            res.data[5]+
            "</i> %</strong></p>" +
            "<p><strong>航母目标召回率： <i>" +
            res.data[6]+
            "</i> %</strong></p>" +
            "<p><strong>驱逐舰目标准确率： <i>" +
            res.data[7]+
            "</i> %</strong></p>"  +
            "<p><strong>驱逐舰目标召回率： <i>" +
            res.data[8]+
            "</i> %</strong></p>"  +
            "<p><strong>护卫舰目标准确率： <i>" +
            res.data[9]+
            "</i> %</strong></p>"  +
            "<p><strong>护卫舰目标召回率： <i>" +
            res.data[10]+
            "</i> %</strong></p>"  +
            "<p><strong>巡洋舰目标准确率： <i>" +
            res.data[11]+
            "</i> %</strong></p>"  +
            "<p><strong>巡洋舰目标召回率： <i>" +
            res.data[12]+
            "</i> %</strong></p>"  +
            "<p><strong>战列舰目标准确率： <i>" +
            res.data[13]+
            "</i> %</strong></p>"  +
            "<p><strong>战列舰目标召回率： <i>" +
            res.data[14]+
            "</i> %</strong></p>" ,
            "模型测试结果",
            {
              dangerouslyUseHTMLString: true
            }
          );
          this.fullscreenLoading = false;
        })
        .catch(res => {
          console.log(res);
          alert("出错了！");
          this.fullscreenLoading = false;
        });
    },
    loadList() {
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/load_videoData", {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          this.vedioList = res.data.map((cur) => {
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
    //查看视频内容
    handleShow(row) {
      this.selectTitle = row.title;
      let fd = new FormData();
      fd.append("filename", row.title);
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/view_videoData", fd, {
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
    //预测单个
    handleAnalysis(row) {
      this.selectTitle = row.title;
      let fd = new FormData();
      fd.append("filename", row.title);
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/videoTestDemo", fd, {
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
    //查看历史信息
    showHistory() {
      this.$http
        .post("http://39.102.71.123:23352/pic/videoTestHistory", {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res)
          this.$alert(
            "<p><strong>目标实体数量： <i>" +
              res.data[4] +
              "</i> 个</strong></p>" +
              "<p><strong>抽取目标数量： <i>" +
              res.data[3] +
              "</i> 个</strong></p>" +
              "<p><strong>正确抽取目标数量： <i>" +
              res.data[2] +
              "</i> 个</strong></p>" +
              "<p><strong>历史视频检测准确率： <i>" +
              res.data[2] +
              "/" +
              res.data[3] +
              "=" +
              res.data[0] +
              "</i> %</strong></p>" +
              "<p><strong>历史视频检测召回率： <i>" +
              res.data[2] +
              "/" +
              res.data[4] +
              "=" +
              res.data[1] +
              "</i> %</strong></p>" +
              "<p><strong>航母目标准确率： <i>" +
              res.data[5]+
              "</i> %</strong></p>" +
              "<p><strong>航母目标召回率： <i>" +
              res.data[6]+
              "</i> %</strong></p>" +
              "<p><strong>驱逐舰目标准确率： <i>" +
              res.data[7]+
              "</i> %</strong></p>"  +
              "<p><strong>驱逐舰目标召回率： <i>" +
              res.data[8]+
              "</i> %</strong></p>"  +
              "<p><strong>护卫舰目标准确率： <i>" +
              res.data[9]+
              "</i> %</strong></p>"  +
              "<p><strong>护卫舰目标召回率： <i>" +
              res.data[10]+
              "</i> %</strong></p>"  +
              "<p><strong>巡洋舰目标准确率： <i>" +
              res.data[11]+
              "</i> %</strong></p>"  +
              "<p><strong>巡洋舰目标召回率： <i>" +
              res.data[12]+
              "</i> %</strong></p>"  +
              "<p><strong>战列舰目标准确率： <i>" +
              res.data[13]+
              "</i> %</strong></p>"  +
              "<p><strong>战列舰目标召回率： <i>" +
              res.data[14]+
              "</i> %</strong></p>",
            "历史测试结果",
            {
              dangerouslyUseHTMLString: true,
            }
          );
        })
        .catch((res) => {
          console.log(res);
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
#upload {
  text-align: center;
  z-index: 99;
  position: fixed;
  top: 20%;
  left: 30%;
  right: 30%;
  bottom: 5%;
  overflow: inherit;
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
</style>
