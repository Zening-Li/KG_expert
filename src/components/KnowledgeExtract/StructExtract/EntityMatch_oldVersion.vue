<template>
    <el-container>
        <div
            v-loading.fullscreen.lock="loadingRes"
            element-loading-text="正在处理中，请稍等……"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.5)">
        </div>
    <el-main v-if="resDetailFlag===false && graphFlag===false">
        <!-- 顶部 -->
        <div class="header">结构化数据标注</div>
        <el-divider></el-divider>

        <!-- 列表页 -->
        <div class="main">

            <!-- 选择数据 -->
            <div class="top-tip" v-if="sourceFlag">
                <span>请选择数据源：</span>
                <el-select v-model="unionIndex" size="small" style="margin-left: 20px;">
                    <el-option v-for="(item, index) in unionList" :key="index" :label="item" :value="item"></el-option>
                </el-select>
                <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="unionTable">确定</el-button>
            </div>
            <div class="top-tip" v-if="!sourceFlag">
                <span>请选择表格：</span>
                <el-select v-model="tableIndex" size="small" style="margin-left: 20px;">
                    <el-option
                        v-for="(item, index) in properties"
                        :key="index"
                        :label="item"
                        :value="item"></el-option>
                </el-select>
                <el-button class="blueBtn" size="small" style="margin-left: 20px;" @click="chooseTable">确定</el-button>
            </div>
            <div v-if="isList">
                <el-button
                    class="blueBtn"
                    size="small"
                    style="margin-left: 20px;"
                    @click="setPositive"
                >设为正样例</el-button>
                <el-button
                    class="blueBtn"
                    size="small"
                    style="margin-left: 20px;"
                    @click="setNegative"
                >设为负样例</el-button>
                <el-button
                    class="darkBtn"
                    size="small"
                    style="float:right; margin-right:30px;"
                    :disabled="!threeColumns"
                >提交</el-button>
            </div>
            <!-- 表格部分 -->
            <div v-if="isList && threeColumns" class="top-tip">
              <el-table
                :data="tableData.slice((curPage - 1) * 20, curPage * 20)"
                :header-cell-style="{background:'#F6F7FB',color:'#606266'}"
                border
                height="626"
                @selection-change="handleSelectionChange"
                @select="chooseSingle"
              >
                <el-table-column
                  type="selection"
                  width="50"
                  align="center"
                ></el-table-column>
                <el-table-column 
                  width="65" 
                  label="正样例"
                >
                  <!-- <template slot-scope="scope">
                    {{scope.row.itemList[item]}}
                  </template> -->
                </el-table-column>
                <el-table-column 
                  width="65" 
                  label="负样例"
                ></el-table-column>
                <el-table-column
                  v-for="(item, index) in columnNames"
                  :key="index"
                  :prop="item.prop"
                  :label="item.label"
                ></el-table-column>
              </el-table>
              <!-- 分页符 -->
              <el-pagination
                  background
                  layout="prev, pager, next"
                  :total="fileCount"
                  :page-size="20"
                  @current-change="handleCurrentChange"
                  :current-page="curPage"
              ></el-pagination>
            </div>
        </div>
    </el-main>

    
    
    
    
    
    
    </el-container>
</template>

<script>
import { option } from "../../../js/echartSettings";
let echarts = require("echarts");
let myChart;
let that;
export default {
    name: "EntityMatchOldVersion",
    data() {
        return {
            threeColumns: true,
            loadingRes: false,
            sourceFlag: true,
            //数据信息
            unionIndex: "",
            unionList: ["structData", "structData2", "structData3"],
            rawData: [],
            tableIndex: "",
            properties: [],
            checkList: [],  //当前选中的选项数组
            itemList: [],  //序号列表
            isList: false,
            fileCount: 0,
            curPage: 1,
            //表格数据，结构化数据列表
            tableData: [],
            columnNames: [],
            resDetailFlag: false,
            graphFlag:false,

        }
    },
    methods: {
        //选择数据源 确定
        unionTable() {
            this.loadingRes = true;
            let fd = new FormData();
            fd.append("source", this.unionIndex);
            this.$http
                .post("http://39.102.71.123:23352/pic/struct_data_source", fd, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
                .then(res => {
                    console.log(res);
                    this.properties = res.data;
                    this.sourceFlag = false;
                    this.loadingRes = false;
                })
                .catch(res => {
                    console.log(res);
                    this.loadingRes = false;
                });
        },
        //选择表格 确定
        chooseTable() {
            this.loadingRes = true;
            let fd = new FormData();
            fd.append("source", this.unionIndex);
            fd.append('table',this.tableIndex);
            this.$http
                .post("http://39.102.71.123:23352/pic/start_struct_label", fd, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                .then(res => {
                    console.log("res",res);
                    this.isList = true;
                    this.columnNames = res.data[0].map(cur => {
                        return { prop: cur, label: cur };
                    });

                    let column = res.data[0];
                    this.tableData = res.data[1].map(cur => {
                        let res = {};
                        for (let i = 0; i < column.length; i++) res[column[i]] = cur[i];
                        return res;
                    });
                    this.rawData = res.data[1];

                    this.fileCount = res.data[1].length;
                    this.loadingRes = false;
                })
                .catch(error => {
                  console.log(error);
                  this.loadingRes = false;
                })
        },
        //分页
        handleCurrentChange(cpage) {
            this.curPage = cpage;
        },
        //多选
       handleSelectionChange(val) {
          this.checkList = val;
          if(val.length == 2) {
            this.$message({
              message: "数据成功选择！",
              type: "success"
            })
          }else if(val.length > 2) {
            this.$message.error("最多选择两个")
          }
          this.checkList.forEach(item => {
            
          })
        },
        chooseSingle(val) {
          console.log("chooseSingle val",val)
        },
        //设为正样例
        setPositive() {
          console.log("this.itemList",this.itemList);

        },
        //设为负样例
        setNegative() {}
    },
    beforeDestroy() {
        
    },
    mounted() {
        that = this;
    }
}
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