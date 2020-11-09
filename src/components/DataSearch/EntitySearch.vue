<template>
  <el-container>
    <div
      v-loading.fullscreen.lock="loadingRes"
      element-loading-text="正在查询中，请稍等……"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
    ></div>
    <!--内容块-->
    <el-main>
      <!--顶部-->
      <div class="header">实体检索</div>
      <el-divider></el-divider>
      <!--中心-->
      <!--列表页-->
      <div class="main">
        <!--搜索栏-->
        <el-input v-model="inputEntity" placeholder="请输入实体名称"></el-input>
        <el-select v-model="level" placeholder="请选择查询级数">
          <el-option
            v-for="item in levelList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
        <el-button
          style="margin-left:20px; height: 40px"
          class="darkBtn"
          size="small"
          @click="onSearchClick"
        >搜索</el-button>
        <!-- <el-button
          type="text"
          @click="showQuerySpeed"
          style="float:right; margin-right:40px;"
          class="textBtn"
        >测试查询效率>></el-button> -->
        <div style="margin-left:10px; margin-bottom:20px; margin-top:10px;">
          <!-- <span>现有正样例：{{positiveCount}}个</span> -->
          <div id="searchInfo">
            实体数据容量 : {{tupleNum}}个
            <span style="float:right; margin-right:20px;">查询时间：{{searchTime}}秒</span>
          </div>
        </div>
        <div class="result" v-if="searchDone">
          <!--关系图谱-->
          <div
            id="kgPic"
            v-loading="loadingRes"
            element-loading-text="正在搜索中，请稍等……"
            element-loading-spinner="el-icon-loading"
          >
            <div class="title">关系图谱</div>
            <div id="graph" :style="{width: graphWidth,height:graphHeight}"></div>
          </div>
          <!--三元组列表-->
          <el-table
            :data="tableData"
            :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
            :height="60+50*tableData.length"
            border
            v-loading="loadingRes"
          >
            <el-table-column prop="entity1" label="实体1" fixed></el-table-column>
            <el-table-column prop="relation" label="关系"></el-table-column>
            <el-table-column prop="entity2" label="实体2"></el-table-column>
          </el-table>
          <!-- 分页符-->
          <!-- <el-pagination
            background
            layout="prev, pager, next"
            :total="fileCount"
            @current-change="handleCurrentChange">
          </el-pagination>-->
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
let echarts = require("echarts");
let myChart;
import { option } from "../../js/echartSettings";

