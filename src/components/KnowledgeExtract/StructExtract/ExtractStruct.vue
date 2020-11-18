<template>
  <el-container>
    <div
      v-loading.fullscreen.lock="fullscreenLoading"
      element-loading-text="正在处理中，请稍等……"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
    ></div>
    <el-main>
      <!--顶部-->
      <div class="header" v-if="!graphFlag">
        <i class="el-icon-back" v-if="!sourceFlag" @click="backToSource" style="margin-right:10px;"></i>
        结构化数据抽取
      </div>
      <el-divider v-if="!graphFlag"></el-divider>
      <!--中心-->
      <div class="main" v-if="!graphFlag">
        <!--表格查看-->
        <div class="top-tip" v-if="sourceFlag">
          <span>请选择数据源：</span>
          <el-select v-model="sourceIndex" placeholder size="small" style="margin:0 15px;">
            <el-option v-for="(item, index) in sourceList" :key="index" :label="item" :value="item"></el-option>
          </el-select>
          <!-- <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="chooseSource">确定</el-button> -->

          <span>映射方式：</span>
          <el-select v-model="mapIndex" size="small" style="margin:0 15px;" placeholder>
            <el-option v-for="(item, index) in mapList" :key="index" :label="item" :value="item"></el-option>
          </el-select>
          <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="chooseMap">确定</el-button>
        </div>
        <div class="top-tip" v-if="!sourceFlag">
          <div style="width:100%">
            <span>请选择表格：</span>
            <el-select
              v-model="tableIndex"
              placeholder
              size="small"
              style="width: 200px;"
            >
              <el-option
                v-for="(item, index) in properties"
                :key="index"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
            <el-button
              style="margin-left:10px;"
              class="blueBtn"
              size="small"
              @click="chooseTable"
            >确定</el-button>

            <!-- <el-button
              class="darkBtn"
              size="small"
              style="float:right; margin-right:10px;"
              @click="showGraph"
            >图谱展示</el-button>-->
            <el-button
              class="darkBtn"
              size="small"
              style="float:right; margin-right:10px;"
              @click="extractRelation"
            >抽取实体关系</el-button>
            <el-button
              class="darkBtn"
              size="small"
              style="float:right; margin-right:10px;"
              @click="extractProperty"
            >抽取实体属性</el-button>
            <el-button
              class="darkBtn"
              size="small"
              style="float:right; margin-right:10px;"
              @click="extractEntity"
            >抽取实体</el-button>
            <el-button
              class="darkBtn"
              size="small"
              style="float:right; margin-right:10px;"
              @click="checkAll"
              :disabled="btnDisable"
            >全选</el-button>
            <el-input 
              type="text"
              size="small"
              style="width:170px;margin-right:5px;float:right;"
              placeholder="输入抽取范围 如：1,5"
              v-model="iptVal"
              :disabled="iptDisable"
              @input="iptChange(iptVal)"
              @focus="focusFn"
              @blur="blurFn"
            ></el-input>
          </div>
          <el-row style="width:100%;margin-top:10px;">
            <span>请选择本体：</span>
            <el-select
              v-model="typeSelect"
              size="mini"
              style="width:200px;"
              @change="typeChange"
              :disabled="canFlag"
            >
              <el-option
                v-for="(item, index) in typeList"
                :key="index"
                :label="item"
                :value="item"
                :multiple="true"
              ></el-option>
            </el-select>

            <span style="margin-left:20px;">请选择实体：</span>
            <el-cascader
              :key="entitykey"
              :options="entityList"
              v-model="entitySelect"
              @change="entityChange"
              :disabled="canFlag"
              size="mini"
            ></el-cascader>
            
            <span style="margin-left:20px;">请选择属性：</span>
            <el-cascader
              :key="propertyKey"
              :options="propertyList"
              v-model="propertySelect"
              @change="propertyChange"
              :disabled="canFlag"
              size="mini"
            ></el-cascader>
          </el-row>
          <el-row style="margin-top:10px;">
            
            <!-- <el-button
              style="float:right;margin-right:20px;"
              class="blueBtn"
              size="small"
              @click="createDependence"
            >生成函数依赖</el-button> -->
          </el-row>
          <div style="width:100%; margin-top:10px;">
            <el-tag
              v-for="(tag,index) in tags"
              :key="index"
              :type="tag.type"
              closable
              @close="removeTag(tag)"
              style="margin-right:20px;"
            >{{tag.entity}}-{{tag.column}}</el-tag>
          </div>
        </div>

        <!--表格部分-->
        <el-table
          :data="tableData.slice((curPage - 1) * 20, curPage * 20)"
          :header-cell-style="{background:'#F6F7FB',color:'#606266'}"
          :cell-style="cellStyle"
          border
          height="626"
          v-loading="loadingRes"
          element-loading-text="正在加载中，请稍等……"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.1)"
        >
          <el-table-column
            v-for="(item, index) in columnNames"
            :key="index"
            :prop="item"
            :label="item"
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
      <div class="main" v-if="graphFlag">
        <div class="header">
          <i class="el-icon-back" @click="graphFlag=false"></i>
        </div>
        <el-divider></el-divider>
        <div class="result" style="margin-bottom:50px;">
          <!--关系图谱-->
          <div
            id="kgPic"
            v-loading="loadingResGraph"
            element-loading-text="正在加载中，请稍等……"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.1)"
          >
            <v-echart id="graph1" :style="{width: graphWidth,height:graphHeight}" :options="echartsOptions"></v-echart>
          </div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { option } from "../../../js/echartSettings";
