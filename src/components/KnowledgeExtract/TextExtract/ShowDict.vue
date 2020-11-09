<template>
  <el-container>
    <!--内容块预处理-->
    <el-main v-if="!isSearch">
      <!--顶部-->
      <div class="header">文本预处理</div>
      <el-divider></el-divider>
      <!--中心-->
      <div class="top-tip">
        <span style="margin-left:10px;">请选择词典：</span>
        <el-select v-model="typeSelect" placeholder size="small" style="margin-left:20px;">
          <el-option v-for="(item, index) in typeList" :key="index" :label="item" :value="item"></el-option>
        </el-select>
        <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="showDict">确定</el-button>

        <!--<el-button-->
        <!--class="darkBtn"-->
        <!--size="small"-->
        <!--style="float:right; margin-right:20px;"-->
        <!--@click="isSearch=true"-->
        <!--&gt;图谱搜索</el-button>-->
        <el-button
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click="goToExtract"
        >时间</el-button>
        <el-button
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click="joinGraph"
        >加入图谱</el-button>
        <el-button
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click="loadTagDirectory"
        >加载标注目录</el-button>
        <el-button
          class="darkBtn"
          size="small"
          style="float:right; margin-right:20px;"
          @click="loadJS"
        >加载JS文书</el-button>
      </div>
      <div
        class="result"
        style="margin-bottom:50px;height:100%"
        v-if="!isList&&!isCatalog"
        v-loading="loadingRes"
        element-loading-text="正在加载中，请稍等……"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.1)"
      >
        <span v-if="tipFlag" style="margin-left:30px;margin-top:20px;font-weight: bold">请选择词典进行查看</span>
        <div style="text-align:center;">
          <el-tag
            v-for="(item, index) in tags.slice((curPage - 1) * 100, curPage * 100)"
            :key="index"
            :type="tagType"
            class="tagStyle"
          >{{item}}</el-tag>
        </div>
        <el-pagination
          v-if="paginationFlag"
          background
          layout="prev, pager, next, jumper"
          :total="dictCount"
          :current-page.sync="curPage"
          :page-size="100"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>

      <div v-if="isList">
        <el-row
          v-loading="loadingRes"
          element-loading-text="正在加载中，请稍等……"
          element-loading-spinner="el-icon-loading"
        >
          <el-col :span="12">
            <el-table
              :data="tableData.slice((curPageFile - 1) * 10, curPageFile * 10)"
              :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
              height="626"
              style="width:97%"
              border
            >
              <el-table-column prop="title" label="文书名"></el-table-column>
              <el-table-column label="操作" width="100" align="center" v-if="listType">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click="handleAnalysis(scope.row)"
                    type="primary"
                    plain
                    size="small"
                  >浏览</el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页符-->
            <el-pagination
              background
              layout="prev, pager, next, jumper"
              :total="fileCount"
              :current-page.sync="curPageFile"
              @current-change="handleCurrentChangeFile"
            ></el-pagination>
            <!--</el-pagination> -->
          </el-col>
          <el-col
            :span="12"
            style="background-color:#FFF;min-height:625px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)"
          >
            <div class="tableHeader">
              文件浏览
              <span v-if="textData===''">(选择文件以浏览内容)</span>
            </div>
            <div style="padding:0 15px;">
              <pre style="word-break: break-word;word-wrap: break-word;white-space: break-spaces;">{{textData}}</pre>
            </div>
          </el-col>
        </el-row>
      </div>
      <!--标注目录-->
      <div v-if="isCatalog">
        <el-row
          v-loading="loadingRes"
          element-loading-text="正在加载中，请稍等……"
          element-loading-spinner="el-icon-loading"
        >
          <el-col :span="12">
            <el-table
              :data="tableDataEntity.slice((curPageEntity - 1) * 10, curPageEntity * 10)"
              :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
              height="550"
              style="width:97%"
              border
            >
              <el-table-column prop="title" :label="'实体标注目录(共'+tableDataEntity.length+'个)'"></el-table-column>
            </el-table>
            <el-pagination
              background
              layout="prev, pager, next, jumper"
              :total="tableDataEntity.length"
              :current-page.sync="curPageEntity"
              @current-change="handleCurrentChangeEntity"
            ></el-pagination>
          </el-col>
          <el-col :span="12">
            <el-table
              :data="tableDataRelation.slice((curPageRelation - 1) * 10, curPageRelation * 10)"
              :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
              height="550"
              style="width:97%"
              border
            >
              <el-table-column prop="title" :label="'关系标注目录(共'+tableDataRelation.length+'个)'"></el-table-column>
            </el-table>
            <el-pagination
              background
              layout="prev, pager, next, jumper"
              :total="tableDataRelation.length"
              :current-page.sync="curPageRelation"
              @current-change="handleCurrentChangeRelation"
            ></el-pagination>
          </el-col>
        </el-row>
      </div>
    </el-main>
    <el-main v-show="isSearch">
      <!--顶部-->
      <div class="header">
        <i class="el-icon-back" @click="isSearch=false"></i>
        图谱搜索
      </div>
      <el-divider></el-divider>
      <el-input v-model="inputEntity" placeholder="实体名" style="width:450px;"></el-input>
      <el-button
        style="margin-left:20px;height: 40px"
        class="darkBtn"
        size="small"
        @click="searchGraph"
      >搜索</el-button>

      <!--中心-->
      <div
        class="result"
        style="margin-bottom:50px;margin-top:20px;height:100%;width: 100%"
        id="daddy"
        v-loading="loadingResGraph"
        element-loading-text="正在加载中，请稍等……"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.2)"
      >
        <div id="graph" :style="{width: graphWidth,height:graphHeight}"></div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { option } from "../../../js/echartSettings";
