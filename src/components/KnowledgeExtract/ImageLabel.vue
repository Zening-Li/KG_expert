<template>
  <div class="accept-container">
    <iframe id="show-iframe"  frameborder=0 name="showHere" src='../../../static/via.html'></iframe>
  </div>
</template>

<script>
    export default {
      name: "ImageLabel",
      data () {
        return {

        }
      },
      mounted(){
        const oIframe = document.getElementById('show-iframe');
        const deviceWidth = document.documentElement.clientWidth;
        const deviceHeight = document.documentElement.clientHeight;
        oIframe.style.width = deviceWidth-200 + 'px';
        oIframe.style.height = deviceHeight-90 + 'px';
      },
      methods:{
      }
    }
</script>

<style scoped>
.accept-container{
  margin-left: -20px;
  margin-top:-20px;
}
</style>