let echarts = require("echarts");
let myChart;
export default {
  name: "ExtractStruct",
  data() {
    return {
      number: 0,
      numberArr: [],
      numberStr: "",
      iptVal: "",
      iptDisable: false,
      btnDisable: false,
      echartsOptions: {},
      tags: [],
      entityList: [],
      entityIndex: [],
      entitySelect: "",
      entitykey: 0, //不加cascader报错
      propertyList: [],
      propertyIndex: [],
      propertySelect: "",
      propertyKey: -1,
      sourceIndex: "",
      sourceList: ["海战场装备性能库1", "海战场装备性能库2","海战场装备性能库3"],
      mapIndex: "",
      mapList: ["自动映射", "手动映射"],
      tableIndex: "",
      properties: [],
      tableData: [],
      curPage: 1,
      columnNames: [],
      fileCount: 0,
      loadingRes: false,
      loadingResGraph: false,
      graphFlag: false,
      typeSelect: "",
      typeList: [], //选择表格
      sourceFlag: true,
      canFlag: true,
      fullscreenLoading: false,
      //图谱
      graphWidth:"100%",
      graphHeight:"100%",
    };
  },
  methods: {
    //全选
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
          message: '请先选择表格！',
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
    //返回按钮
    backToSource() {
      this.tableIndex = '';
      this.tags = [];
      this.entityList = [];
      this.entityIndex = [];
      this.entitySelect = "";
      this.entitykey = 0;
      this.propertyList = [];
      this.propertyIndex = [];
      this.propertySelect = "";
      this.propertyKey = -1;
      this.properties = [];
      this.tableData = [];
      this.curPage = 1;
      this.columnNames = [];
      this.fileCount = 0;
      this.canFlag = true;
      this.sourceIndex = "";
      this.typeSelect = "";
      this.sourceFlag = true;
      this.mapIndex = "";
    },
    removeTag(tag) {
      if (tag.type === "warning") {
        //实体
        let index = this.columnNames.indexOf(tag.column);
        this.entityIndex.splice(this.entityIndex.indexOf(index), 1);
      } else if (tag.type === "success") {
        //属性
        let index = this.columnNames.indexOf(tag.column);
        this.propertyIndex.splice(this.propertyIndex.indexOf(index), 1);
      }
      this.tags.splice(this.tags.indexOf(tag), 1);
    },
    //选择属性
    propertyChange() {
      this.tags.push({
        entity: this.propertySelect[0],
        column: this.propertySelect[1],
        type: "success"
      });
      this.propertyIndex.push(this.columnNames.indexOf(this.propertySelect[1]));
    },
    //选择实体
    entityChange() {
      //先获取属性列表
      this.propertyKey -= 1;
      this.propertyList = [];
      this.tags = [];
      this.propertyIndex = [];
      this.entityIndex = [];
      let fd = new FormData();
      fd.append("ontology", this.typeSelect);
      fd.append("ontology_center", this.entitySelect[0]);
      this.$http
        .post("http://39.102.71.123:23352/pic/show_ontology2", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          let str = "";
          for (let i of res.data) {
            if (str.indexOf(i) === -1) {
              str += i;
              this.propertyList.push({
                label: i,
                value: i,
                children: this.columnNames.map(cur => {
                  return { label: cur, value: cur };
                })
              });
            }
          }
        });
      //再将对应列高亮+添加tag
      this.tags.push({
        entity: this.entitySelect[0],
        column: this.entitySelect[1],
        type: "warning"
      });

      this.entityIndex.push(this.columnNames.indexOf(this.entitySelect[1]));
    },
    //选择本体
    typeChange() {
      this.entitykey += 1;
      this.entityList = [];

      let fd = new FormData();
      fd.append("ontology", this.typeSelect);
      this.$http
        .post("http://39.102.71.123:23352/pic/show_ontology1", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          // console.log(res);
          let str = "";
          for (let i of res.data) {
            if (str.indexOf(i) === -1) {
              str += i;
              this.entityList.push({
                label: i,
                value: i,
                children: this.columnNames.map(cur => {
                  return { label: cur, value: cur };
                })
              });
            }
          }
        })
        .catch(res => {
          console.log(res);
        });
    },
    //生成函数依赖
    /* createDependence() {
      let fd = new FormData();
      fd.append("ontology", this.typeSelect);
      this.$http
        .post("http://39.102.71.123:23352/pic/functional_dependency", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          let str = "";
          for (let i of res.data) {
            str +=
              "<p><strong>" +
              i[0] +
              " <i>" +
              i[1] +
              "</i>  " +
              i[2] +
              "</strong></p>";
          }
          this.$alert(str, "函数依赖结果", {
            dangerouslyUseHTMLString: true
          });
        })
        .catch(res => {
          console.log(res);
        });
    }, */
    //抽取实体
    extractEntity() {
      let fd = new FormData();
      if(this.iptVal != "") {
        this.numberStr = this.iptVal;
      }
      fd.append("source", this.sourceIndex);
      fd.append("table", this.tableIndex);
      fd.append("rows",this.numberStr);
      if (this.typeSelect === "") {
        this.$message({
          message: "请选择本体！",
          type: "warning"
        });
        return;
      }
      fd.append("ontology", this.typeSelect);
      let columns = [];
      let ontology_data = [];
      for (let i of this.tags) {
        if (i.type === "warning") columns.push(i.column);
        ontology_data.push(i.entity);
      }
      if (columns.length < 1) {
        this.$message({
          message: "请选择实体！",
          type: "warning"
        });
        return;
      }
      this.fullscreenLoading = true;
      fd.append("columns", JSON.stringify(columns));
      fd.append("ontology_data", JSON.stringify(ontology_data));
      this.$http
        .post("http://39.102.71.123:23352/pic/struct_entity_extract", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          if(res.data == 0) {
            this.fullscreenLoading = false;
            this.$message.error('输入抽取范围格式错误,或不在规定范围');
          }else {
            this.showGraph(res);
            this.propertyIndex = [];
            this.entityIndex = [];
            this.tags = [];
            this.propertySelect = "";
            this.entitySelect = "";
            this.propertyList = [];
          }
        })
        .catch(res => {
          console.log(res);
          this.fullscreenLoading = false;
        });
    },
    //抽取实体关系
    extractRelation() {
      let fd = new FormData();
      if(this.iptVal != "") {
        this.numberStr = this.iptVal;
      }
      fd.append("source", this.sourceIndex);
      fd.append("table", this.tableIndex);
      fd.append("rows",this.numberStr);
      if (this.typeSelect === "") {
        this.$message({
          message: "请选择本体！",
          type: "warning"
        });
        return;
      }
      this.fullscreenLoading = true;
      fd.append("ontology", this.typeSelect);
      this.$http
        .post("http://39.102.71.123:23352/pic/struct_relation_extract", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          if(res.data == 0) {
            this.fullscreenLoading = false;
            this.$message.error('输入抽取范围格式错误,或不在规定范围');
          }else {
            this.showGraph(res);
  
            this.propertyIndex = [];
            this.entityIndex = [];
            this.tags = [];
            this.propertySelect = "";
            this.propertyList = [];
            this.entitySelect = "";
            this.numberStr = "";
            this.iptVal = "";
            this.iptDisable = false;
            this.btnDisable = false;
            // if (res.data[0] === 1) {
            //   this.$message({
            //     message: "抽取实体关系成功!",
            //     type: "success"
            //   });
            // } else this.$message.error("抽取失败！");
          }
        })
        .catch(res => {
          console.log(res);
          this.fullscreenLoading = false;
        });
    },
    //抽取实体属性
    extractProperty() {
      let fd = new FormData();
      if(this.iptVal != "") {
        this.numberStr = this.iptVal;
      }
      fd.append("source", this.sourceIndex);
      fd.append("table", this.tableIndex);
      fd.append("rows",this.numberStr);
      if (this.typeSelect === "") {
        this.$message({
          message: "请选择本体！",
          type: "warning"
        });
        return;
      }
      fd.append("ontology", this.typeSelect);

      let columns = [];
      let ontology_data = [];
      columns.push(this.entitySelect[1]);
      ontology_data.push(this.entitySelect[0]);
      for (let i of this.tags) {
        if (i.type === "success") {
          columns.push(i.column);
          ontology_data.push(i.entity);
        }
      }
      if (columns.length <= 1) {
        this.$message({
          message: "请至少选择一个属性！",
          type: "warning"
        });
        return;
      }
      this.fullscreenLoading = true;
      console.log(columns, ontology_data);
      fd.append("columns", JSON.stringify(columns));
      fd.append("ontology_data", JSON.stringify(ontology_data));
      this.$http
        .post("http://39.102.71.123:23352/pic/struct_attribute_extract", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          if(res.data == 0) {
            this.fullscreenLoading = false;
            this.$message.error('输入抽取范围格式错误,或不在规定范围');
          }else {
            this.showGraph(res);
            // if (res.data[0] === 1) {
            //   this.$message({
            //     message: "抽取实体属性成功!",
            //     type: "success"
            //   });
            this.propertyIndex = [];
            this.entityIndex = [];
            this.tags = [];
            this.propertySelect = "";
            this.propertyList = [];
            this.entitySelect = "";
            // } else this.$message.error("抽取失败！");
          }
        })
        .catch(res => {
          console.log(res);
          this.fullscreenLoading = false;
        });
    },
    //确定
    chooseSource() {
      if (this.sourceIndex === "") {
        this.$message({
          message: "请先选择数据源",
          type: "warning"
        });
        return;
      }
      let fd = new FormData();
      fd.append("source", this.sourceIndex);
      this.$http
        .post("http://39.102.71.123:23352/pic/struct_data_source", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          this.properties = res.data;
          this.sourceFlag = false;
        })
        .catch(res => {
          console.log(res);
        });
    },
    //确定
    chooseMap() {
      this.fullscreenLoading = true;
      //先判断数据源
      console.log("this.sourceIndex",this.sourceIndex)
      if (this.sourceIndex === "") {
        this.fullscreenLoading = false;
        this.$message({
          message: "请先选择数据源",
          type: "warning"
        });
        return;
      }
      //判断映射方式
      if(this.mapIndex == "手动映射") {
        let fd = new FormData();
        fd.append("source", this.sourceIndex);
        this.$http
        .post("http://39.102.71.123:23352/pic/struct_data_source", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          this.fullscreenLoading = false;
          this.properties = res.data;
          this.sourceFlag = false;
        })
        .catch(res => {
          console.log(res);
          this.fullscreenLoading = false;
        });
      }else if(this.mapIndex == "自动映射") {
        let fd = new FormData();
        fd.append("source", this.sourceIndex);
        this.$http
          .post("http://39.102.71.123:23352/pic/extract_struct_database", fd, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          })
          .then(res => {
            this.fullscreenLoading = false;
            console.log("res",res);
            this.showGraph(res); //展示图谱
          })
          .catch(error => {
            this.fullscreenLoading = false;
            console.log(error);
          })
      }
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (this.entityIndex.indexOf(columnIndex) !== -1) {
        return `background-color:#FDF6EC ;`;
      } else if (this.propertyIndex.indexOf(columnIndex) !== -1) {
        return `background-color:#F0F9EB ;`;
      } else {
        return "";
      }
    },
    //选择表格 确定
    chooseTable() {
      if (this.tableIndex === "") return;
      this.loadingRes = true;
      this.iptDisable = false;
      //清空表格记录
      this.columnNames = [];
      this.tableData = [];
      //清空本体关系
      this.typeSelect = "";
      this.entityIndex = [];
      this.propertyIndex = [];
      this.entityList = [];
      this.entitykey = 0;
      this.tags = [];
      this.propertyKey = -1;
      this.propertyList = [];

      let fd = new FormData();
      fd.append("table", this.tableIndex);
      fd.append("source", this.sourceIndex);
      this.$http
        .post("http://39.102.71.123:23352/pic/view_structData", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          this.columnNames = res.data[0];

          let column = res.data[0];
          this.number = res.data[1].length;
          this.tableData = res.data[1].map(cur => {
            let res = {};
            for (let i = 0; i < column.length; i++) res[column[i]] = cur[i];
            return res;
          });
          // this.rawData = res.data[1];

          this.fileCount = res.data[1].length;
          this.canFlag = false;
          this.loadingRes = false;
        })
        .catch(res => {
          //请求失败
          console.log(res);
          alert("请求失败");
          this.loadingRes = false;
        });
        this.$http
          .post("http://39.102.71.123:23352/pic/ontology_source", {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          })
          .then(res => {
            console.log("1111",res.data);
            this.typeList = res.data;
          })
          .catch(error => {
            console.log(error);
          })
    },
    //展示图谱
    showGraph(res) {
      this.graphFlag = true;
      if (res.data.length === 0) {
        this.fullscreenLoading = false;
        this.$message.error("该表格不可抽取！");
        this.graphFlag = false;
        return;
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
      this.echartsOptions = Myoption;
      this.fullscreenLoading = false;
    },
    loadData() {
      this.$http
        .post("http://39.102.71.123:23352/pic/show_table", {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          this.properties = res.data;
        })
        .catch(res => {
          //请求失败
          console.log(res);
        });
    },
    handleCurrentChange(cpage) {
      this.curPage = cpage;
    }
    // entityPropertyReflect() {
    //   if (this.typeSelect === "") {
    //     this.$message({
    //       message: "请先选择本体类型！",
    //       type: "warning"
    //     });
    //     return;
    //   }
    //   let fd = new FormData();
    //   fd.append("table", this.tableIndex);
    //   fd.append("ontology", this.typeSelect);
    //   this.$http
    //     .post("http://39.102.71.123:23352/pic/establish_map", fd, {
    //       headers: {
    //         "Content-Type": "multipart/form-data"
    //       }
    //     })
    //     .then(res => {
    //       let columnNames = this.columnNames.map(cur => {
    //         return cur.prop;
    //       });
    //       this.entityPropertyIndex = [];
    //       for (let i of res.data) {
    //         let index = columnNames.indexOf(i);
    //         if (index !== -1) {
    //           this.entityPropertyIndex.push(index);
    //         }
    //       }
    //       console.log(this.entityPropertyIndex);
    //       this.$message({
    //         message: "映射建立完成！",
    //         type: "success"
    //       });
    //     })
    //     .catch(res => {
    //       //请求失败
    //       alert("出错了！");
    //       console.log(res);
    //     });
    // },
    // entityRelationReflect() {
    //   if (this.typeSelect === "") {
    //     this.$message({
    //       message: "请先选择本体类型！",
    //       type: "warning"
    //     });
    //     return;
    //   }
    //   let fd = new FormData();
    //   fd.append("table", this.tableIndex);
    //   fd.append("ontology", this.typeSelect);
    //   this.$http
    //     .post("http://39.102.71.123:23352/pic/establish_map", fd, {
    //       headers: {
    //         "Content-Type": "multipart/form-data"
    //       }
    //     })
    //     .then(res => {
    //       let columnNames = this.columnNames.map(cur => {
    //         return cur.prop;
    //       });
    //       this.entityRelationIndex = [];
    //       for (let i of res.data) {
    //         let index = columnNames.indexOf(i);
    //         if (index !== -1) {
    //           this.entityRelationIndex.push(index);
    //         }
    //       }
    //       console.log(this.entityRelationIndex);
    //       this.$message({
    //         message: "映射建立完成！",
    //         type: "success"
    //       });
    //     })
    //     .catch(res => {
    //       //请求失败
    //       alert("出错了！");
    //       console.log(res);
    //     });
    // },
  },
  beforeDestroy() {
    if (myChart) {
      echarts.dispose(myChart);
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
/*************内容中心*************/
.main {
  line-height: 30px;
  height: 90%;
  width: 100%;
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
.top-tip {
  margin-top: -10px;
  margin-bottom: 10px;
  padding-left: 20px;
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
.el-pagination.is-background .el-pager li:not(.disabled).active {
  background-color: #5775fb !important;
}
.el-pagination.is-background .el-pager li:hover {
  color: #5775fb !important;
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
