<template>
  <el-container>
    <!--内容块-->
    <el-main>
      <!--顶部-->
      <div class="header">
        关系检索
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <!--列表页-->
      <div class="main" >
        <!--搜索栏-->
        <el-input v-model="inputEntity1" placeholder="实体1"></el-input>
        <el-input v-model="inputRelation" placeholder="关系"></el-input>
        <el-input v-model="inputEntity2" placeholder="实体2"></el-input>
        <el-select v-model="level" placeholder="请选择查询级数">
          <el-option
            v-for="item in levelList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button style="margin-left:20px;height: 40px" class="darkBtn" size="small" @click="onSearchClick">搜索</el-button>
        <div v-if="searchDone" style="margin-left:10px; margin-bottom:20px; margin-top:10px;">
          <!-- <span>现有正样例：{{positiveCount}}个</span> -->
          <div id="searchInfo">
            实体数据容量 : {{tupleNum}}个
            <span style="float:right; margin-right:20px;">查询时间：{{searchTime}}秒</span>
          </div>
        </div>
        <div class="result" v-if="searchDone" style="margin-bottom:50px;">
          <!--关系图谱-->
          <div id="kgPic"
               v-loading="loadingRes"
               element-loading-text="正在搜索中，请稍等……"
               element-loading-spinner="el-icon-loading"
               element-loading-background="rgba(0, 0, 0, 0.1)">
            <div class="title">关系图谱</div>
            <div id="graph" :style="{width: graphWidth,height:graphHeight}"></div>
          </div>
          <!--三元组列表-->
          <el-table
            :data="tableData"
            :header-cell-style="{background:'#EBEEF7',color:'#606266'}"
            height="626"
            border
            v-loading="loadingRes">
            <el-table-column
              prop="entity1"
              label="实体1"
              fixed>
            </el-table-column>
            <el-table-column
              prop="relation"
              label="关系">
            </el-table-column>
            <el-table-column
              prop="entity2"
              label="实体2">
            </el-table-column>
          </el-table>
          <!-- 分页符
          <el-pagination
            background
            layout="prev, pager, next"
            :total="fileCount"
            @current-change="handleCurrentChange">
          </el-pagination> -->
        </div>
      </div>
    </el-main>
  </el-container>

</template>

