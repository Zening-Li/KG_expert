<template>
  <el-container>
    <div
      v-loading.fullscreen.lock="loadingRes"
      element-loading-text="正在处理中，请稍等……"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
    ></div>
    <el-main>
      <!--顶部-->
      <div class="header">属性去噪</div>
      <el-divider></el-divider>
      <!--中心-->
      <!--列表页-->
      <div class="main">
        <!--表格查看-->
        <!--<div class="top-tip" v-if="sourceFlag">-->
        <!--<span>请选择数据源：</span>-->
        <!--<el-select v-model="sourceIndex" placeholder size="small" style="margin-left:52px;">-->
        <!--<el-option v-for="(item, index) in sourceList" :key="index" :label="item" :value="item"></el-option>-->
        <!--</el-select>-->
        <!--<el-button style="margin-left:20px;" class="blueBtn" size="small" @click="chooseSource">确定</el-button>-->
        <!--</div>-->
        <!--合并表格选项-->
        <div class="top-tip" v-show="!isUnion">
          <span>请选择数据表：</span>

          <el-cascader
            v-model="unionList"
            :options="allTable"
            :props="props"
            collapse-tags
            clearable
          ></el-cascader>

          <span style="margin-left:20px;" >请输入合并后的表名：</span>
          <el-input
            v-model="inputName"
            style="width:250px;"
          ></el-input>

          <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="unionTable">合并数据</el-button>
        </div>

        <div class="top-tip" v-if="isUnion">
          <span v-if="!isList">请选择数据：</span>
          <el-select
            v-model="tableIndex"
            placeholder
            size="small"
            style="margin-left:5px;"
            v-if="!isList"
          >
            <el-option v-for="(item, index) in properties" :key="index" :label="item" :value="item"></el-option>
          </el-select>
          <el-button
            v-if="!isList"
            style="margin-left:5px;"
            class="blueBtn"
            size="small"
            @click="chooseTable"
          >加载合并数据</el-button>
        <!--<div class="top-tip">-->
          <!--<span>请选择表格：</span>-->
          <!--<el-select v-model="tableIndex" placeholder size="small" style="margin-left:20px;">-->
            <!--<el-option v-for="(item, index) in tableList" :key="index" :label="item" :value="item"></el-option>-->
          <!--</el-select>-->
          <!--<el-button style="margin-left:20px;" class="blueBtn" size="small" @click="chooseTable">确定</el-button>-->

          <!--v-if="graphBtn"-->
          <el-button
            type="primary"
            class="darkBtn"
            size="small"
            style="float:right; margin-right:5px;"
            @click="deNoise"
          >属性去噪</el-button>
          <div style="float:right; margin-right:5px;">
            <span style="margin-left:5px;">选择去噪方法：</span>
            <el-select
              v-model="algorithm"
              style="width:150px;margin-left: 5px;"
              placeholder="请选择算法"
              size="small"
            >
              <el-option v-for="item in algorithmList" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </div>
          <el-button
            class="darkBtn"
            size="small"
            style="float:right;margin-right:5px"
            :disabled="btnDisable"
            @click="checkAll"
          >全选</el-button>
          <el-input
            type="text"
            size="small"
            style="width:155px;margin-right:5px;float:right;"
            placeholder="请输入范围 如：1,5"
            :disabled="iptDisable"
            v-model="iptVal"
            @input="iptChange(iptVal)"
            @focus="focusFn"
            @blur="blurFn"
            ></el-input>
        </div>
        <!--用户操作-->
        <!--<div style="margin-left:20px;margin-bottom: 10px;" v-if="!sourceFlag">-->
        <!--<span>属性去躁方法：</span>-->
        <!--<el-select v-model="algorithm" style="margin-left: 5px;" placeholder="请选择方法" size="small">-->
        <!--<el-option v-for="item in algorithmList" :key="item" :label="item" :value="item"></el-option>-->
        <!--</el-select>-->
        <!--</div>-->

        <!--表格部分-->
        <el-table
          :data="tableData.slice((curPage - 1) * 20, curPage * 20)"
          :header-cell-style="{background:'#F6F7FB',color:'#606266'}"
          border
          height="626"
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
          :total="fileCount"
          :page-size="20"
          @current-change="handleCurrentChange"
          :current-page="curPage"
        ></el-pagination>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  let that;
