<template>
  <el-container>
    <!--内容块实体对齐-->
    <!-- <div
      v-loading.fullscreen.lock="loadingRes"
      element-loading-text="正在处理中，请稍等……"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
    ></div>-->
    <el-main>
      <!--顶部-->
      <div class="header">
        <i class="el-icon-back" v-if="isGraph" @click="isGraph=false"></i>
        实体对齐
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--列表页-->
      <div class="main" v-if="!isGraph">
        <div class="top-tip">
          <span>请选择数据：</span>
          <el-select v-model="tableIndex" placeholder size="small" style="margin-left:20px;">
            <el-option v-for="(item, index) in tableList" :key="index" :label="item" :value="item"></el-option>
          </el-select>
          <el-button
            style="margin-left:20px;"
            class="blueBtn"
            size="small"
            @click="chooseTable"
          >加载数据</el-button>

          <el-button
            class="darkBtn"
            size="small"
            style="float:right; margin-right:20px;"
            @click="showGraph"
            :disabled="tpDis"
          >图谱展示</el-button>
          <el-button
            class="darkBtn"
            size="small"
            style="float:right; margin-right:20px;"
            @click="entityMatch"
            :disabled="stDis"
          >实体对齐</el-button>
          <el-button
            class="darkBtn"
            size="small"
            style="float:right; margin-right:20px;"
            @click="loadModel"
            :disabled="jzDis"
          >加载实体对齐模型</el-button>
          <el-button
            class="darkBtn"
            size="small"
            style="float:right; margin-right:20px;"
            @click="reduceDuplicate"
            :disabled="sxDis"
          >属性去重</el-button>
          <el-button
            class="darkBtn"
            size="small"
            style="float:right; margin-right:20px"
            @click="checkAll"
          >全选</el-button>
        </div>

        <!--表格-->
        <el-table
          :data="tableData.slice((curPage - 1) * 20, curPage * 20)"
          :header-cell-style="{background:'#F6F7FB',color:'#606266'}"
          border
          height="626"
          v-loading="loadingRes"
        >
          <el-table-column
            v-for="(item, index) in columnNames"
            :key="index"
            :prop="item.prop"
            :label="item.label"
          ></el-table-column>
        </el-table>
        <!-- 分页符-->
        <el-pagination
          background
          layout="prev, pager, next"
          :total="tableData.length"
          :page-size="20"
          @current-change="handleCurrentChange"
          :current-page="curPage"
        ></el-pagination>
      </div>
      <div class="main" v-if="isGraph">
        <div class="result" style="margin-bottom:50px;">
          <!--关系图谱-->
          <div
            id="kgPic"
            v-loading="loadingResGraph"
            element-loading-text="正在加载中，请稍等……"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.1)"
          >
            <div id="graph" :style="{width: graphWidth,height:graphHeight}"></div>
          </div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { option } from "../../../js/echartSettings";