export default {
  name: "KnowledgeSearch",
  data() {
    return {
      loadingRes:false,
      //表格数据
      tableData: [],
      searchDone: false,
      inputEntity: "",
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
      searchTime: "",
      tupleNum: 0,
      graphWidth:"100%",
      graphHeight:"100%",
    };
  },

  methods: {
    showQuerySpeed() {
      this.loadingRes = true;
      this.$http
        .post("http://39.102.71.123:23352/neo/entity_search_speed", {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => {
          console.log(res)
          this.loadingRes = false;
          this.$alert(
            "<p><strong>数据库中三元组个数： <i>" + res.data[0] + "</i> 个</strong></p>" +
            "<p><strong>检索实体个数： <i>" + res.data[1] + "</i> 个</strong></p>" +
            "<p><strong>检索一共耗时： <i>" + res.data[2] + "</i> 秒</strong></p>" +
            "<p><strong>平均检索响应时间： <i>" + res.data[3] + "</i> 秒</strong></p>",
            "模型测试结果",
            {
              dangerouslyUseHTMLString: true
            }
          );
        }).catch(res => {
          console.log(res)
          this.loadingRes = false;
          alert("出错了！")
        })
    },
    onSearchClick() {
      if (this.inputEntity === "" && !this.searchDone) {
        return;
      }

      this.searchDone = true;
      let Myoption = JSON.parse(JSON.stringify(option));
      this.loadingRes = true;

      //空值检索
      if (this.inputEntity === "") {
        myChart = echarts.init(document.getElementById("graph"));
        // 绘制图表
        myChart.setOption(Myoption, true);
        this.tableData = [];
        this.loadingRes = false;
        return;
      }

      let fd = new FormData();
      fd.append("entity1", this.inputEntity);
      fd.append("entity2", "");
      fd.append("relation", "");
      fd.append("number", this.level);
      this.$http
        .post("http://39.102.71.123:23352/neo/search_entity", fd)
        .then(res => {
          console.log(res.data);
          if (
            res.data[0][1].length === 0 &&
            res.data[0][2].length === 0 &&
            res.data[0][0].length === 0
          ) {
            this.$message({
              message: '未查询到相关信息！',
              type: 'warning'});
            this.loadingRes = false;
            return;
          }
          this.tableData = [];
          // let graphPoint=[{name:this.inputEntity,category:0}];
          // let graphLink=[];
          // //遍历关系
          // for(let i=0;i<res.data.entityRelation.length;i++)
          // {
          //   let tmp={};//表格中一行
          //   let tmpLink={};//关系图中的连线
          //   tmp.entity1=res.data.entityRelation[i].n1.title;
          //   tmp.relationship=res.data.entityRelation[i].rel.type;
          //   tmp.entity2=res.data.entityRelation[i].n2.title;
          //   //重名
          //   if(tmp.entity2 === this.inputEntity) continue;
          //
          //   tmpLink.source=tmp.entity1;
          //   tmpLink.target=tmp.entity2;
          //   tmpLink.name=tmp.relationship;
          //   tmpLink.des=this.inputEntity+"->"+tmp.entity2;
          //   this.tableData.push(tmp);
          //   graphLink.push(tmpLink);
          //   //去除重复节点
          //   for(let k =0;k<graphPoint.length;k++)
          //   {
          //     if(tmp.entity2===graphPoint[k].name)
          //       break;
          //     else if (k===graphPoint.length-1)
          //     {
          //       graphPoint.push({name:tmp.entity2,category:1,des:tmp.entity2});
          //       break;
          //     }
          //   }
          // }

          let graphPoint = [];
          let graphLink = [];
          let pointName = new Set();
          this.tableData = [];
          let targetType=0;
          let order = [0, 1, 2];
          for (let j of order){
            for (let i = 0; i < res.data[0][j].length; i++) {
              let tmp = {};
              tmp.entity1 = res.data[0][j][i][0]+"";
              tmp.relation = res.data[0][j][i][1]+"";
              tmp.entity2 = res.data[0][j][i][2]+"";
              if (!pointName.has(tmp.entity1)) {
                pointName.add(tmp.entity1);
                if (tmp.entity1 === this.inputEntity) {
                  targetType = 2 * j;
                  graphPoint.push({
                    name: tmp.entity1,
                    category: 3
                  });
                } else if (j !== 2) {
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
                if (tmp.entity2 === this.inputEntity) {
                  targetType = 2 * j + 1;
                  graphPoint.push({
                    name: tmp.entity2,
                    category: 3
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
                // label:{
                //   show:true,
                //   formatter: function (x) {
                //     return x.data.name;
                //   },
                // }
              });
              this.tableData.push({
                entity1: tmp.entity1,
                entity2: tmp.entity2,
                relation: tmp.relation
              });
            }
          }

          if (targetType === 0 || targetType === 1)
            Myoption["series"][0]["categories"].push({
              name: "检索目标",
              symbol: "rect",
              symbolSize: 60
            });
          else if (targetType < 5)
            Myoption["series"][0]["categories"].push({
              name: "检索目标",
              symbol: "circle",
              symbolSize: 60
            });
          else
            Myoption["series"][0]["categories"].push({
              name: "检索目标",
              symbol: "roundRect",
              symbolSize: 60
            });
          Myoption["legend"] = [];
          Myoption["legend"].push({
            data: Myoption["series"][0]["categories"].map(function(a) {
              return { name: a.name, icon: a.symbol };
            })
          });
          Myoption["series"][0]["data"] = graphPoint;
          Myoption["series"][0]["links"] = graphLink;
          Myoption["series"][0]["edgeLabel"]["normal"]["formatter"] = function(
            x
          ) {
            return x.data.name;
          };

          myChart = echarts.init(document.getElementById("graph"));
          // 绘制图表
          myChart.setOption(Myoption, true);

          this.searchTime = res.data[1];
          this.tupleNum = res.data[2];

          myChart.on("click", function(params) {
            let obj = params.data;
            console.log(obj);
            if (obj.hasOwnProperty("source")) {
              //links
              ////obj.source+obj.name+obj.target 头节点、关系、尾节点
              // this.$http.get('http://39.102.71.123:23352/search_entity?head='+obj.source+"&relation="+obj.name+"&tail="+obj.target).then(
              //   (res) => {
              //   })
              alert("1");
            } //points
            else {
              ////实体名为obj.name
              // this.$http.get('http://39.102.71.123:23352/search_entity?entity='+obj.name).then((res) => {
              // })
              alert("2");
            }
          });
          this.loadingRes = false;
        })
        .catch(res => {
          this.loadingRes = false;
          console.log("fail");
          console.log(res);
          let option = {};
          myChart = echarts.init(document.getElementById("graph"));
          // 绘制图表
          myChart.setOption(option, true);
          this.tableData = [];
          return;
        });
    }
  },
  mounted(){
    this.$http.post("http://39.102.71.123:23352/neo/start_KGSearch")
      .then(res => {
        this.tupleNum = res.data[0];
        this.searchTime = res.data[1];
      }).catch((res)=>{
        console.log(res)
    })
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
/*************内容中心*************/
.main {
  line-height: 30px;
  height: 90%;
  width: 100%;
}
#searchInfo {
  background-color: #f0f9eb;
  color: #67c23a;
  padding: 8px 16px;
  width: 95%;
  padding: 8px 16px;
  border-radius: 10px;
  margin: 0 0 15px -10px;
  font-size: 13px;
}

/*搜索栏*/
.el-input {
  width: 400px;
}

/*关系图*/
#kgPic {
  height: 800px;
  width: 100%;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  background-color: #fff;
}
.title {
  line-height: 55px;
  background-color: #e9eef3;
  color: #606266;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  padding: 0 10px;
  font-weight: bold;
}

/*表格*/
.el-table {
  height: 80%;
  width: 100%;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}
/*分页符*/
.el-pagination {
  right: 60px;
  height: 10%;
  text-align: right;
  margin-top: 10px;
  margin-bottom: 20px;
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
  border: 1px solid #5775fb;
  color: #5775fb;
}

.blueBtn:hover,
.blueBtn:active {
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
.textBtn {
  color: #606266;
  text-decoration: underline;
}

.textBtn:hover {
  color: #7c7c7c;
}
</style>
