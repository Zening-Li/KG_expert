<template>
  <el-container>
    <!--内容块实体对齐-->
    <div
      v-loading.fullscreen.lock="loadingRes"
      element-loading-text="正在处理中，请稍等……"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
    ></div>
    <el-main>
      <!--顶部-->
      <div class="header">实体对齐</div>
      <el-divider></el-divider>
      <!--中心-->
      <!--列表页-->
      <div class="main">
        <!--表格查看-->

        <!--合并表格选项-->
        
        <div class="top-tip">
          <span>请选择数据源：</span>
          <el-select v-model="unionIndex" size="small" style="margin: 20px 0 0 20px;">
            <el-option v-for="(item, index) in unionList" :key="index" :label="item" :value="item"></el-option>
          </el-select>
          <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="unionTable">确定</el-button>
        </div>
        <div class="top-tip">
          <span>请选择表格：</span>
          <el-select v-model="tableIndex" placeholder size="small" style="margin-left:20px;">
            <el-option v-for="(item, index) in properties" :key="index" :label="item" :value="item"></el-option>
          </el-select>
          <el-button style="margin-left:20px;" class="blueBtn" size="small" @click="chooseTable">确定</el-button>
        </div>
        <div>
          <el-button
            :disabled="positiveFlag"
            class="blueBtn"
            size="small"
            @click="setPositive"
            style="margin-left:20px;"
          >设为正样例</el-button>
          <el-button
            :disabled="negativeFlag"
            class="blueBtn"
            size="small"
            @click="setNegative"
            style="margin-left:15px;"
          >设为负样例</el-button>

          <el-button
            class="darkBtn"
            size="small"
            @click="submitMarks"
            style="float:right; margin-right:30px;"
            :disabled="!threeColumns"
          >提交</el-button>
        </div>
        <!--表格部分-->
        <el-checkbox-group v-model="checkList" :max="2">
          <el-table
            :data="tableData.slice((curPage - 1) * 20, curPage * 20)"
            :header-cell-style="{background:'#F6F7FB',color:'#606266'}"
            border
            height="626"
          >
            <el-table-column width="40">
              <template slot-scope="scope">
                <el-checkbox :label="scope.row.index">{{""}}</el-checkbox>
              </template>
            </el-table-column>
            <el-table-column
              v-for="(item, index) in columnNames"
              :key="index"
              :prop="item.prop"
              :label="item.label"
            ></el-table-column>
          </el-table>
        </el-checkbox-group>
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
    <!--查看结果内容块-->
    <el-main v-show="resDetailFlag">
      <!--顶部-->
      <div class="header">
        <i class="el-icon-back" @click="resDetailFlag=false"></i>
        <span style="margin-left:10px;font-size:large;font-weight:bold;">查看上轮训练效果</span>
      </div>
      <el-divider></el-divider>
      <!--中心-->

      <!--结构化数据列表-->
      <div id="tablePart">
        <el-table
          :data="resTableData"
          :header-cell-style="{background:'#F6F7FB',color:'#606266'}"
          height="626"
          border
        >
          <el-table-column
            v-for="(item, index) in resColumnNames"
            :key="index"
            :prop="item.prop"
            :label="item.label"
          ></el-table-column>
        </el-table>
        <!-- 分页符-->
        <!-- <el-pagination
          background
          layout="prev, pager, next"
          :total="fileCount"
          :page-size="20"
          @current-change="handleCurrentChange"
          :current-page="curPage">
        </el-pagination>-->
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
      markSum: 0,
      isList: false,
      fileCount: 0,
      isUpload: false,
      curPage: 1,
      //上传的文件列表
      fileList: [],
      //表格数据，结构化数据列表
      tableData: [],
      //选中行
      choosenRow: {},
      //三元组数据
      tripleData: [],
      rawData: [],
      tableIndex: "",
      choosenInd: [],
      checkList: [],
      // portionList:["8:2", "7:3", "6:4"],
      //记录标记样例情况
      positiveFatherIndex: {},
      positiveMap: {},
      negativeMap: {},
      properties: [],
      columnNames: [],
      //提交后展示相关信息的显示控制
      showRes: false,
      recall: 0,
      resDetailFlag: false,
      //控制设置样例btn禁用
      negativeFlag: true,
      positiveFlag: true,
      negativeMax: -1,
      negativeCount: 0,
      negativeOldCount: 0,
      positiveMax: -1,
      positiveCount: 0,
      positiveOldCount: 0,
      //实体对齐时已有训练数据集的数量
      resTableData: [],
      resColumnNames: [],
      //上次已标记的map
      pastSumMap: {},
      //控制显示图谱的相关变量
      graphBtn: false,
      graphFlag: false,
      ontologyFlag: false,
      // keyword:"",
      inputEntity1: "",
      inputRelation: "",
      inputEntity2: "",
      entityRelationFlag: true,
      levelList: [
        {
          label: "一级查询",
          value: 1
        },
        {
          label: "二级查询",
          value: 2
        },
        {
          label: "三级查询",
          value: 3
        }
      ],
      level: 1,
      loadingRes: false,
      loadingResGraph: false,
      //合并数据信息
      isUnion: false,
      unionIndex: "",
      unionList: ["structData", "structData2", "structData3"],
    };
  },

  methods: {
    //选择数据源 确定
    unionTable(){
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
    //修改表格显示值
    changeTableData(fatherIndex) {
      //处理表格“与x为正例列字符串”
      let indexSet = new Set();
      indexSet.add(fatherIndex);
      for (let i of this.positiveMap[fatherIndex]) {
        indexSet.add(i);
      }
      let indexArray = Array.from(indexSet);
      for (let k = 0; k < indexArray.length; k++) {
        let flag = true;
        this.tableData[indexArray[k] - 1].pastMark = " ";
        for (let j = 0; j < indexArray.length; j++) {
          if (j === k) continue;
          if (flag) {
            if (this.tableData[indexArray[k] - 1].pastMark === " ")
              //上次未标记
              this.tableData[indexArray[k] - 1].positiveMark =
                indexArray[j] + "";
            else
              this.tableData[indexArray[k] - 1].positiveMark =
                this.tableData[indexArray[k] - 1].pastMark +
                "," +
                indexArray[j];
            flag = false;
          } else {
            this.tableData[indexArray[k] - 1].positiveMark +=
              "," + indexArray[j];
          }
        }
      }
    },
    changeDisableFlag(flag) {
      //flag=3 正负都可以
      //flag=2 正例标记
      //flag=1 负例标记
      console.log("judge  max  count");
      console.log(this.positiveMax, this.negativeMax);
      console.log(this.positiveCount, this.negativeCount);
      console.log(this.positiveOldCount, this.negativeOldCount);
      if (
        (flag == 1 || flag === 3) &&
        this.negativeMax <= this.negativeCount - this.negativeOldCount
      ) {
        this.negativeFlag = true;
        this.$message({
          message: "负样例总数已达到最大值，若仍需标记请填写更大的用例总数",
          type: "warning"
        });
      } else if (flag == 1 || flag === 3) {
        this.negativeFlag = false;
      }

      if (
        (flag == 2 || flag === 3) &&
        this.positiveMax <= this.positiveCount - this.positiveOldCount
      ) {
        this.positiveFlag = true;
        this.$message({
          message: "正样例总数已达到最大值，若仍需标记请填写更大的用例总数",
          type: "warning"
        });
      } else if (flag == 2 || flag === 3)
        this.positiveFlag = false;
      console.log(this.positiveFlag, this.negativeFlag);
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
    handleCurrentChange(cpage) {
      this.curPage = cpage;
    },
    findIndex(index) {
      //简单遍历查找 后期改为二分查找
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].index === index) return i;
      }
    },
    //设为正样例
    setPositive() {
      this.checkList.sort(function(a, b) {
        return a > b ? 1 : -1;
      });

      //判断是否重复标记
      if (
        (this.pastSumMap[this.checkList[0]] &&
          this.pastSumMap[this.checkList[0]].has(this.checkList[1])) ||
        (this.positiveMap[this.checkList[0]] &&
          this.positiveMap[this.checkList[0]].has(this.checkList[1])) ||
        (this.negativeMap[this.checkList[0]] &&
          this.negativeMap[this.checkList[0]].has(this.checkList[1]))
      ) {
        this.checkList = [];
        this.$message({
          message: "该对实体已标记，请重新选择",
          type: "warning"
        });
        return;
      }

      let recordPositiveFatherIndex=this.positiveFatherIndex;
      let recordPositiveMap=this.positiveMap;

      //计算正例个数并维护对应的set
      //为解决已标记AB1再标记BC1的情况时，将C放入A的value中，而不是B的value中
      //positiveFatherIndex用于记录A的位置
      let indexMin, oldCount, newCount;
      if (
        !this.positiveFatherIndex[this.checkList[0]] &&
        !this.positiveFatherIndex[this.checkList[1]]
      ) {
        //这一组实体都没被标记过
        if (!this.positiveMap[this.checkList[0]]) {
          this.positiveMap[this.checkList[0]] = new Set();
          oldCount = 0;
        } else {
          oldCount = this.getCombinationNum(
            this.positiveMap[this.checkList[0]].size + 1
          );
        }
        if (this.positiveMap[this.checkList[1]]) {
          oldCount += this.getCombinationNum(
            this.positiveMap[this.checkList[1]].size + 1
          );
          for (let i of this.positiveMap[this.checkList[1]]) {
            this.positiveMap[this.checkList[0]].add(i);
            this.positiveFatherIndex[i] = this.checkList[0];
          }
          this.positiveMap[this.checkList[1]] = null;
        }
        this.positiveMap[this.checkList[0]].add(this.checkList[1]);
        this.positiveFatherIndex[this.checkList[1]] = this.checkList[0];
        indexMin = this.checkList[0];
      } else {
        //若标注的(a,b)任意之一被标记过则最小实体序号有三种可能：fatherA, fatherB, a
        //a(this.checkList[0])最小
        //此时一定不存在fatherA且fatherB小于a，由于不属于上种情况，一定存在fatherB
        if (
          !this.positiveFatherIndex[this.checkList[0]] &&
          this.positiveFatherIndex[this.checkList[1]] > this.checkList[0]
        ) {
          indexMin = this.checkList[0];
          let fatherB = this.positiveFatherIndex[this.checkList[1]];
          if (!this.positiveMap[indexMin]) {
            this.positiveMap[indexMin] = new Set();
            oldCount = 0;
          } else {
            oldCount = this.getCombinationNum(
              this.positiveMap[indexMin].size + 1
            );
          }
          oldCount += this.getCombinationNum(
            this.positiveMap[fatherB].size + 1
          );
          for (let i of this.positiveMap[fatherB]) {
            this.positiveMap[indexMin].add(i);
            this.positiveFatherIndex[i] = indexMin;
          }
          this.positiveFatherIndex[fatherB] = indexMin;
          this.positiveMap[fatherB] = null;
          this.positiveMap[indexMin].add(fatherB);
        }
        //fatherA最小
        else if (
          this.positiveFatherIndex[this.checkList[0]] &&
          ((!this.positiveFatherIndex[this.checkList[1]] &&
            this.positiveFatherIndex[this.checkList[0]] < this.checkList[1]) ||
            (this.positiveFatherIndex[this.checkList[1]] &&
              this.positiveFatherIndex[this.checkList[0]] <
                this.positiveFatherIndex[this.checkList[1]]))
        ) {
          indexMin = this.positiveFatherIndex[this.checkList[0]];
          oldCount = this.getCombinationNum(
            this.positiveMap[indexMin].size + 1
          );
          let fatherB = this.positiveFatherIndex[this.checkList[1]];
          if (fatherB) {
            oldCount += this.getCombinationNum(
              this.positiveMap[fatherB].size + 1
            );
            for (let i of this.positiveMap[fatherB]) {
              this.positiveMap[indexMin].add(i);
              this.positiveFatherIndex[i] = indexMin;
            }
            this.positiveFatherIndex[fatherB] = indexMin;
            this.positiveMap[fatherB] = null;
            this.positiveMap[indexMin].add(fatherB);
          } else {
            if (this.positiveMap[this.checkList[1]]) {
              oldCount += this.getCombinationNum(
                this.positiveMap[this.checkList[1]].size + 1
              );
              for (let i of this.positiveMap[this.checkList[1]]) {
                this.positiveMap[indexMin].add(i);
                this.positiveFatherIndex[i] = indexMin;
              }
              this.positiveMap[this.checkList[1]] = null;
            }
            this.positiveFatherIndex[this.checkList[1]] = indexMin;
            this.positiveMap[indexMin].add(this.checkList[1]);
          }
        }
        //fatherB最小
        else if (
          this.positiveFatherIndex[this.checkList[1]] &&
          ((!this.positiveFatherIndex[this.checkList[0]] &&
            this.positiveFatherIndex[this.checkList[1]] < this.checkList[0]) ||
            (this.positiveFatherIndex[this.checkList[0]] &&
              this.positiveFatherIndex[this.checkList[1]] <
                this.positiveFatherIndex[this.checkList[0]]))
        ) {
          indexMin = this.positiveFatherIndex[this.checkList[1]];
          oldCount = this.getCombinationNum(
            this.positiveMap[indexMin].size + 1
          );
          let fatherA = this.positiveFatherIndex[this.checkList[0]];
          if (fatherA) {
            oldCount += this.getCombinationNum(
              this.positiveMap[fatherA].size + 1
            );
            for (let i of this.positiveMap[fatherA]) {
              this.positiveMap[indexMin].add(i);
              this.positiveFatherIndex[i] = indexMin;
            }
            this.positiveFatherIndex[fatherA] = indexMin;
            this.positiveMap[fatherA] = null;
            this.positiveMap[indexMin].add(fatherA);
          } else {
            if (this.positiveMap[this.checkList[0]]) {
              oldCount += this.getCombinationNum(
                this.positiveMap[this.checkList[0]].size + 1
              );
              for (let i of this.positiveMap[this.checkList[0]]) {
                this.positiveMap[indexMin].add(i);
                this.positiveFatherIndex[i] = indexMin;
              }
              this.positiveMap[this.checkList[0]] = null;
            }
            this.positiveFatherIndex[this.checkList[0]] = indexMin;
            this.positiveMap[indexMin].add(this.checkList[0]);
          }
        }
      }
      newCount = this.getCombinationNum(this.positiveMap[indexMin].size + 1);
      //修改btn是否禁用
      this.positiveCount += newCount - oldCount;
      //如果正例button未被禁用
      if(this.positiveMax >= this.positiveCount - this.positiveOldCount) {

        console.log("---");
        console.log(this.positiveMap);
        console.log(this.positiveFatherIndex);
        console.log(indexMin);

        //修改字符串与x为正例
        this.changeTableData(indexMin);
        this.checkList = [];
      }
      else{
        this.$message({
        message: "正样例总数即将超过最大值，无法进行本次标记，若仍需标记请填写更大的用例总数",
        type: "warning"
        });
        this.positiveCount -= newCount - oldCount;
        this.positiveFatherIndex = recordPositiveFatherIndex;
        this.positiveMap  = recordPositiveMap;
      }
      this.changeDisableFlag(2);
    },
    //设为负样例
    setNegative() {
      this.checkList.sort(function(a, b) {
        return a > b ? 1 : -1;
      });
      let index;
      index = this.checkList[0];

      //判断是否重复标记
      if (
        (this.pastSumMap[this.checkList[0]] &&
          this.pastSumMap[this.checkList[0]].has(this.checkList[1])) ||
        (this.positiveMap[this.checkList[0]] &&
          this.positiveMap[this.checkList[0]].has(this.checkList[1])) ||
        (this.negativeMap[this.checkList[0]] &&
          this.negativeMap[this.checkList[0]].has(this.checkList[1]))
      ) {
        this.checkList = [];
        this.$message({
          message: "该对实体已标记，请重新选择",
          type: "warning"
        });
        return;
      }

      //计算负例个数并维护对应的set
      if (!this.negativeMap[index]) {
        this.negativeMap[index] = new Set();
      }
      if (this.negativeMap[index].has(this.checkList[1])) {
        this.checkList = [];
        return;
      } else {
        this.negativeMap[index].add(this.checkList[1]);
      }
      this.negativeCount += 1;
      //修改btn是否禁用
      this.changeDisableFlag(1);

      //处理表格“与x为负例列字符串”
      let indexi = this.findIndex(this.checkList[0]);
      let indexj = this.findIndex(this.checkList[1]);
      if (this.tableData[indexi].negativeMark === " ")
        this.tableData[indexi].negativeMark = this.checkList[1] + "";
      else this.tableData[indexi].negativeMark += "," + this.checkList[1];
      if (this.tableData[indexj].negativeMark === " ")
        this.tableData[indexj].negativeMark = this.checkList[0] + "";
      else this.tableData[indexj].negativeMark += "," + this.checkList[0];
      // for(let i = 0; i < this.checkList.length; i ++){
      //   let indexi = this.findIndex(this.checkList[i]);
      //   for(let j = 0; j < this.checkList.length; j ++){
      //     if(i === j) continue;
      //     // let indexj = this.findIndex(this.checkList[j]);
      //     if(this.tableData[indexi].negativeMark!==" ")
      //       this.tableData[indexi].negativeMark += ", " + this.checkList[j];
      //     else this.tableData[indexi].negativeMark = this.checkList[j] + "";
      //   }
      // }
      console.log(this.negativeMap);
      this.checkList = [];
    },
    getCombinationNum(n) {
      return (n * (n - 1)) / 2;
    },
    getCombinationArray(map, flag) {
      let res = [];
      if (flag === 1) {
        for (let key in map) {
          // console.log(key)
          // console.log(map[key])
          if (!map[key]) continue;
          let tmp = Array.from(map[key]);
          tmp.push(parseInt(key));
          // console.log("!!!")
          // console.log(key, tmp)
          for (let i = 0; i < tmp.length; i++) {
            for (let j = i + 1; j < tmp.length; j++) {
              res.push([
                this.rawData[tmp[i] - 1],
                this.rawData[tmp[j] - 1],
                flag
              ]);
              // console.log("---")
              // console.log(tmp[i], this.rawData[tmp[i]])
              // console.log(tmp[j], this.rawData[tmp[j]])
            }
          }
        }
      } else if (flag === 0) {
        for (let key in map) {
          let tmp = Array.from(map[key]);
          // tmp.push(parseInt(key))
          let index = parseInt(key);
          for (let i = 0; i < tmp.length; i++) {
            res.push([this.rawData[index - 1], this.rawData[tmp[i] - 1], flag]);
          }
        }
      }
      console.log("---");
      console.log(res);
      return res;
    },
    //提交
    submitMarks() {
      let num = parseInt(this.markSum);
      // if(num > (this.negativeCount + this.positiveCount - this.negativeOldCount - this.positiveOldCount)){
      //   this.$message({
      //     message: '输入的样例总数仍大于已标注的样例数！请标注更多样例或减小总数！',
      //     type: 'warning'
      //   });
      //   return;
      // }
      let positiveArray = this.getCombinationArray(this.positiveMap, 1);
      let negativeArray = this.getCombinationArray(this.negativeMap, 0);
      let Arr = positiveArray.concat(negativeArray);
      let tableName = [this.tableIndex];
      let positiveMarkList = [];
      let negativeMarkList = [];
      for (let i = 0; i < this.tableData.length; i++) {
        positiveMarkList.push(this.tableData[i].positiveMark);
        negativeMarkList.push(this.tableData[i].negativeMark);
      }

      let fd = new FormData();
      fd.append("struct_train_test_data", JSON.stringify(Arr));
      fd.append("table", JSON.stringify(tableName));
      fd.append("mark", JSON.stringify([positiveMarkList, negativeMarkList]));
      console.log(Arr);
      console.log(tableName);
      console.log(positiveMarkList, negativeMarkList);
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/struct_submit", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res);
          this.recall = Math.round(res.data[2] * 10000) / 100;
          //查看结果页表格数据
          this.resColumnNames = [];
          this.resTableData = [];
          let rawColumnNames = [];
          for (let i = 0; i < this.columnNames.length; i++) {
            rawColumnNames.push(this.columnNames[i]);
          }
          this.resColumnNames = [
            { prop: "num", label: "组号" },
            { prop: "flag", label: "结果" }
          ].concat(rawColumnNames.splice(3));
          let count = 1;
          let correct = [];
          if (res.data[3]) {
            for (let i = 0; i < res.data[3].length; i++) {
              let tmp = res.data[3][i];
              tmp = tmp.map(cur => {
                let rec = {};
                rec["flag"] = "正确";
                rec["num"] = count + "";
                for (let i = 2; i < this.resColumnNames.length; i++)
                  rec[this.resColumnNames[i].prop] = cur[i - 1];
                return rec;
              });
              for (let j = 0; j < tmp.length; j++) {
                correct.push(tmp[j]);
              }
              count++;
            }
          }

          let fault = [];
          if (res.data[4][0]) {
            for (let i = 0; i < res.data[4].length; i++) {
              let tmp = res.data[4][i];
              tmp = tmp.map(cur => {
                let rec = {};
                rec["flag"] = "错误";
                rec["num"] = count + "";
                for (let i = 2; i < this.resColumnNames.length; i++)
                  rec[this.resColumnNames[i].prop] = cur[i - 1];
                return rec;
              });
              for (let j = 0; j < tmp.length; j++) {
                fault.push(tmp[j]);
              }
              count++;
            }
          }
          this.resTableData = correct.concat(fault);

          this.showRes = true;
          this.graphBtn = true;

          // //原rawData删除已标记数据(rec中)
          // for(let i=rec.length-1;i>=0;i--){
          //   this.rawData.splice(rec[i],1);
          // }
          // //在头部添加新数据
          // for(let i=0;i<res.data[2].length;i++){
          //   this.rawData.unshift(res.data[2][i]);
          // }
          // //更新tableData
          // console.log(this.columnNames)
          // this.tableData = this.rawData.map((cur,index) => {
          //   let res={};
          //   res["index"] = index;
          //   res["negativeMark"] = null;
          //   for(let i = 0; i < this.columnNames.length-2; i ++)
          //     res[this.columnNames[i+2].prop] = cur[i]
          //   return res
          // });

          this.entityMark();
          this.loadingRes = false;
        })
        .catch(res => {
          //请求失败
          console.log(res);
          alert("请求失败！");
        });
    },
  },
  beforeDestroy() {
    if (myChart) {
      echarts.dispose(myChart);
    }
  },
  mounted() {
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
