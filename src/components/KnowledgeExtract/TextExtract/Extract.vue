<template>
  <el-container
    v-loading="fullscreenLoading"
    element-loading-text="正在处理中，请稍候……"
  >
    <!--内容块-->

    <!-- 上传窗口-->
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
          accept=".txt"
          action=""
          :limit="1"
          :on-remove="handleRemove"
          :on-change="handleAddFile"
          :file-list="uploadFileList"
          multiple
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">仅支持上传txt文件<br /></div>
        </el-upload>
        <el-button size="small" @click="cancelUpload">取消</el-button>
        <el-button
          style="margin-left: 10px"
          class="darkBtn"
          size="small"
          type="primary"
          @click="submitUpload"
        >上传</el-button>
      </el-card>
    </div>

    <!--测试结果-->
    <div class="upload" v-show="showResult">
      <el-card class="box-card">
        <div slot="header" class="clearfix" style="text-align: center">
          <span>测试结果</span>
          <i
            class="el-icon-close"
            style="float: right; padding: 3px 0"
            @click="showResult = false"
          ></i>
        </div>
        <div>
          <span style="font-weight: bold">实际实体数量：</span>{{ realEntityCount }}个
        </div>
        <div style="margin-top: 10px">
          <span style="font-weight: bold">抽取实体数量：</span>{{ extractEntityCount }}个
        </div>
        <div style="margin-top: 10px">
          <span style="font-weight: bold">错误识别实体数量：</span>{{ wrongEntityCount }}个
        </div>
        <div style="margin-top: 10px" id="autoPara">
          <span style="font-weight: bold">被标记文本：</span>
          <p id="para" style="text-align: left"></p>
        </div>
      </el-card>
    </div>

    <el-main v-if="isList">
      <!--顶部-->
      <div class="header">
        <i class="el-icon-back" v-if="!sourceFlag" @click="backToSource" style="margin-right:10px;"></i>
        文本抽取
        <!--<el-button type="primary" class="darkBtn headbutton" size="small" @click="isUpload=true">上传与分析</el-button>-->
        <!--<el-button type="primary" class="darkBtn headbutton" size="small" >训练</el-button>-->
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--      列表页-->
      <div class="main">
        <el-row class="top-tip" v-if="showTable == 1">
          <!--<span>请选择算法：</span>-->
          <!--<el-select-->
            <!--v-model="algorithm"-->
            <!--@change="changeAlgorithm"-->
            <!--placeholder-->
            <!--size="small"-->
            <!--style="margin-left: 10px"-->
          <!--&gt;-->
            <!--<el-option-->
              <!--v-for="(item, index) in algorithmList"-->
              <!--:key="index"-->
              <!--:label="item"-->
              <!--:value="item"-->
            <!--&gt;</el-option>-->
          <!--</el-select>-->

          <span v-if="showFlag === 1">请选择文书目录：</span>
          <el-select
            v-model="fileIndex"
            v-if="showFlag === 1"
            placeholder
            size="small"
            style="margin-left: 10px"
          >
            <el-option
              v-for="(item, index) in fileList"
              :key="index"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>

          <el-button
            style="margin-left: 20px"
            class="blueBtn"
            size="small"
            @click="chooseTable"
            v-if="showFlag === 1"
          >加载测试数据</el-button>
          <!-- <el-button
            class="darkBtn"
            size="small"
            style="float:right; margin-right:20px;"
            @click="showGraph"
          >图谱展示</el-button> -->


          <el-button
            size="small"
            class="darkBtn"
            style="float: right; margin: 0 20px 0 0"
            @click="extractEntityRelation"
            v-if="showFlag === 2"
          >抽取实体关系</el-button>
          <el-button
            class="darkBtn"
            size="small"
            style="float: right; margin: 0 20px 0 0"
            @click="extractEntityProperty"
            v-if="showFlag === 2"
          >抽取实体属性</el-button>
          <el-button
            class="darkBtn"
            size="small"
            style="float: right; margin: 0 20px 0 0"
            @click="isUpload = true"
            v-if="showFlag === 2"
          >上传文件</el-button>
          <el-button
            class="darkBtn"
            size="small"
            style="float:right;margin-right:20px"
            @click="checkAll"
            v-if="showFlag === 2"
          >全选</el-button>
        </el-row>
        <el-row class="top-tip" v-if="showTable == 1">
          <span style="margin-left: 0px" v-if="showFlag === 1">请选择训练模型：</span>
          <el-select
            v-model="modelIndex"
            v-if="showFlag === 1"
            placeholder
            size="small"
            style="margin-left: 10px;"
          >
            <el-option
              v-for="(item, index) in modelList"
              :key="index"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
          <el-button
            style="margin-left: 20px"
            class="blueBtn"
            size="small"
            @click="loadModel"
            v-if="showFlag === 1"
          >加载训练模型</el-button>
          <el-button
            type="primary"
            class="darkBtn"
            size="small"
            style="float: right; margin-right: 8px"
            v-if="showFlag === 1"
            @click="textExtract"
          >文本知识抽取</el-button>
          <el-button
            type="primary"
            class="darkBtn"
            size="small"
            style="float: right; margin-right: 8px"
            v-if="showFlag === 1"
            @click="showTestResult"
          >查看测试结果</el-button>
          <el-button
            class="darkBtn"
            size="small"
            style="float: right; margin-right: 8px"
            @click="calculateAverage"
            v-if="showFlag === 1 && isMerge"
            :disabled="calculateDis"
          >计算平均结果</el-button>
          <el-button
            class="darkBtn"
            size="small"
            style="float: right; margin-right: 8px"
            @click="mergeFile"
            v-if="showFlag === 1 && !isMerge"
          >合并</el-button>
          <el-button
            type="primary"
            class="darkBtn"
            size="small"
            style="float: right; margin-right: 8px"
            @click="modelTest"
            v-if="showFlag === 1"
          >模型测试</el-button>
          <el-button
            class="darkBtn"
            size="small"
            style="float:right;margin-right:8px"
            @click="checkAll1"
            :disabled="checkDis"
            v-if="showFlag === 1"
          >全选</el-button>
        </el-row>
        <div id="matchInfo" v-if="testData.length !== 0 && showTable == 1">
          <div>
            已有测试数据数量 : {{ testData.length }}
            <span v-if="showFlag ===1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;文书中实体总数：{{ entitySum }}个</span>
          </div>
          <span v-if="showFlag === 2">已选择的文件：</span>
          <span v-if="showFlag === 1">已选择的文件：</span>
          <span v-if="checkedTxt == true && numberStr != ''">全部文件</span> 
          <span ref="txt" v-if="checkedTxt == false && numberStr != ''"></span>
        </div>
        <!--文书列表-->
        <el-row
          v-loading="loadingRes"
          element-loading-text="正在加载中，请稍等……"
          element-loading-spinner="el-icon-loading"
        >
          <el-col :span="12">
            <el-table
              v-if="showTable == 1"
              class="table"
              :data="testData.slice((curPageTrain - 1) * 10, curPageTrain * 10)"
              :header-cell-style="{ background: '#EBEEF7', color: '#606266' }"
              height="626"
              style="width: 97%"
              border
              @cell-click="handleSelectionChange"
              ref="multipleTab"
            >
              <el-table-column prop="title" label="测试数据"></el-table-column>
              <el-table-column label="操作" width="160" align="center">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click.stop="handleAnalysis(scope.row)"
                    type="primary"
                    plain
                    size="small"
                  >浏览</el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-table
              v-if="showTable == 2"
              class="table"
              :data="testData.slice((curPageTrain - 1) * 10, curPageTrain * 10)"
              :header-cell-style="{ background: '#EBEEF7', color: '#606266' }"
              height="626"
              style="width: 97%"
              border
            >
              <el-table-column prop="title1" label="测试数据"></el-table-column>
              <el-table-column label="操作" width="160" align="center">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click.stop="handleAnalysis1(scope.row)"
                    type="primary"
                    plain
                    size="small"
                  >浏览</el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-table
              v-if="showTable == 3"
              class="table"
              :data="testData.slice((curPageTrain - 1) * 10, curPageTrain * 10)"
              :header-cell-style="{ background: '#EBEEF7', color: '#606266' }"
              height="626"
              style="width: 97%"
              border
            >
              <el-table-column prop="title2" label="测试数据"></el-table-column>
              <el-table-column label="操作" width="160" align="center">
                <template slot-scope="scope">
                  <el-button
                    class="blueBtn"
                    @click.stop="handleAnalysis2(scope.row)"
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
              layout="total, prev, pager, next, jumper"
              :total="fileCountTest"
              :current-page.sync="curPageTrain"
              @current-change="handleCurrentChangeTrain">
            </el-pagination>
            <!--</el-pagination> -->
          </el-col>
          <el-col
            :span="12"
            style="
              background-color: #fff;
              height: 625px;
              overflow-y: scroll;
              box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
            "
          >
            <div class="tableHeader">
              文件浏览
              <span v-if="isMerge">合并</span>
              <span v-if="textData === '' && !isMerge">(选择文件以浏览内容)</span>
              <span v-if="textData === '' && isMerge">(正在加载合并文件)</span>
            </div>
            <div style="padding: 0 15px;height: 100%;">
              <pre
                
                style="
                  word-break: break-word;
                  word-wrap: break-word;
                  white-space: break-spaces;
                "
                >{{ textData }}</pre>
                <div v-if="divStatus == 2 && !isMerge">
                  <div>
                    <span style="font-weight: bold">实际实体数量：</span>{{ realEntityCount }}个
                  </div>
                  <div style="margin-top: 10px">
                    <span style="font-weight: bold">抽取实体数量：</span>{{ extractEntityCount }}个
                  </div>
                  <div style="margin-top: 10px">
                    <span style="font-weight: bold">错误识别实体数量：</span>{{ wrongEntityCount }}个
                  </div>
                  <div style="margin-top: 10px" id="autoPara">
                    <span style="font-weight: bold">被标记文本：</span>
                    <p id="para1" style="text-align: left"></p>
                  </div>
                </div>
                <v-echart id="graph1" :style="{width: graphWidth,height:graphHeight}" :options="echartsOptions"></v-echart>
            </div>
            <!-- <el-table
              :data="testData.slice((curPageTest - 1) * 10, curPageTest * 10)"
              :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
              height="626"
              style="width:97%;"
              border>
              <el-table-column
                prop="title"
                label="测试数据">
              </el-table-column>
              <el-table-column
                label="操作"
                width="100"
                align="center">
                <template slot-scope="scope">
                  <el-button class="blueBtn" @click="handleAnalysis(scope.row)" type="primary" plain size="small">浏览</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              background
              layout="prev, pager, next, jumper"
              :total="fileCountTest"
              :current-page.sync="curPageTest"
              @current-change="handleCurrentChangeTest">
            </el-pagination>-->
          </el-col>
        </el-row>
      </div>

      <!--文书内容-->
      <!-- <el-dialog :title="selectTitle" :visible.sync="diaVisible">
          <pre style="word-break: break-word;word-wrap: break-word;white-space: break-spaces;">
            {{textData}}
          </pre>
      </el-dialog>-->
    </el-main>

    <!--图谱页-->
    <el-main v-show="!isList">
      <!--顶部-->
      <div class="header">
        <i class="el-icon-back" @click="isList = true"></i>
        <!--<el-button type="primary" class="headbutton" size="small" @click="handleExport">导出</el-button>-->
      </div>
      <el-divider></el-divider>
      <el-input
        v-model="inputEntity1"
        placeholder="实体1"
        style="width: 250px"
      ></el-input>
      <el-input
        v-model="inputRelation"
        placeholder="关系"
        style="width: 250px"
        v-if="entityRelationFlag"
      ></el-input>
      <el-input
        v-model="inputEntity2"
        placeholder="实体2"
        style="width: 250px"
        v-if="entityRelationFlag"
      ></el-input>
      <el-select v-model="level" placeholder="请选择查询级数">
        <el-option
          v-for="item in levelList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-button
        style="margin-left: 20px; height: 40px"
        class="darkBtn"
        size="small"
        @click="searchGraph"
      >搜索</el-button>
      <el-button
        type="text"
        class="textBtn"
        style="margin-left: 20px"
        v-if="entityRelationFlag"
        @click="changeToEntitySearch"
      >&lt; &lt;切换为实体搜索</el-button>
      <el-button
        type="text"
        class="textBtn"
        style="margin-left: 20px"
        v-if="!entityRelationFlag"
        @click="changeToRelationSearch"
      >&lt; &lt;切换为关系搜索</el-button>

      <!--中心-->
      <div
        class="main"
        id="daddy"
        v-loading="loadingResGraph"
        element-loading-text="正在加载中，请稍等……"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.2)"
      >
        <div
          id="graph"
          :style="{ width: graphWidth, height: graphHeight }"
        ></div>
      </div>
    </el-main>

    <!-- 弹框 -->
    <el-dialog title="实体属性抽取结果" :visible.sync="outerVisible" style="width:60%; margin-left:20%">
      <p style="width:100%;fontSize:15px;margin:-10px 0;textAlign:left;">
        <strong>
          总耗时：<i>{{this.resDataArr[0]}}</i>秒<br />
          实体属性抽取数量：<i>{{this.resDataArr[1]}}</i>条<br />
          实体属性抽取效率：<i>{{this.resDataArr[2]}}</i>条/秒<br />
        </strong>
      </p>
      <el-dialog
        width="40%"
        title="实体属性抽取结果（部分）"
        :visible.sync="innerVisible"
        append-to-body>
        <el-table
          :show-header="false"
          :data="innerDiaArr"
          style="width:100%;">
          <el-table-column prop="entity1"></el-table-column>
          <el-table-column prop="rel"></el-table-column>
          <el-table-column prop="entity2"></el-table-column>
        </el-table>
      </el-dialog>
      <div slot="footer" class="dialog-footer">
        <el-button @click="outerVisible = false">确 定</el-button>
        <el-button type="primary" @click="openInner">查看抽取结果</el-button>
      </div>
    </el-dialog>

    <el-dialog title="实体关系抽取结果" :visible.sync="outerVisible1" style="width:60%; margin-left:20%">
      <p style="width:100%;fontSize:15px;margin:-10px 0;textAlign:left;">
        <strong>
          总耗时：<i>{{this.resDataArr1[0]}}</i>秒<br />
          实体属性抽取数量：<i>{{this.resDataArr1[1]}}</i>条<br />
          实体属性抽取效率：<i>{{this.resDataArr1[2]}}</i>条/秒<br />
        </strong>
      </p>
      <el-dialog
        width="40%"
        title="实体关系抽取结果（部分）"
        :visible.sync="innerVisible1"
        append-to-body>
        <el-table
          :show-header="false"
          :data="innerDiaArr1"
          style="width:100%;">
          <el-table-column prop="entity1"></el-table-column>
          <el-table-column prop="rel"></el-table-column>
          <el-table-column prop="entity2"></el-table-column>
        </el-table>
      </el-dialog>
      <div slot="footer" class="dialog-footer">
        <el-button @click="outerVisible1 = false">确 定</el-button>
        <el-button type="primary" @click="openInner1">查看抽取结果</el-button>
      </div>
    </el-dialog>

  </el-container>
