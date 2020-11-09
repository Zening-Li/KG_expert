<template>
  <el-container>
    <!--内容块-->
    <el-main>
      <!--顶部-->
      <div class="header">
        视频转换为图像
        <el-button
          type="primary"
          class="darkBtn headbutton"
          size="small"
          @click="handleTransform"
          >转换为图像</el-button
        >
        <el-button
          type="primary"
          class="darkBtn headbutton"
          size="small"
          @click="onUpload"
          >打开视频</el-button
        >
      </div>
      <!-- 上传窗口-->
      <div id="upload" v-if="isUpload">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>数据上传</span>
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
            accept=".mp4"
            action=""
            :on-remove="handleRemove"
            :on-change="handleAddFile"
            :file-list="uploadList"
            :limit="1"
            :on-exceed="handleExceed"
            multiple
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <div class="el-upload__tip" slot="tip">
              仅支持上传mp4文件<br />
              限制上传1个视频<br />
            </div>
          </el-upload>
          <el-button size="small" @click="cancelUpload">取消</el-button>
          <el-button
            style="margin-left: 10px"
            class="darkBtn"
            size="small"
            type="primary"
            @click="submitUpload"
            >确定</el-button
          >
        </el-card>
      </div>
      <el-divider></el-divider>
      <!--中心-->
      <div
        class="main"
        v-loading="loadingRes"
        element-loading-text="视频正在处理中，请稍等……"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.1)"
      >
        <div v-if="!flag" style="margin-left: 50px">
          提示：请先上传视频进行转换
        </div>
        <!-- <el-row v-if="isTrans">
          <div
            class="resultContainer"
            style="height: 50px"
            v-if="vedioList.length !== 0"
          >
            <div class="picStyle title">原视频</div>
            <div class="graphStyle title">图像</div>
            <el-button type="primary" class="blueBtn" size="small" @click="handleExport">导出</el-button>
          </div>
        </el-row> -->
        <el-row v-for="(item, index) in vedioList" v-bind:key="index">
          <el-col :span="isTrans ? 24 : 24">  <!--12:24-->
            <div class="resultContainer">
              <div
                style="
                  display: flex;
                  flex-direction: row;
                  flex-wrap: wrap;
                  height: 100%;
                  width: 100%;
                  padding-right: 20px;
                "
              >
                <video
                  :src="item.src"
                  controls="controls"
                  style="width: 100%"
                ></video>
                <div
                  class="main"
                  v-loading="loadingRes1"
                  element-loading-text="视频正在处理中，请稍等……"
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(0, 0, 0, 0.1)"
                  style="position:absolute;"
                ></div>
                <!-- <video preload controls loop style="width:100%;">
                    <source :src="item.src" type="video/mp4" />
                    您的浏览器不支持HTML5的vedio标签。
                  </video> -->
                <div style="text-align: center; font-weight: bold; width: 100%">
                  {{ fileName }}
                </div>
              </div>
            </div>
          </el-col>
          <!-- <el-col v-if="isTrans" :span="12">
            <el-image :src="resultSrc" fit="contain" v-if="resultSrc !== ''">
              <div slot="placeholder" class="image-slot">
                加载中
                <span class="dot">...</span>
              </div>
            </el-image>
          </el-col> -->
        </el-row>
      </div>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: "Vedio2Image",
  data() {
    return {
      vedioList: [],
      isUpload: false,
      isTrans: false,
      uploadList: [],
      flag: false,
      //文件名
      fileName: "",
      loadingRes: false,
      loadingRes1:false,
      resultSrc: "../../assets/logo.png",
    };
  },

  methods: {
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
          files.length + fileList.length
        } 个文件`
      );
    },
    //上传视频
    onUpload() {
      this.isUpload = true;
    },
    cancelUpload() {
      this.isUpload = false;
      this.uploadList = [];
    },
    submitUpload() {
      this.loadingRes = true;
      this.flag = true;
      this.isUpload = false;
      //上传
      let fd = new FormData();
      fd.append("video", this.uploadList[0].raw);
      this.$http
        .post("http://39.102.71.123:23352/pic/video2pic_open_video", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res.data);
            this.$message({
              message: "打开成功",
              type: "success",
            });
            
            console.log(this.uploadList[0]);
            this.vedioList = [];
            this.vedioList.push({ src: res.data });
            this.fileName = this.uploadList[0].name;
            //清空上传列表
            this.uploadList = [];
            this.loadingRes = false;
        })
        .catch((res) => {
          //请求失败
          console.log(res)
          this.loadingRes = false;
        });
    },
    handleRemove(file, fileList) {
      this.uploadList = fileList;
    },
    handleAddFile(file, fileList) {
      console.log(file);
      console.log(fileList);
      this.uploadList = fileList;
    },
    //转换为图像
    handleTransform() {
      this.loadingRes = true;
      this.loadingRes1 = true;
      this.isTrans = true;
      //上传
      let fd = new FormData()
      fd.append('filename',this.fileName)
      this.$http.post(
        'http://39.102.71.123:23352/pic/video2pic',fd,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((res) => {
        console.log(res.data);
        const elt = document.createElement("a");
        elt.setAttribute("href", res.data); //设置文件地址
        elt.setAttribute("download", "图像.zip"); //文件名
        elt.style.display = "none";
        document.body.appendChild(elt);
        elt.click();
        document.body.removeChild(elt);
        this.loadingRes=false;
        this.loadingRes1=false;
      }).catch((res) => {
        //请求失败
        // console.log(res)
        // alert("请先上传视频！");
        this.loadingRes=false;
      });
      this.loadingRes = false;
    },
  },
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

#daddy {
  width: 100%;
  height: 100%;
}

/***************上传弹窗***********/
#upload {
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
  border: 1px solid #5775fb;
  color: #5775fb;
  height: 32px;
  margin-right: 20px;
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
/*视频及echarts样式*/
.resultContainer {
  height: 500px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.picStyle {
  height: 100%;
  width: 50%;
  /* border-right: solid 1px #DCDFE6; */
  padding-right: 40px;
  padding-left: 20px;
}

.graphStyle {
  height: 100%;
  width: 50%;
  padding-left: 40px;
}

.el-image {
  height: 100% !important;
  padding-left: 20px;
}

.title {
  text-align: left;
  font-weight: bold;
  font-size: large;
  padding-bottom: 30px;
}

.picName {
  width: 50px;
  text-align: center;
  /* border-right: solid 1px #DCDFE6; */
  padding-right: 40px;
}
</style>