import Axios from 'axios';
let echarts = require("echarts");
let myChart;
let that;
export default {
  name: "EntityMatch",
  data() {
    return {
      number: 0,
      numberArr: [],
      numberStr: "",
      tpDis: true,
      stDis: true,
      jzDis: true,
      sxDis: true,
      model:"",
      tableList: [],
      tableIndex: "",
      tableData: [],
      curPage: 1,
      columnNames: [],
      loadingResGraph: false,
      isGraph: false,
      loadingRes: false,
      //图谱
      graphWidth:"100%",
      graphHeight:"100%",
    };
  },
  methods: {
    //全选按钮
    checkAll() {
      this.numberArr = [1,this.number];
      this.numberStr = this.numberArr.toString();
      if(this.numberStr != "1,0") {
        this.sxDis = false;
        this.$message({
          message: '全选成功！',
          type: 'success'
        });
      }else {
        this.$message({
          message: '请先选择表格！',
          type: 'warning'
        });
      }
    },
    //加载数据
    chooseTable() {
      this.loadingRes = true;
      this.tpDis = true;
      this.stDis = true;
      this.jzDis = true;
      this.sxDis = true;
      let fd = new FormData();
      fd.append("table", this.tableIndex);
      this.$http
        .post("http://39.102.71.123:23352/pic/view_after_filter_data", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          this.number = res.data[1].length;
          this.columnNames = res.data[0].map(cur => {
            return { prop: cur, label: cur };
          });

          let column = res.data[0];
          this.tableData = res.data[1].map(cur => {
            let res = {};
            for (let i = 0; i < column.length; i++) res[column[i]] = cur[i];
            return res;
          });
          this.loadingRes = false;
        })
        .catch(res => {
          console.log(res);
          alert("出错了");
          this.loadingRes = false;
        });
    },
    showGraph() {
      this.isGraph = true;
      this.loadingResGraph = true;
      let that = this;
      let fd = new FormData();
      fd.append("table", this.tableIndex)
      this.$http
        .post("http://39.102.71.123:23352/pic/show_structTuple",fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          this.initGraph(res);
          this.loadingResGraph = false;
        })
        .catch(res => {
          //请求失败
          console.log(res);
          this.loadingResGraph = false;
        });
    },
    initGraph(res) {
      let graphPoint = [];
      let graphLink = [];
      let pointName = new Set();
      let order = [3, 0, 1, 2];
      for (let j of order) {
        console.log(j);
        for (let i = 0; i < res.data[j].length; i++) {
          let tmp = {};
          tmp.entity1 = res.data[j][i][0] + "";
          tmp.relation = res.data[j][i][1] + "";
          tmp.entity2 = res.data[j][i][2] + "";
          if (!pointName.has(tmp.entity1)) {
            pointName.add(tmp.entity1);
            if (j !== 2) {
              graphPoint.push({
                name: tmp.entity1,
                category: j
              });
            } else {
              graphPoint.push({
                name: tmp.entity1,
                category: 1
              });
            }
          }
          if (!pointName.has(tmp.entity2)) {
            pointName.add(tmp.entity2);
            if(j === 3){
              graphPoint.push({
                name: tmp.entity2,
                category: 4
              });
            } else {
              graphPoint.push({
                name: tmp.entity2,
                category: j
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
      let categories = [
        {
          name: "概念",
          symbol: "rect",
          itemStyle: { color: "#2f4554" }
        },
        {
          name: "关系",
          symbol: "circle",
          itemStyle: { color: "#f47920" }
        },
        {
          name: "属性",
          symbol: "roundRect",
          itemStyle: { color: "#749f83" }
        },
        {
          name: "本体-中心",
          symbol: "diamond",
          itemStyle: { color: "#7fb90e" }
        },
        {
          name: "本体-非中心",
          symbol: "diamond",
          itemStyle: { color: "#91c7ae" }
        }
      ];
      let Myoption = JSON.parse(JSON.stringify(option));
      Myoption["series"][0]["data"] = graphPoint;
      Myoption["series"][0]["links"] = graphLink;
      Myoption["series"][0]["categories"] = categories;
      Myoption["legend"] = [{
          data: categories.map(function(a) {
            return { name: a.name, icon: a.symbol };
          })
        }];
      Myoption["series"][0]["edgeLabel"]["normal"]["formatter"] = function(x) {
        return x.data.name;
      };

      myChart = echarts.init(document.getElementById("graph"));
      // 绘制图表
      myChart.setOption(Myoption, true);
    },
    handleCurrentChange(cpage) {
      this.curPage = cpage;
    },
    //加载实体对齐模型
    loadModel() {
      if (this.tableIndex === "") {
        this.$message({
          message: "请先选择表格！",
          type: "warning"
        });
        return;
      }
      let fd = new FormData();
      fd.append("table", this.tableIndex)
      this.$http
        .post("http://39.102.71.123:23352/pic/load_align_model", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          this.stDis = false;
          if (res.data[0] === "dict_1.csv" || res.data[0] === "dict_2.csv") {
            this.model = res.data[0]
            this.$message({
              message: "加载模型" + "成功！",
              type: "success"
            });
          }
        })
        .catch(res => {
          console.log(res);
          alert("出错了！");
        });
    },
    //属性去重
    reduceDuplicate() {
      this.loadingRes = true;
      let fd = new FormData();
      fd.append("table", this.tableIndex);
      this.$http
        .post("http://39.102.71.123:23352/pic/attribute_deduplication", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          this.jzDis = false;
          this.columnNames = res.data[0].map(cur => {
            return { prop: cur, label: cur };
          });

          let column = res.data[0];
          this.tableData = res.data[1].map(cur => {
            let res = {};
            for (let i = 0; i < column.length; i++) res[column[i]] = cur[i];
            return res;
          });
          this.loadingRes = false;
        })
        .catch(res => {
          alert("出错了");
          this.loadingRes = false;
        });
    },
    //实体对齐
    entityMatch() {
      if (this.model === "") {
        this.$message({
          message: "请先加载模型！",
          type: "warning"
        });
        return;
      }
      this.loadingRes = true;
      let fd = new FormData();
      fd.append("table", this.tableIndex);
      fd.append("dict", this.model)
      this.$http.post("http://39.102.71.123:23352/pic/submit_remain_data",fd, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }).then(res => {
          console.log(res);
          this.tpDis = false;
          this.columnNames = res.data[1].map(cur => {
            return { prop: cur, label: cur };
          });

          let column = res.data[1];
          this.tableData = res.data[0].map(cur => {
            let res = {};
            for (let i = 0; i < column.length; i++) res[column[i]] = cur[i];
            return res;
          });
          this.loadingRes = false;
      }).catch(res => {
          console.log(res);
          alert("出错了！")
          this.loadingRes = false;
      })
    }
  },
  mounted() {
    Axios
        .post("http://39.102.71.123:23352/pic/show_after_filter_table", {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          this.tableList = res.data;
        })
        .catch(res => {
          console.log(res);
          alert("出错了");
        });
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
  min-height: calc(100% - 0px);
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
  display: block;
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
  margin: 20px 0 0 20px;
  /* font-weight: bold; */
  /* font-size: 1.17em; */
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
  /*box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);*/
}
.el-table--border,
.el-table--group {
  border: 0;
}
/*分页符*/
.el-pagination {
  right: 60px;
  height: 10%;
  text-align: right;
  margin-top: 40px;
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
  border: 1px solid #108cee;
  color: #5775fb;
}

.blueBtn:hover,
.blueBtn:active,
.blueBtn:focus {
  background-color: #108cee;
  color: #ffffff;
}

.darkBtn {
  background-color: #108cee;
  border: 1px solid #108cee;
  color: #ffffff;
}
.darkBtn:hover {
  background-color: #108cee;
}

.textBtn {
  color: #606266;
  text-decoration: underline;
}

.textBtn:hover {
  color: #7c7c7c;
}
/*关系图*/
#kgPic {
  height: 800px;
  width: 100%;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  background-color: #fff;
}
.result {
  width: 100%;
}
</style>