</template>

<script>
import { option } from "../../../js/echartSettings";
let echarts = require("echarts");
let myChart;

export default {
  name: "Extract",
  data() {
    return {
      //展示测试数据表
      showTable : 1,
      numberArr: [],
      numberStr: "",
      allnot: 0,
      //弹框
      outerVisible: false,
      innerVisible: false,
      resDataArr: [],
      innerDiaArr: [],
      outerVisible1: false,
      innerVisible1: false,
      resDataArr1: [],
      innerDiaArr1: [],
      //选择文件
      tableData: [],
      multipleSelection: [],
      checkedTxt: false,
      txtArr: [],
      entitySum: 0,
      checkDis: false,
      calculateDis: false,
      checkStatus: 0,
      sourceFlag: true,
      echartsOptions: {},
      showFlag: 1, //1时显示深度学习对应操作，2时显示正则表达式对应操作
      realEntityCount: 0,
      extractEntityCount: 1,
      wrongEntityCount: 2,
      showResult: false,
      divStatus: 1,
      isList: true,
      fileCount: 0,
      isUpload: false,
      curPage: 1,
      fileIndex: "",
      fileList: [
        "contents1",
        "contents2",
        "contents3",
        "contents4",
        "contents5",
      ],
      uploadFileList: [],
      //表格数据 测试集
      testData: [],
      testDataArr: [],
      // trainData: [],
      //选中行
      choosenRow: {},
      //三元组数据
      tripleData: [],
      algorithm: "",
      algorithmList: ["正则表达式", "深度学习算法"],
      //弹出框可视
      diaVisible: false,
      selectTitle: "",
      fileCountTest: 0, //total
      curPageTest: 1,
      curPageTrain: 1,
      fileCountTrain: 0,
      loadingRes: false,
      textData: "",
      fullscreenLoading: false,
      loadingResGraph: false,
      entityRelationFlag: true,
      inputEntity1: "",
      inputRelation: "",
      inputEntity2: "",
      level: 1,
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
      //计算平均召回率和准确率
      recallSet: [],
      accurateSet: [],
      //判断是否合并
      isMerge: false,
      //模型列表
      modelIndex: "",
      modelList: ["ckpt_1", "ckpt_2", "ckpt_3", "ckpt_4", "ckpt_5"],
      //图谱
      graphWidth: "100%",
      graphHeight: "100%",
    };
  },
  watch:{
    '$route'(to,from){
      this.testData = [];
      this.textData = "";
      this.fileCountTest = 0;
      this.curPageTest = 1;
      this.curPageTrain = 1;
      if(this.$route.query.algorithm) {
        this.showFlag = parseInt(this.$route.query.algorithm);
        if(this.showFlag===2) {
          this.loadAlgorithm();
          this.algorithm = "正则表达式";
        }
        else
          this.algorithm = "深度学习算法";
      }
      else
        this.showFlag = 1;
    }
  },
  mounted(){
    if(this.$route.query.algorithm) {
      this.showFlag = parseInt(this.$route.query.algorithm);
      if(this.showFlag===2) {
        this.loadAlgorithm();
        this.algorithm = "正则表达式";
      }
      else
        this.algorithm = "深度学习算法";
    }
    else
      this.showFlag = 1;
  },
  methods: {
    //查看测试结果
    showTestResult() {
      this.showTable = 2;
      this.testData = [];
      this.textData = "";
      this.fileIndex = "";
      this.isMerge = false;
      this.sourceFlag = false;
    },
    //返回按钮
    backToSource() {
      this.showTable = 1;
      this.divStatus = 1;
      this.textData = "";
      this.testData = [];
      this.fileIndex = "";
      this.modelIndex = "";
      this.numberStr = "";
      this.txtArr = [];
      this.sourceFlag = true;
    },
    //多选
    handleSelectionChange(val) {
      this.checkStatus = 1;
      if(this.checkDis == false) {
        this.checkedTxt = false;
        this.multipleSelection = val;
        this.numberStr = "";
        let arr = [];
  
        if(this.txtArr.length == 0) {
          this.txtArr.push(this.multipleSelection.title);
        }else {
          if(this.txtArr.indexOf(this.multipleSelection.title) == -1) {
            this.txtArr.push(this.multipleSelection.title);
          }else {
            this.txtArr.splice(this.txtArr.indexOf(this.multipleSelection.title), 1);
          }
        }
        arr.push(this.multipleSelection.title);
  
        this.numberStr = this.txtArr.toString();
        this.$nextTick(() => {
          this.$refs.txt.innerText = this.numberStr;
        })
      }else if(this.checkDis == true){
        return false
      }

    },
    //全选
    checkAll() {
      this.checkedTxt = true;
      this.numberStr = "";
      this.txtArr = [];
      this.numberStr = this.numberArr.toString();
      this.$message({
        message: '全选成功！',
        type: 'success'
      });
    },
    checkAll1() {
      this.checkedTxt = true;
      this.checkStatus = 0;
      // this.calculateDis = false;
      this.testData.forEach(item => {
        this.testDataArr.push(item.title);
      })
      this.numberStr = this.testDataArr.toString();
      this.$message({
        message: '全选成功！',
        type: 'success'
      });
    },
    //文本知识抽取
    textExtract() {
      this.showTable = 3;
      this.fullscreenLoading = true;
      let fd = new FormData();
      fd.append("contents", this.fileIndex);
      this.$http
        .post("http://39.102.71.123:23352/pic/text_extract", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(res => {
          this.fullscreenLoading = false;
          this.textData = "";
          this.testData = res.data.map(cur => {
            return { title2: cur };
          });
          this.numberStr = res.data.toString();
          this.fileCountTest = this.testData.length;
          this.sourceFlag = false; //返回按钮
        })
        .catch(error => {
          console.log(error);
          this.fullscreenLoading = false;
        })
    },
    loadAlgorithm() {
      if (this.showFlag === 2) {
        this.loadingRes = true;
        this.$http
          .post("http://39.102.71.123:23352/pic/loadTextDataRE", {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            this.numberArr = res.data;
            this.textData = "";
            this.testData = res.data.map((cur) => {
              return { title: cur };
            });
            this.fileCountTest = this.testData.length;
            this.loadingRes = false;
          })
          .catch((res) => {
            console.log(res);
            alert("出错了！");
            this.loadingRes = false;
          });
      }
    },
    calculateAverage() {
      if (this.recallSet.length === 0 && this.recallSet.length === 0) {
        this.$message({
          message: "请先对合并文件进行测试！",
          type: "warning",
        });
        return;
      }

      let recall = this.recallSet[0].num;
      let accurate = this.accurateSet[0].num;
      let strAccurate = "(" + this.accurateSet[0].num + "%";
      let strRecall = "(" + this.recallSet[0].num + "%";
      for (let i = 1; i < this.recallSet.length; i++) {
        recall += this.recallSet[i].num;
        accurate += this.accurateSet[i].num;
        strRecall += " + " + this.recallSet[i].num + "%";
        strAccurate += " + " + this.accurateSet[i].num + "%";
      }
      recall /= this.recallSet.length;
      accurate /= this.accurateSet.length;
      strRecall += ") / " + this.recallSet.length;
      strAccurate += ") / " + this.accurateSet.length;
      this.$alert(
        "<p><strong>当前实体抽取准确率<i> = " +
          strAccurate +
          " = " +
          accurate.toFixed(2) +
          "</i> %</strong></p>" +
          "<p><strong>当前实体抽取召回率<i> = " +
          strRecall +
          " = " +
          recall.toFixed(2) +
          "</i> %</strong></p>",
        "当前平均测试结果",
        {
          dangerouslyUseHTMLString: true,
        }
      );
    },
    highLight(sta, end, color, content,tooltip) {
      let str = content;
      return (content =//46
        str.slice(0, sta) +
        "<strong style='background:" + //26
        color +
        "' title='" +//9
        tooltip+
        "'>" +  //2
        str.slice(sta, end + 1) +
        "</strong>" +//9
        str.slice(end + 1));
    },
    //抽取实体关系
    extractEntityRelation() {
      this.fullscreenLoading = true;
      
      if(this.numberStr == "") {
        this.fullscreenLoading = false;
        this.$message.error('请先选择测试文件！');
      }else {
        let fd = new FormData();
        fd.append("filename", this.numberStr);
        this.$http
          .post("http://39.102.71.123:23352/pic/text_relation_speed", fd,{
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            console.log(res);
            this.fullscreenLoading = false;
            this.resDataArr1 = res.data;
            this.outerVisible1 = true;
            this.numberStr = "";
            this.txtArr = [];
            this.$nextTick(() => {
              this.$refs.txt.innerText = this.numberStr;
            })
            // this.$alert(
            //   "<p><strong>总耗时： <i>" +
            //     res.data[0] +
            //     "</i> 秒</strong></p>" +
            //     "<p><strong>实体关系抽取数量： <i>" +
            //     res.data[1] +
            //     "</i> 条</strong></p>" +
            //     "<p><strong>实体关系抽取效率： <i>" +
            //     res.data[2] +
            //     "</i>条/秒</strong></p>",
            //   "实体关系抽取结果",
            //   {
            //     dangerouslyUseHTMLString: true,
            //   }
            // ); 
          })
          .catch((res) => {
            console.log(res);
          });
      }
    },
    //抽取实体属性
    extractEntityProperty() {
      this.fullscreenLoading = true;
      let fd = new FormData();
      fd.append("filename", this.numberStr);
      this.$http
        .post("http://39.102.71.123:23352/pic/text_attribute_speed", fd,{
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res);
          this.fullscreenLoading = false;
          this.resDataArr = res.data;
          this.outerVisible = true;
          // this.$alert(
          //   "<p><strong>总耗时： <i>" +
          //     res.data[0] +
          //     "</i> 秒</strong></p>" +
          //     "<p><strong>实体属性抽取数量： <i>" +
          //     res.data[1] +
          //     "</i> 条</strong></p>" +
          //     "<p><strong>实体属性抽取效率： <i>" +
          //     res.data[2] +
          //     "</i>条/秒</strong></p>",
          //   "实体属性抽取结果",
          //   {
          //     dangerouslyUseHTMLString: true,
          //   }
          // );
        })
        .catch((res) => {
          console.log(res);
        });
    },
    openInner() {
      this.innerVisible = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/text_attribute_speed_res",{
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }).then((res) => {
          this.innerDiaArr = res.data.map(cur => {
            return {entity1: cur[0],rel:cur[1],entity2:cur[2]};
          });
        }).catch((res) => {
          console.log(res);
        })
    },
    openInner1() {
      this.innerVisible1 = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/text_relation_speed_res",{
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }).then((res) => {
          this.innerDiaArr1 = res.data.map(cur => {
            return {entity1: cur[0],rel:cur[1],entity2:cur[2]};
          });
        }).catch((res) => {
          console.log(res);
        })
    },
    //合并
    mergeFile() {
      if(this.numberStr != "") {
        this.checkDis = true;
        this.isMerge = true;
        this.fullscreenLoading = true;
        //判断单选还是多选
        if(this.checkStatus == 1) {
          this.calculateDis = true;
        }else if(this.checkStatus == 0) {
          this.calculateDis = false;
        }
        let fd = new FormData();
        fd.append("contents", this.fileIndex);
        fd.append("filelist", this.numberStr);
        fd.append("ALL_NOT", this.allnot.toString());
        this.$http
          .post("http://39.102.71.123:23352/pic/textMergeData", fd, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            this.textData = res.data;
            this.fullscreenLoading = false;
          })
          .catch((res) => {
            console.log(res);
            this.fullscreenLoading = false;
          });
      }else if(this.numberStr == "") {
        this.$message.error("请先选择数据！");
      }
    },
    changeToEntitySearch() {
      this.inputEntity1 = "";
      this.inputEntity2 = "";
      this.inputRelation = "";
      this.level = 1;
      this.entityRelationFlag = false;
    },
    changeToRelationSearch() {
      this.inputEntity1 = "";
      this.inputEntity2 = "";
      this.inputRelation = "";
      this.level = 1;
      this.entityRelationFlag = true;
    },
    showGraph() {
      this.isList = false;
      this.loadingResGraph = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/show_textTuple", {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res);
          this.initGraph(res);
          this.loadingResGraph = false;
        })
        .catch((res) => {
          //请求失败
          console.log(res);
          this.loadingResGraph = false;
        });
    },
    //在图谱中搜索
    searchGraph() {
      this.loadingResGraph = true;
      let fd = new FormData();
      fd.append("entity1", this.inputEntity1);
      fd.append("relation", this.inputRelation);
      fd.append("entity2", this.inputEntity2);
      fd.append("number", this.level);
      this.$http
        .post("http://39.102.71.123:23352/pic/searchTextData", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res);
          if (
            res.data[1].length === 0 &&
            res.data[2].length === 0 &&
            res.data[0].length === 0
          ) {
            this.$message({
              message: "未查询到相关信息！",
              type: "warning",
            });
          }
          this.initGraph(res);
          this.loadingResGraph = false;
        })
        .catch((res) => {
          //请求失败
          console.log(res);
          this.loadingResGraph = false;
        });
    },
    initGraph(res) {
      let graphPoint = [];
      let graphLink = [];
      let pointName = new Set();
      let order = [0, 1, 2];
      for (let j of order) {
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
                category: j,
              });
            } else {
              graphPoint.push({
                name: tmp.entity1,
                category: 1,
              });
            }
          }
          if (!pointName.has(tmp.entity2)) {
            pointName.add(tmp.entity2);
            graphPoint.push({
              name: tmp.entity2,
              category: j,
            });
          }
          graphLink.push({
            source: tmp.entity1,
            target: tmp.entity2,
            name: tmp.relation,
            des: tmp.relation,
          });
        }
      }
      let Myoption = JSON.parse(JSON.stringify(option));
      Myoption["series"][0]["data"] = graphPoint;
      Myoption["series"][0]["links"] = graphLink;
      Myoption["series"][0]["edgeLabel"]["normal"]["formatter"] = function (x) {
        return x.data.name;
      };

      myChart = echarts.init(document.getElementById("graph"));
      // 绘制图表
      myChart.setOption(Myoption, true);
    },
    //模型测试
    modelTest() {
      this.fullscreenLoading = true;
      let fd = new FormData();
      fd.append("contents", this.fileIndex);
      if (this.isMerge) {
        this.$http
          .post("http://39.102.71.123:23352/pic/textTestALL", fd, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            this.fullscreenLoading = false;
            if (this.recallSet.length === 0)
              this.recallSet.push({
                index: this.fileIndex,
                num: res.data[1],
              });
            for (let i = 0; i < this.recallSet.length; i++) {
              if (this.recallSet[i].index === this.fileIndex) break;
              else if (
                i === this.recallSet.length - 1 &&
                this.recallSet[i].index !== this.fileIndex
              ) {
                this.recallSet.push({
                  index: this.fileIndex,
                  num: res.data[1],
                });
              }
            }
            if (this.accurateSet.length === 0)
              this.accurateSet.push({
                index: this.fileIndex,
                num: res.data[0],
              });
            for (let i = 0; i < this.accurateSet.length; i++) {
              if (this.accurateSet[i].index === this.fileIndex) break;
              else if (
                i === this.accurateSet.length - 1 &&
                this.accurateSet[i].index !== this.fileIndex
              ) {
                this.accurateSet.push({
                  index: this.fileIndex,
                  num: res.data[0],
                });
              }
            }

            this.$alert(
              "<p><strong>实际实体数量： <i>" +
                res.data[4] +
                "</i> 个</strong></p>" +
                "<p><strong>抽取实体数量： <i>" +
                res.data[3] +
                "</i> 个</strong></p>" +
                "<p><strong>正确抽取实体数量： <i>" +
                res.data[2] +
                "</i> 个</strong></p>" +
                "<p><strong>实体抽取准确率： <i>" +
                res.data[2] +
                "/" +
                res.data[3] +
                "=" +
                res.data[0] +
                "</i> %</strong></p>" +
                "<p><strong>实体抽取召回率： <i>" +
                res.data[2] +
                "/" +
                res.data[4] +
                "=" +
                res.data[1] +
                "</i> %</strong></p>",
              this.algorithm + "合并测试结果",
              {
                dangerouslyUseHTMLString: true,
              }
            );
          })
          .catch((res) => {
            console.log(res);
          });
      } else {
        if (this.selectTitle === "") {
          this.$message({
            message: "请先查看文书！",
            type: "warning",
          });
          this.fullscreenLoading = false;
          return;
        }

        fd.append("filename", this.selectTitle);
        this.$http
          .post("http://39.102.71.123:23352/pic/textTestDemo", fd, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            console.log("else res.data",res.data);
            this.fullscreenLoading = false;
            let content = res.data[0];
            // let div = document.createElement("p");
            // div.id = "para";
            let tagSet = [];
            for (let i = 1; i < 4; i++) {
              //遍历所有标记
              for (let j = 0; j < res.data[i].length; j++) {
                tagSet.push({
                  sta: res.data[i][j][1],
                  end: res.data[i][j][2],
                  type: i,
                  tooltip:res.data[i][j][3],
                });
              }
            }
            //排序
            tagSet = [].concat(
              tagSet.sort((obj1, obj2) => {
                if (obj1.sta >= obj2.sta) return 1;
                else return -1;
              })
            );
            console.log(tagSet);
            //高亮
            let offset = 0;
            for (let i = 0; i < tagSet.length; i++) {
              if (tagSet[i].type === 1) {
                content = this.highLight(
                  tagSet[i].sta + offset,
                  tagSet[i].end + offset,
                  "green",
                  content,
                  tagSet[i].tooltip,
                );
                offset += 51+tagSet[i].tooltip.length;
              } else if (tagSet[i].type === 2) {
                content = this.highLight(
                  tagSet[i].sta + offset,
                  tagSet[i].end + offset,
                  "red",
                  content,
                  tagSet[i].tooltip,
                );
                offset += 49+tagSet[i].tooltip.length;
              } else if (tagSet[i].type === 3) {
                content = this.highLight(
                  tagSet[i].sta + offset,
                  tagSet[i].end + offset,
                  "yellow",
                  content,
                  tagSet[i].tooltip,
                );
                offset += 52+tagSet[i].tooltip.length;
              }
            }
            // //37+color位移
            // for(let i=0;i<res.data[1].length;i++){
            //   content=this.highLight(res.data[1][i][1]+42*i,res.data[1][i][2]+42*i,"green",content);
            // }
            // let offset1=42*res.data[1].length;
            // for(let j=0;j<res.data[2].length;j++){
            //   content=this.highLight(res.data[2][j][1]+offset1+40*j,res.data[2][j][2]+offset1+40*j,"red",content);
            // }
            // let offset2 = offset1+40*res.data[2].length;
            // for(let k=0;k<res.data[3].length;k++){
            //   content=this.highLight(res.data[3][k][1]+offset2+43*k,res.data[3][k][2]+offset2+43*k,"yellow",content);
            // }
            let div = document.getElementById("para");
            div.innerHTML = content.replace(/\n/g, "<br>");
            // div.style = "text-align:left";
            // document.getElementById("autoPara").appendChild(div);
            this.realEntityCount = res.data[4];
            this.extractEntityCount = res.data[5];
            this.wrongEntityCount = res.data[6];

            this.showResult = true;
          })
          .catch((res) => {
            console.log(res);
            this.fullscreenLoading = false;
          });
      }
    },
    //选择文件集 加载测试数据
    chooseTable() {
      this.loadingRes = true;
      if(this.showTable == 1) {
        this.numberStr = "";
        this.txtArr = [];
        this.textData = "";
        this.fileCountTest = 0;
        this.checkDis = false;
        this.isMerge = false;
        let fd = new FormData();
        fd.append("contents", this.fileIndex);
        this.$http
          .post("http://39.102.71.123:23352/pic/loadTextDataDL", fd, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            this.textData = "";
            this.testData = res.data[0].map((cur) => {
              return { title: cur };
            });
            this.fileCountTest = this.testData.length;
            this.entitySum = res.data[1];
            this.loadingRes = false;
          })
          .catch((res) => {
            console.log(res);
            alert("出错了！");
            this.loadingRes = false;
          });
      }else if(this.showTable == 2) {
        let fd = new FormData();
        fd.append("contents", this.fileIndex);
        this.$http
          .post("http://39.102.71.123:23352/pic/text_test_results_1", fd, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then(res => {
            this.textData = "";
            this.testData = res.data.map((cur) => {
              return { title1: cur };
            });
            this.numberStr = res.data.toString();
            this.fileCountTest = this.testData.length;
            this.entitySum = res.data[1];
            this.loadingRes = false;
          })
          .catch(error => {
            this.loadingRes = false;
            console.log(error)
          })
      }
    },
    loadModel() {
      let fd = new FormData();
      fd.append("model", this.modelIndex);
      this.$http
        .post("http://39.102.71.123:23352/pic/loadModel", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res);
          this.$message({
            message: "加载模型" + this.modelIndex + "成功！",
            type: "success",
          });
        })
        .catch((res) => {
          console.log(res);
          alert("出错了！");
        });
    },
    cancelUpload() {
      this.isUpload = false;
      this.uploadFileList = [];
    },
    submitUpload() {
      if (!this.uploadFileList.length) {
        this.$message.error("请选择上传文件！");
        return;
      }
      // this.$refs.upload.submit();

      if (this.showFlag === 1) {
        //深度学习
      }
      if (this.showFlag === 2) {
        //正则
      }
      for (let i = 0; i < this.uploadFileList.length; i++) {
        for (let j = 0; j < this.testData.length; j++) {
          if (this.testData[j].title === this.uploadFileList[i]) {
            this.$message.error("该文件已存在，请选择其他文件！");
            return;
          }
        }
        // console.log(this.uploadFileList)
      }

      let fd = new FormData();
      fd.append("text", this.uploadFileList[0].raw);
      this.$http
        .post("http://39.102.71.123:23352/pic/submit_RE_data", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res);
          if (res.data === 1) {
            // this.getTable();
            this.loadAlgorithm();
          } else {
            this.$message.error("上传失败！");
          }
        })
        .catch((res) => {
          console.log(res);
        });
      console.log(this.uploadFileList);

      this.isUpload = false;
      this.uploadFileList = [];
    },
    handleRemove(file, uploadFileList) {
      this.uploadFileList = uploadFileList;
    },
    handleAddFile(file, uploadFileList) {
      this.uploadFileList = uploadFileList;
    },
    handleCurrentChangeTest(cpage) {
      this.curPageTest = cpage;
    },
    //分页符
    handleCurrentChangeTrain(cpage) {
      this.curPageTrain = cpage;
    },
    //查看文书内容 浏览
    handleAnalysis(row) {
      this.selectTitle = row.title;
      let fd = new FormData();
      let url = "";
      if (this.showFlag===1) {
        url = "viewTextDL";
        fd.append("contents", this.fileIndex);
      } else url = "viewTextDataRE";
      fd.append("filename", row.title);

      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/pic/" + url, fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          // console.log(JSON.stringify(res.data));
          this.textData = res.data;
          this.loadingRes = false;
        })
        .catch((res) => {
          console.log(res);
          this.loadingRes = false;
        });
      this.diaVisible = true;
    },
    //浏览
    handleAnalysis1(row) {
      this.divStatus = 2;
      this.fullscreenLoading = true;
      let fd = new FormData();
      fd.append("contents", this.fileIndex);
      fd.append("filename", row.title1);
       this.$http
        .post("http://39.102.71.123:23352/pic/text_test_results_2", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(res => {
          this.fullscreenLoading = false;
          let content = res.data[0];
          let tagSet = [];
          for (let i = 1; i < 4; i++) {
            //遍历所有标记
            for (let j = 0; j < res.data[i].length; j++) {
              tagSet.push({
                sta: res.data[i][j][1],
                end: res.data[i][j][2],
                type: i,
                tooltip:res.data[i][j][3],
              });
            }
          }
          //排序
          tagSet = [].concat(
            tagSet.sort((obj1, obj2) => {
              if (obj1.sta >= obj2.sta) return 1;
              else return -1;
            })
          );
          //高亮
          let offset = 0;
          for (let i = 0; i < tagSet.length; i++) {
            if (tagSet[i].type === 1) {
              content = this.highLight(
                tagSet[i].sta + offset,
                tagSet[i].end + offset,
                "green",
                content,
                tagSet[i].tooltip,
              );
              offset += 51+tagSet[i].tooltip.length;
            } else if (tagSet[i].type === 2) {
              content = this.highLight(
                tagSet[i].sta + offset,
                tagSet[i].end + offset,
                "red",
                content,
                tagSet[i].tooltip,
              );
              offset += 49+tagSet[i].tooltip.length;
            } else if (tagSet[i].type === 3) {
              content = this.highLight(
                tagSet[i].sta + offset,
                tagSet[i].end + offset,
                "yellow",
                content,
                tagSet[i].tooltip,
              );
              offset += 52+tagSet[i].tooltip.length;
            }
          }
            let div = document.getElementById("para1");
            div.innerHTML = content.replace(/\n/g, "<br>");
            this.realEntityCount = res.data[4];
            this.extractEntityCount = res.data[5];
            this.wrongEntityCount = res.data[6];
        })
        .catch(error => {
          console.log(error)
        })
    },
    handleAnalysis2(row) {
      this.fullscreenLoading = true;
      let fd = new FormData();
      fd.append("contents", this.fileIndex);
      fd.append("filename", row.title2);
      this.$http
        .post("http://39.102.71.123:23352/pic/view_text_extract_results", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(res => {
          this.fullscreenLoading = false;
          console.log("res",res);

          let categories = [
            {
              name: " ",
              symbol: "rect",
              itemStyle: { color: "white" }
            },
            {
              name: "实体",
              symbol: "circle",
              itemStyle: { color: "#f47920" }
            },
            {
              name: "属性",
              symbol: "roundRect",
              itemStyle: { color: "#749f83" }
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
        })
        .catch(error => {
          this.fullscreenLoading = false;
          console.log(error);
        })
    },
    //导出三元组
    handleExport() {
      //处理数据
      let data = "";
      this.tripleData.forEach(function (item, index) {
        data += item.source + "," + item.name + "," + item.target + "\n";
      });
      let filename = this.choosenRow.title.split(".")[0];
      console.log(filename);
      //创建<a>下载文件
      let export_blob = new Blob([data], {
        type: "text/csv",
        endings: "native",
      });
      let save_link = document.createElement("a");
      save_link.href = URL.createObjectURL(export_blob);
      save_link.download = filename + ".csv";
      save_link.click();
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
  margin-right: 40px;
}
.top-tip {
  margin-top: -10px;
  margin-bottom: 20px;
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
#daddy {
  height: 800px;
  width: 100%;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  background-color: #fff;
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
  top: 10%;
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
.el-card {
  text-align: left;
}
.el-card__body {
  text-align: left;
}
</style>
