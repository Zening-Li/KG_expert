<template>
  <div id="app">
    <el-container>
      <!-- 顶部导航栏-->
      <!-- <el-header> -->
        <!-- <div id="logo" style="position:absolute; left:30px; top:3px;">
          <img src="./assets/KGLogo.png" />
          <span style="margin-left:10px;font-size:large;font-weight:bold;">军事知识管理系统</span>
        </div> -->
        <!-- <el-row type="flex" justify="end"> -->
          <!-- <el-col id="logo" :span="3">
            <img src="./assets/KGLogo.png" />
            作战文书管理系统
          </el-col>-->
          <!-- <el-col style="position:relative;">
            <MyMenu />
          </el-col>
          <el-col id="user" :span="2">
            <MyDropdown :username="usrName" ref="menuIndex" />
          </el-col> -->
        <!-- </el-row> -->
      <!-- </el-header> -->
      <el-container style="height:calc(100% - 0px);">
        <!-- <el-aside style="width:200px;overflow-x:hidden;"> -->
          <!-- <el-menu
            background-color="#343643"
            text-color="#fff"
            active-text-color="#fff"
            :router="true"
          > -->
            <!--数据浏览菜单-->
            <!-- <el-menu-item index="/RelationalData" v-if="activeIndex==='/relationalData'">
              <i class="el-icon-menu"></i>
              <span slot="title">结构化数据浏览</span>
            </el-menu-item> -->
            <!--数据标注菜单-->
            <!-- <el-menu-item index="/definelabel" v-if="activeIndex==='/definelabel'">
              <i class="el-icon-menu"></i>
              <span slot="title">模式定义</span>
            </el-menu-item> -->
            <!-- <el-menu-item index="/corpustagging" v-if="activeIndex==='/definelabel'">
              <i class="el-icon-document"></i>
              <span slot="title">语料标注</span>
            </el-menu-item> -->
            <!--知识抽取菜单-->
            <!-- <el-submenu index="1" v-if="activeIndex==='/'">
              <template slot="title">
                <i class="el-icon-s-grid"></i>
                <span>结构化数据抽取</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/viewData">数据浏览</el-menu-item>
                <el-menu-item index="/showOntology">本体展示</el-menu-item>
                <el-menu-item index="/extractStruct">知识抽取</el-menu-item>
                <el-menu-item index="/deNoise">属性去噪</el-menu-item>
                <el-menu-item index="/entityMatch">实体对齐</el-menu-item>
                <el-menu-item index="/extractTest">抽取测试</el-menu-item>
              </el-menu-item-group>
            </el-submenu> -->
            <!-- <el-submenu index="2" v-if="activeIndex==='/'">
              <template slot="title">
                <i class="el-icon-document"></i>
                <span>文本抽取</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/showDict">预处理</el-menu-item>
                <el-menu-item index="/extract?algorithm=1">文本抽取</el-menu-item>
                <el-menu-item index="/predict">模型预测</el-menu-item>
              </el-menu-item-group>
            </el-submenu> -->
            <!-- <el-menu-item index="/imageLabel" v-if="activeIndex==='/'">
              <i class="el-icon-collection-tag"></i>
              <span slot="title">图片标注</span>
            </el-menu-item>
            <el-menu-item index="/extractPic" v-if="activeIndex==='/'">
              <i class="el-icon-picture-outline"></i>
              <span slot="title">图片抽取</span>
            </el-menu-item>
            <el-menu-item index="/imagePredict" v-if="activeIndex==='/'">
              <i class="el-icon-magic-stick"></i>
              <span slot="title">图像分类</span>
            </el-menu-item>
            <el-menu-item index="/video2Image" v-if="activeIndex==='/'">
              <i class="el-icon-refresh"></i>
              <span slot="title">视频转换为图像</span>
            </el-menu-item>
            <el-menu-item index="/videoPredict" v-if="activeIndex==='/'">
              <i class="el-icon-magic-stick"></i>
              <span slot="title">视频分类</span>
            </el-menu-item>
            <el-menu-item index="/extractVideo" v-if="activeIndex==='/'">
              <i class="el-icon-video-camera"></i>
              <span slot="title">视频抽取</span>
            </el-menu-item> -->
            <!--知识校正菜单-->
            <!-- <el-menu-item index="/correct" v-if="activeIndex==='/correct'">
              <i class="el-icon-edit"></i>
              <span slot="title">知识校正</span>
            </el-menu-item> -->
            <!--知识检索菜单-->
            <!-- <el-menu-item index="/entitysearch" v-if="activeIndex==='/entitySearch'">
              <i class="el-icon-menu"></i>
              <span slot="title">实体检索</span>
            </el-menu-item> -->
            <!-- <el-menu-item index="/relationsearch" v-if="activeIndex==='/entitySearch'">
              <i class="el-icon-search"></i>
              <span slot="title">关系检索</span>
            </el-menu-item> -->
          <!-- </el-menu> -->
        <!-- </el-aside> -->
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
// import MyMenu from "./components/MyMenu";
// import MyDropdown from "./components/MyDropdown";
import { mapGetters } from "vuex";
export default {
  name: "App",
  // components: {
  //   MyMenu,
  //   MyDropdown
  // },
  data() {
    return {
      usrName: "Admin"
    };
  },
  computed: {
    ...mapGetters(["activeIndex"])
  },
  mounted(){
    let past = window.location.href.split('/')
    past = '/' + past[past.length - 1];
    if(past === '/relationalData')
      this.$store.dispatch('changeIndex','/relationalData');
    else if(past === '/definelabel' || past === '/corpustagging')
      this.$store.dispatch('changeIndex','/definelabel');
    else if(past === '/showOntology' || past === '/extractStruct' || past === '/entityMatch'
            || past === '/showDict' || past === '/extract' || past === '/extractPic'
            || past === '/extractVideo' || past === '/deNoise' || past === '/viewData'
            || past === '/extractTest' || past === '/')
      this.$store.dispatch('changeIndex','/');
    else if(past === '/correct')
      this.$store.dispatch('changeIndex','/correct');
    else if(past === '/entitysearch' || past === '/relationsearch')
      this.$store.dispatch('changeIndex','/entitySearch');
    else this.$store.dispatch('changeIndex','/');
  }
};
</script>

<style>
html,
body,
#app,
.el-container {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body > .el-container {
  width: 100%;
  height: 100%;
}

.el-header {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
  height: 100%;
}

.el-main {
  padding: 0 !important;
  background-color: #e9eef3;
  color: #333;
  text-align: center;
  height: 100%;
}

#logo > img {
  width: 40px;
  vertical-align: middle;
}

.el-dropdown {
  vertical-align: top;
}
.el-dropdown + .el-dropdown {
  margin-left: 15px;
}
.el-icon-arrow-down {
  font-size: 12px;
}

header div div ul {
  width: fit-content;
}

.el-header {
  background-color: #2c2b31;
  color: white;
}
.el-aside {
  background-color: #343643;
}
.el-aside .is-active {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-right: 4px solid #5775fb !important;
}
.el-aside .el-menu-item{
   text-align: left;
   width: 200px;
 }
.el-aside .el-submenu{
  text-align: left;
  width: 200px;
}
</style>