let echarts = require("echarts");
let myChart;
export default {
  name: "ShowDict",
  data() {
    return {
      tableDataRelation: [],
      tableDataEntity: [],
      curPageRelation: 1,
      curPageEntity: 1,
      typeSelect: "",
      loadingRes: false,
      typeList: ["通用词典", "军语词典", "地名词典"],
      columnNames: [],
      fileCount: 0,
      tableData: [],
      curPageFile: 1,
      dictCount: 0,
      curPage: 1,
      tags: [],
      tagType: "",
      //列表浏览相关
      selectTitle: "",
      textData: "",
      isList: false,
      listType: true,
      //图谱搜索相关
      isSearch: false,
      inputEntity: "",
      loadingResGraph: false,
      isGraph: false,
      isCatalog: false,
      //图谱
      graphWidth:"100%",
      graphHeight:"100%",
    };
  },
  methods: {
    goToExtract(){
      this.$router.push({
        path: "extract",
        query: {
          algorithm: 2,
        },
      });
    },
    highLight(sta, end, color) {
      document.getElementById("123").innerHTML =
        this.test.slice(0, sta) +
        "<strong style='background: yellow'>" +
        this.test.slice(sta, end + 1) +
        "</strong>" +
        this.test.slice(end + 1);
    },
    searchGraph() {
      this.loadingRes = true;
      let fd = new FormData();
      fd.append("entity", this.inputEntity);
      this.$http
        .post("http://39.102.71.123:23352/pic/searchTextData", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res.data);
          if (res.data[0] === 0) {
            this.$message({
              message: "未搜索到该实体！",
              type: "warning"
            });
            this.isGraph = false;
            return;
          }
          this.isGraph = true;
          let graphPoint = [];
          let graphLink = [];
          if(res.data[0]===1){
            graphPoint.push({
              name: res.data[1],
              category: 0
            })
          }
          else {
            let pointName = new Set();
            for (let i = 1; i < res.data.length; i++) {
              let tmp = {};
              tmp.entity1 = res.data[i][0] + "";
              tmp.relation = res.data[i][1] + "";
              tmp.entity2 = res.data[i][2] + "";
              if (!pointName.has(tmp.entity1)) {
                pointName.add(tmp.entity1);
                if (tmp.entity1.indexOf(this.inputEntity) !== -1) {
                  graphPoint.push({
                    name: tmp.entity1,
                    category: 1
                  });
                }
                else {
                  graphPoint.push({
                    name: tmp.entity1,
                    category: 0
                  });
                }
              }
              if (!pointName.has(tmp.entity2)) {
                pointName.add(tmp.entity2);
                if (tmp.entity2.indexOf(this.inputEntity) !== -1) {
                  graphPoint.push({
                    name: tmp.entity2,
                    category: 1
                  });
                } else {
                  graphPoint.push({
                    name: tmp.entity2,
                    category: 0
                  });
                }
              }
              graphLink.push({
                source: tmp.entity1,
                target: tmp.entity2,
                name: tmp.relation,
                des: tmp.relation
              });
            }
          }
          console.log(graphLink)
          let Myoption = JSON.parse(JSON.stringify(option));
          Myoption["series"][0]["data"] = graphPoint;
          Myoption["series"][0]["links"] = graphLink;
          Myoption["series"][0]["edgeLabel"]["normal"]["formatter"] = function(
            x
          ) {
            return x.data.name;
          };
          Myoption["series"][0]["categories"]=[];
          Myoption["series"][0]["categories"].push({
            name: "实体",
            symbol: "circle",
            symbolSize: 60
          });
          Myoption["series"][0]["categories"].push({
              name: "检索目标",
              symbol: "circle",
              symbolSize: 60
            });
          Myoption["legend"] = [];
          Myoption["legend"].push({
            data: Myoption["series"][0]["categories"].map(function(a) {
              return { name: a.name, icon: a.symbol };
            })
          });
          setTimeout(()=>{
            myChart = echarts.init(document.getElementById("graph"));
            // 绘制图表
            myChart.setOption(Myoption, true);
            this.loadingRes = false;
          });
        })
        .catch(res => {
          this.loadingRes = false;
          console.log(res);
        });
    },
    joinGraph() {
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/JSTextJoinKG", {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          this.loadingRes = false;
          console.log(res);
          if (res.data[0] === 1) {
            this.isSearch = true;
            this.isGraph = false;
            this.inputEntity = "";
            this.$message({
              message: "加入成功！",
              type: "success"
            });
          } else {
            this.$message.error("出错了！");
          }
        })
        .catch(res => {
          this.loadingRes = false;
          console.log(res);
        });
    },
    handleAnalysis(row) {
      this.selectTitle = row.title;
      let fd = new FormData();
      fd.append("filename", row.title);
      console.log(row.title);
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/viewJSText", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res.data);
          this.textData = res.data;
          this.loadingRes = false;
        })
        .catch(res => {
          console.log(res);
          this.loadingRes = false;
        });
    },
    loadJS() {
      this.isList = true;
      this.listType = true;
      this.isCatalog = false;
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/loadJSText", {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          // console.log(res);
          this.textData = "";
          this.tableData = res.data.map(cur => {
            return { title: cur };
          });
          this.fileCount = this.tableData.length;
          this.loadingRes = false;
        })
        .catch(res => {
          console.log(res);
          alert("出错了！");
          this.loadingRes = false;
        });
    },
    loadTagDirectory() {
      this.isList = false;
      this.listType = false;
      this.isCatalog = true;

      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/loadJS_mark_text", {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          // console.log(res)
          this.textData = "";
          this.tableDataEntity = res.data[0].map(cur => {
            return { title: cur };
          });
          this.tableDataRelation = res.data[1].map(cur => {
            return { title: cur };
          });
          // this.fileCount = this.tableData.length;
          this.loadingRes = false;
        })
        .catch(res => {
          console.log(res);
          alert("出错了！");
          this.loadingRes = false;
        });
    },
    showDict() {
      this.isList = false;
      this.loadingRes = true;
      this.curPage = 1;
      let fd = new FormData();
      fd.append("dict", this.typeSelect + ".csv");
      this.$http
        .post("http://39.102.71.123:23352/pic/show_dict", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          this.tags = res.data.map(cur => {
            return cur[0];
          });
          this.dictCount = res.data.length;
          if (this.typeSelect === "军语词典") this.tagType = "success";
          else if (this.typeSelect === "地名词典") this.tagType = "warning";
          else this.tagType = "";
          this.loadingRes = false;
        })
        .catch(res => {
          //请求失败
          console.log(res);
          this.loadingRes = false;
        });
    },
    handleCurrentChange(cpage) {
      this.curPage = cpage;
    },
    handleCurrentChangeFile(cpageFile) {
      this.curPageFile = cpageFile;
    },
    handleCurrentChangeEntity(cpageFile) {
      this.curPageEntity = cpageFile;
    },
    handleCurrentChangeRelation(cpageFile) {
      this.curPageRelation = cpageFile;
    }
  },
  computed: {
    tipFlag: function() {
      return !this.loadingRes && this.tags.length === 0;
    },
    paginationFlag: function() {
      return !this.loadingRes && this.tags.length > 0;
    }
  }
};
</script>

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
  margin-right: 40px;
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
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}
/*分页符*/
.el-pagination {
  right: 60px;
  height: 10%;
  text-align: right;
  margin-top: 40px;
}

.el-pagination.is-background .el-pager li:not(.disabled).active {
  background-color: #5775fb !important;
}
.el-pagination.is-background .el-pager li:hover {
  color: #5775fb !important;
}

/***********按钮样式***********/
.blueBtn {
  margin-left: 5%;
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

.tagStyle {
  width: 150px;
  text-align: center;
  margin-top: 20px;
  margin-left: 20px;
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
  #daddy{
    width: 100%;
    height: 100%;
  }
</style>