<script>
	let echarts = require('echarts');
	let myChart;
  import { option } from "../../js/echartSettings";

    export default {
        name: "RelationSearch",
      data(){
        return{
          // fileCount:0,
          // curPage:1,
          //表格数据
          tableData: [],
          searchDone:false,
          inputEntity1:'',
          inputEntity2:'',
          inputRelation:'',
          levelList:[{
            label:"一级查询",
            value:1
          },{
            label:"二级查询",
            value:2
          },{
            label:"三级查询",
            value:3
          }],
          level:1,
          loadingRes:false,
          searchTime:"",
          tupleNum:0,
          //图谱
          graphWidth:"100%",
          graphHeight:"100%",
        }
      },

      methods:{

        onSearchClick(){
          if(this.inputEntity1 === '' && this.inputEntity2 === '' && this.inputRelation === '' && !this.searchDone)
          {
            return;
          }
          this.searchDone=true;
          this.loadingRes=true;
          let Myoption = JSON.parse(JSON.stringify(option));
          //空值检索
          if(this.inputEntity1 === '' && this.inputEntity2 === '' && this.inputRelation === '')
          {
            myChart= echarts.init(document.getElementById('kgPic'));
            // 绘制图表
            myChart.setOption(Myoption, true);
            this.tableData = [];
            this.loadingRes=false;
            return;
          }
          /*逻辑和实体检索类似*/
          let fd = new FormData();
          fd.append("entity1",this.inputEntity1);
          fd.append("entity2",this.inputEntity2);
          fd.append("relation",this.inputRelation);
          fd.append("number",this.level);
          this.$http.post('http://10.4.20.119:8000/neo/search_relation',fd).then((res) =>
            {
              console.log(res);
              if(res.data[0][1].length === 0&&res.data[0][2].length === 0&&res.data[0][0].length === 0){
                this.$message({
                  message: '未查询到相关信息！',
                  type: 'warning'
                });
                this.loadingRes=false;
                return;
              }
              let graphPoint = [];
              let graphLink = [];
              let pointName = new Set();
              this.tableData = [];
              let targetType1,targetType2;
              let order = [0, 1, 2];
              for (let j of order){
                for (let i = 0; i < res.data[0][j].length; i++) {
                  let tmp = {};
                  tmp.entity1 = res.data[0][j][i][0]+"";
                  tmp.relation = res.data[0][j][i][1]+"";
                  tmp.entity2 = res.data[0][j][i][2]+"";
                  if (!pointName.has(tmp.entity1)) {
                    pointName.add(tmp.entity1);
                    if(tmp.entity1===this.inputEntity1){
                      targetType1=2*j;
                      graphPoint.push({
                        name: tmp.entity1,
                        category: 3
                      });
                    }
                    else if(tmp.entity1===this.inputEntity2){
                      targetType2=2*j;
                      graphPoint.push({
                        name: tmp.entity1,
                        category: 4
                      });
                    }
                    else if(j !== 2) {
                      graphPoint.push({
                        name: tmp.entity1,
                        category: j
                      });
                    }
                    else{
                      graphPoint.push({
                        name: tmp.entity1,
                        category: 1
                      });
                    }
                  }
                  if (!pointName.has(tmp.entity2)) {
                    pointName.add(tmp.entity2);
                    if(tmp.entity2===this.inputEntity1){
                      targetType1=2*j+1;
                      graphPoint.push({
                        name: tmp.entity2,
                        category: 3
                      });
                    }
                    else if(tmp.entity2===this.inputEntity2){
                      targetType2=2*j+1;
                      graphPoint.push({
                        name: tmp.entity2,
                        category: 4
                      });
                    }
                    else {
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
                  this.tableData.push({
                    entity1:tmp.entity1,
                    entity2:tmp.entity2,
                    relation:tmp.relation,
                  })
                }
              }
              if(targetType1===0||targetType1===1)
                Myoption["series"][0]["categories"].push({
                  name: "检索目标1",
                  symbol: "rect",
                  symbolSize:60
                });
              else if(targetType1<5)
                Myoption["series"][0]["categories"].push({
                  name: "检索目标1",
                  symbol: "circle",
                  symbolSize:60
                });
              else
                Myoption["series"][0]["categories"].push({
                  name: "检索目标1",
                  symbol: "roundRect",
                  symbolSize:60
                });
              if(targetType2===0||targetType2===1)
                Myoption["series"][0]["categories"].push({
                  name: "检索目标2",
                  symbol: "rect",
                  symbolSize:60
                });
              else if(targetType2<5)
                Myoption["series"][0]["categories"].push({
                  name: "检索目标2",
                  symbol: "circle",
                  symbolSize:60
                });
              else
                Myoption["series"][0]["categories"].push({
                  name: "检索目标2",
                  symbol: "roundRect",
                  symbolSize:60
                });
              Myoption["legend"] = [];
              Myoption["legend"].push({
                data: Myoption["series"][0]["categories"].map(function (a) {
                  return {name:a.name,icon:a.symbol}
                })
              });
              Myoption["series"][0]["data"] = graphPoint;
              Myoption["series"][0]["links"] = graphLink;
              Myoption["series"][0]["edgeLabel"]["normal"]["formatter"] = function (x) {
                return x.data.name;
              };

              myChart = echarts.init(document.getElementById("graph"));
              // 绘制图表
              myChart.setOption(Myoption, true);

              this.searchTime=res.data[1];
              this.tupleNum = res.data[2];

		        	// let graphPoint = [];
			// let graphLink = [];
			// let pointSet = new Set();
			// for(let i = 0; i < res.data.searchResult.length; i ++){
			// 	let tmp = {};
			// 	let tableflag = 0;
			// 	tmp.entity1 = res.data.searchResult[i].n1.title;
			// 	tmp.entity2 = res.data.searchResult[i].n2.title;
			// 	tmp.relation = res.data.searchResult[i].rel.type;
          //
			// 	for(let j = 0; j < this.tableData.length; j++ ){
			// 		if(this.tableData[j].entity1 == tmp.entity1 && this.tableData[j].entity2 == tmp.entity2 && this.tableData[j].relation == tmp.relation)tableflag = 1;
			// 	}
			// 	if(tableflag == 0)this.tableData.push(tmp);
			// 	if(!pointSet.has(tmp.entity1)) {
			// 	  pointSet.add(tmp.entity1);
			// 	  graphPoint.push({name:tmp.entity1,category:0,des:tmp.entity1});
			// 	}
			// 	if(!pointSet.has(tmp.entity2)) {
			// 	  pointSet.add(tmp.entity2);
			// 	  graphPoint.push({name:tmp.entity2,category:1,des:tmp.entity2});
			// 	}
          //
			// 	graphLink.push({
			// 	  source: tmp.entity1,
			// 	  target: tmp.entity2,
			// 	  name: tmp.relation,
			// 	  des: tmp.entity1 + "->" + tmp.entity2
			// 	});
			//   }
          //
          // let categories=[
          //         {name:'entity1'},
          //         {name:'entity2'},
          //       ];
          //
          // let option ={
          //         // 提示框的配置
          //         tooltip: {
          //           formatter: function (x) {
          //             return x.data.des;
          //           }
          //         },
          //
          // // 工具箱
          //       toolbox: {
          //           // 显示工具箱
          //           show: true,
          //           feature: {
          //             mark: {
          //               show: true
          //             },
          //             // 还原
          //             restore: {
          //               show: true
          //             },
          //             // 保存为图片
          //             saveAsImage: {
          //               show: true
          //             }
          //           }
          //         },
          //         legend: [{
          //           // selectedMode: 'single',
          //           data: categories.map(function (a) {
          //             return a.name;
          //           })
          //         }],
          //
          //         series: [{
          //           type: 'graph', // 类型:关系图
          //           layout: 'force', //图的布局，类型为力导图
          //           symbolSize: 40, // 调整节点的大小
          //           roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
          //           edgeSymbol: ['circle', 'arrow'],
          //           edgeSymbolSize: [2, 10],
          //           edgeLabel: {
          //             normal: {
          //               textStyle: {
          //                 fontSize: 20
          //               }
          //             }
          //           },
          //           force: {
          //             repulsion: 2500,
          //             edgeLength: [10, 50]
          //           },
          //           draggable: true,
          //           lineStyle: {
          //             normal: {
          //               width: 2,
          //               color: '#4b565b',
          //             }
          //           },
          //           edgeLabel: {
          //             normal: {
          //               show: true,
          //               formatter: function (x) {
          //                 return x.data.name;
          //               }
          //             }
          //           },
          //           label: {
          //             normal: {
          //               show: true,
          //               textStyle: {}
          //             }
          //           },
          //           // 数据
          //           data:graphPoint,
          //           links:graphLink,
          //           categories: categories,
          //         }],
          //         grid:{
          //           top:"10px",
          //           bottom:"10px",
          //           height:"10px",
          //           width:"10px"
          //         }
          //       };
          //       myChart= echarts.init(document.getElementById('kgPic'));
          //       // 绘制图表
          //       myChart.setOption(option);
              myChart.on('click',function(params){
                  let obj = params.data;
                  console.log(obj);
                  if(obj.hasOwnProperty("source"))//links
                  {
                    ////obj.source+obj.name+obj.target 头节点、关系、尾节点
                    // this.$http.get('http://10.4.20.119:8000/search_entity?head='+obj.source+"&relation="+obj.name+"&tail="+obj.target).then(
                    //   (res) => {
                    //   })
                    alert("1");
                  }
                  else //points
                  {
                    ////实体名为obj.name
                    // this.$http.get('http://10.4.20.119:8000/search_entity?entity='+obj.name).then((res) => {
                    // })
                    alert("2");
                  }
                });
              this.loadingRes=false;
              }).catch((res)=>{
                this.loadingRes=false;
                console.log(res);
                myChart= echarts.init(document.getElementById('kgPic'));
                // 绘制图表
                myChart.setOption(Myoption, true);
                this.tableData = [];
                return;
              })
            }
      },
    }
</script>

<style scoped>

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
    background-color: #E9EEF3;
    color: #333;
    text-align: left;
    height: 100%;
    background-color: #F1F2F6;
  }

  /**************左侧导航栏***************/
  .is-active {
    background-color: rgba(255,255,255,0.2) !important;
    border-right: 4px solid #5775FB !important;
  }

  .el-menu-item{
    width: 200px;
  }

  /**************内容顶部***************/
  .header{
    width: 100%;
    height: 20px;
    line-height: 20px;
    text-align: left;
    margin-left: 20px;
    font-weight: bold;
    font-size: large;
  }
  /*************内容中心*************/
  .main{
    line-height: 30px;
    height: 90%;
    width: 100%;
  }
  #searchInfo{
    background-color: #F0F9EB;
    color: #67C23A;
    padding: 8px 16px;
    width: 95%;
    padding:8px 16px;
    border-radius: 10px;
    margin: 0 0 15px 10px;
    font-size: 13px;
  }
  /*搜索栏*/
  .el-input{
    width: 300px;
  }

  /*关系图*/
  #kgPic{
    height: 800px;
    width: 100%;
    margin-top: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    background-color: #fff;
  }
  .title{
    line-height: 55px;
    background-color: #E9EEF3;
    color: #606266;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    padding: 0 10px;
    font-weight: bold;
  }

  /*表格*/
  .el-table{
    height: 80%;
    width: 100%;
    margin-top: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  }
  /*分页符*/
  .el-pagination{
    right: 60px;
    height: 10%;
    text-align: right;
    margin-top: 10px;
    margin-bottom: 20px;
  }

  .el-pagination.is-background .el-pager li:not(.disabled).active{
    background-color: #5775FB !important;
  }
  .el-pagination.is-background .el-pager li:hover{
    color: #5775FB !important;
  }

  /***********按钮样式***********/
  .blueBtn{
    background-color: #EFF0FF;
    border: 1px solid #5775FB;
    color: #5775FB;
  }

  .blueBtn:hover,.blueBtn:active{
    background-color: #5775FB;
    color: #FFFFFF;
  }

  .darkBtn{
    background-color: #5775FB;
    border: 1px solid #5775FB;
    color: #FFFFFF;
  }
  .darkBtn:hover{
    background-color: #708BF7;
  }
</style>
