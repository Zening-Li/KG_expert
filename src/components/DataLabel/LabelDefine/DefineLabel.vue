<template>
  <el-container>
    <!--内容块 模式定义-->
    <el-main>
      <div class="header">
        模式定义
      </div>
      <el-divider></el-divider>
      <div class="content">
        <div id="entitiDefinitions">
          <el-row type="flex" align="center">
            <el-col :span="4" class="title">实体定义</el-col>
            <el-col style="line-height:50px;margin-left:10px;">
              <el-input
                class="input-new-tag"
                v-if="entityInputVisible"
                v-model="newEntityTag"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="entityInputConfirm"
                @blur="entityInputConfirm"
                placeholder="请输入实体"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showEntityInput">+ New Tag</el-button>
              <MyEntityTag
                v-for="(tag, index) in entityTags"
                :key="index"
                :entity="tag"
                v-on:closeEntityTag="entityClose(tag)">
                {{tag}}
              </MyEntityTag>
            </el-col>
          </el-row>
        </div>
        <el-divider></el-divider>
        <div id="relationDefinitions">
          <el-row type="flex" align="center">
            <el-col :span="4" class="title">关系定义</el-col>
            <el-col style="line-height:50px;margin-left:10px;">
              <el-input
                class="input-new-tag longInput"
                v-if="relationInputVisible"
                v-model="newRelationTag"
                ref="saveTagInput2"
                size="small"
                @keyup.enter.native="relationInputConfirm"
                @blur="relationInputConfirm"
                placeholder="请输入关系，格式：关系/定义域/值域"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showRelationInput">+ New Tag</el-button>
              <MyRelationTag
                v-for="(tag, index) in relationTags"
                :key="index"
                :relation="tag.relation"
                :domain="tag.domain"
                :range="tag.range"
                v-on:closeRelationTag="relationClose(tag)">
                {{tag}}
              </MyRelationTag>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import MyRelationTag from '../../MyRelationTag'
import MyEntityTag from '../../MyEntityTag'
  export default {
    name: 'DefineLabel',
    components: {
      MyRelationTag,
      MyEntityTag
    },
    data () {
      return {
        entityTags: ['标签一', '标签二', '标签三'],
        entityInputVisible: false,
        newEntityTag: '',
        relationTags: [{
            relation:"test1",
            domain:"定义域1",
            range:"值域1"
          },{
            relation:"test2",
            domain:"定义域2",
            range:"值域2"
          },{
            relation:"test3",
            domain:"定义域3",
            range:"值域3"
          }],
        relationInputVisible: false,
        newRelationTag: ''
      }
    },
    methods: {
      testapishow(){
        // this.$http.get('http://127.0.0.1:8000/api/show_books')

        // .then((response) => {

        //   console.log(response)

        // })

      },
      testapiadd(){
this.$http.get('http://127.0.0.1:8000/api/add_book?book_name=' + 'testbook2')

        .then((response) => {

          console.log(response)

        })
      },
      entityClose(tag) {
        this.entityTags.splice(this.entityTags.indexOf(tag), 1);
      },
      showEntityInput() {
        this.entityInputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      entityInputConfirm() {
        let inputValue = this.newEntityTag;
        if (inputValue) {
          this.entityTags.push(inputValue);
        }
        this.entityInputVisible = false;
        this.newEntityTag = '';
      },
      relationClose(tag) {
        this.relationTags.splice(this.relationTags.indexOf(tag), 1);
      },

      showRelationInput() {
        this.relationInputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput2.$refs.input.focus();
        });
      },
      relationInputConfirm() {
        let inputValue = this.newRelationTag.split("/");
        if (inputValue.length===3) {
          this.relationTags.push({
            relation:inputValue[0],
            domain:inputValue[1],
            range:inputValue[2]
          });
        this.relationInputVisible = false;
        this.newRelationTag = '';
        }
        else if(this.newRelationTag !==""){
          this.$message({
          message: '输入格式有误！',
          type: 'warning'
        });
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  html,body,.el-container{
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding: 0;
  }

  body > .el-container {
    width: 100%;
    height: 100%;
  }

  .el-main {
    background-color: #F1F2F6;
    color: #333;
    text-align: center;
    min-height: calc(100% - 60px);
  }


  .header{
    width: 100%;
    height: 20px;
    line-height: 20px;
    text-align: left;
    margin-left: 20px;
    font-weight: bold;
    font-size: large;
  }
  .content{
    min-height: calc(100% - 88px);
    background-color: #FFF;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    border-radius: 4px;
    padding:15px 20px 0 20px;
  }
  .title{
    font-weight: bold;
    padding:10px 0 0 10px;
    justify-content: left;
    display: flex;
    align-items: center;
  }
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    /*margin-left: 10px;*/
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
    background-color: #5775FB !important;
    color:#FFFFFF;
    width: 100px;
  }
  .button-new-tag:hover{
    color:#FFFFFF !important;
    background-color: #708BF7 !important;
  }
  .input-new-tag {
    width:100px;
    margin-left: 10px;
    vertical-align: bottom;
  }
  .longInput{
    width:250px !important;
  }

  .el-tag, .button-new-tag:hover{
    background-color: #F1F1FD;
    border:1px solid #E4E7ED;
    color: #5775FB;
  }

  #entitiDefinitions,#relationDefinitions{
    text-align: left;
  }

</style>