export default {
  name: "DeNoise",
  data() {
    return {
      btnDisable: false,
      iptDisable: false,
      number: 0,
      numberArr: [],
      numberStr: "",
      iptVal: "",
      sourceFlag: true,
      sourceIndex: "",
      sourceList: ["数据源1", "数据源2"],
      tableList: ["演示数据", "表格2"],
      isList: false,
      fileCount: 0,
      curPage: 1,
      //表格数据，结构化数据列表
      rawData: [],
      tableIndex: "",
      tableData: [],
      columnNames: [],
      //选中行
      choosenRow: {},
      choosenInd: [],
      //三元组数据
      tripleData: [],
      //上次已标记的map
      pastSumMap: {},
      loadingRes: false,
      loadingResGraph: false,
      algorithm: "",
      algorithmList: ["函数依赖"],
      //合并数据信息
      isUnion: false,
      unionList: [],
      allTable: [
        {
          value: "海战场装备性能库1",
          label: "海战场装备性能库1",
          level: 1
        },
        {
          value: "海战场装备性能库2",
          label: "海战场装备性能库2",
          level: 1
        },
        {
          value: "海战场装备性能库3",
          label: "海战场装备性能库3",
          level: 1
        }
      ],
      props: {
        multiple: true,
        lazy: true,
        lazyLoad(node, resolve) {
          if (node.data.leaf) {
            resolve(node);
            return;
          }

          const { level } = node;
          let fd = new FormData();
          fd.append("source", node.label);
          that.$http
            .post("http://39.102.71.123:23352/pic/struct_data_source", fd, {
              headers: {
                "Content-Type": "multipart/form-data"
              }
            })
            .then(res => {
              let children = res.data.map(cur => {
                return { value: cur, label: cur, leaf: level == 1 };
              });
              console.log(children);
              resolve(children);
            })
            .catch(res => {
              alert("出错了");
              resolve(node);
            });

          // value: ++id,
          // label: `选项${id}`,
          // leaf: level >= 2
          // 通过调用resolve将子节点数据返回，通知组件数据加载完成
        }
      },
      inputName:"",
    };
  },
  methods: {
    //全选按钮
    checkAll() {
      this.numberArr = [1, this.number];
      this.numberStr = this.numberArr.toString();
      if(this.numberStr != "1,0") {
        this.iptDisable = true;
        this.$message({
          message: '全选成功！',
          type: 'success'
        });
      }else {
        this.$message({
          message: '请先选择数据！',
          type: 'warning'
        });
      }
    },
    iptChange(iptVal) {
      if(this.iptVal != "") {
        this.btnDisable = true;
      }else {
        this.btnDisable = false;
      }
    },
    focusFn() {
      this.btnDisable = true;
    },
    blurFn() {
      if(this.iptVal == "") {
        this.btnDisable = false;
      }else {
        this.btnDisable = true;
      }
    },
    chooseSource() {
      if (this.sourceIndex === "") {
        this.$message({
          message: "请先选择数据源",
          type: "warning"
        });
        return;
      }

      this.sourceFlag = false;
      // this.tableList = [];
      // this.tableIndex="";
      //
      // let fd = new FormData();
      // fd.append("source", this.sourceIndex);
      // this.$http
      //   .post("http://39.102.71.123:23352/pic/view_structData", fd, {
      //     headers: {
      //       "Content-Type": "multipart/form-data"
      //     }
      //   })
      //   .then(res => {
      //     console.log(res);
      //     this.sourceFlag=false;
      //   })
      //   .catch(res => {
      //     //请求失败
      //     console.log(res);
      //   });
    },
    unionTable(){
      if (this.inputName === "") {
        this.$message({
          message: "请先为合并后表格命名！",
          type: "warning"
        });
        return;
      }

      console.log(this.unionList);
      let fd = new FormData();
      let source = [];
      let table = [];
      for (let i of this.unionList) {
        source.push(i[0]);
        table.push(i[1]);
      }
      fd.append("source", JSON.stringify(source));
      fd.append("table", JSON.stringify(table));
      fd.append("name", this.inputName);
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/struct_merge_data", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          if (res.data === "无法对该数据表格进行合并，请重新选择数据表格(Aircraft_1 or Aircraft_2 or Aircraft_3)") {
            this.$message.error(res.data);
          } else {
            this.properties = res.data;
            this.isUnion = true;
          }
          this.loadingRes = false;
        })
        .catch(res => {
          console.log(res);
          alert("出错了！");
          this.isUnion = false;
          this.loadingRes = false;
        });
    },
    chooseTable() {
      // console.log(this.tableIndex)
      if (this.tableIndex === "") {
        this.$message({
          message: "请先选择表格",
          type: "warning"
        });
        return;
      }

      this.columnNames = [];
      this.tableData = [];
      this.loadingRes = true;
      let fd = new FormData();
      fd.append("table", this.tableIndex);
      this.$http
        .post("http://39.102.71.123:23352/pic/view_noise_data", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          this.iptDisable = false;
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
          this.rawData = res.data[1];

          this.fileCount = res.data[1].length;
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
    //属性去噪
    deNoise() {
      if (this.tableIndex === "") {
        this.$message({
          message: "请先加载数据",
          type: "warning"
        });
        return;
      }

      if (this.algorithm === "") {
        this.$message({
          message: "请先选择去噪方法",
          type: "warning"
        });
        return;
      }

      this.loadingRes = true;
      let fd = new FormData();
      if(this.iptVal != "") {
        this.numberStr = this.iptVal;
      }
      fd.append("table", this.tableIndex);
      fd.append("rows",this.numberStr);
      this.$http
        .post("http://39.102.71.123:23352/pic/data_filter", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          if(res.data == 0) {
            this.loadingRes = false;
            this.$message.error('输入的范围格式错误,或不在规定范围');
          }else {
            this.rawData = [].concat(res.data[1]);
  
            this.columnNames = [].concat(
              res.data[0].map(cur => {
                return { prop: cur, label: cur };
              })
            );
  
            //加载去噪后数据替换在tableData中
            this.tableData = [].concat(
              res.data[1].map(cur => {
                let res = {};
                for (let i = 0; i < this.columnNames.length; i++)
                  res[this.columnNames[i].prop] = cur[i];
                return res;
              })
            );
            this.fileCount = res.data[1].length;
            this.loadingRes = false;
          }
        })
        .catch(res => {
          //请求失败
          console.log(res);
          this.loadingRes = false;
        });
    },
    init() {
      this.$http
        .post("http://39.102.71.123:23352/pic/load_noise_data", {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          this.tableIndex = "";
          this.tableList = res.data;
        })
        .catch(res => {
          //请求失败
          console.log(res);
        });
    },
  },

  mounted() {
    // this.init();
    that = this;
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
