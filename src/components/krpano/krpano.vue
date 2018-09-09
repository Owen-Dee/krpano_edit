<template>
  <div id="wrapper">
      <div id="krpano"></div>
      <div class="add-btn">
        <button v-on:click="addHotSpot">Add hotspot</button>
        <button v-on:click="setHotspotIcon">Set Hotspot</button>
      </div>
  </div>
</template>
<script>
    import KrpanoService from '../../api/krpanoService.js';
    import frontImg from '../../../static/viewer/images/front.png';
    import upImg from '../../../static/viewer/images/up.png';
    import rightImg from '../../../static/viewer/images/right.png';
    import downImg from '../../../static/viewer/images/down.png';
    import leftImg from '../../../static/viewer/images/left.png';

    export default {
        name:'krpano',
        data(){
            return {
                krpanoObj: null,
                hotspotX: 0,
                hotspotY: 0,
                hotspotName: null,
            }
        },
        mounted(){
            this.$nextTick(() => {
                let xml = 'https://j3ddev.oss-cn-shanghai.aliyuncs.com/Data/KRPano/designpanos/panos/32800/fc1617c1-21a8-4fd3-abd1-65b64c9246a6.xml';
                embedpano({
                    xml: '../../../static/viewer/krpano.xml',
                    target: 'krpano',
                    html5: 'prefer',
                    id: 'quPlusKrpano',
                    passQueryParameters: true,
                    onready : this.krpanoOnready
                });
            });
        },
        methods:{
          krpanoOnready(krpanoObj) {
            this.krpanoObj = krpanoObj;
            let designId = 32800;
            let jobId = '2ccc8a1c-d66b-4529-8694-abc24a0d5fa6';
            // let designId = 32800;
            // let jobId = 'fc1617c1-21a8-4fd3-abd1-65b64c9246a6';
            let krpanoService = KrpanoService.getInstance();
            krpanoService.getKrpanoXml(designId, jobId).then((result) => {
                if (!result) {
                  return;
                }

                debugger;
                let krpano = $(result).find("krpano");
                let skinXml = `../../../static/viewer/skin/skin.xml`;
                // let skinXml = `../../../static/viewer-1.8/skin/skin.xml`;
                // let skinXml = `http://j3ddev.oss-cn-shanghai.aliyuncs.com/Data/KRPano/designpanos/skin1.xml`;
                let baseDir = "{0}/{1}/".format('http://j3ddev.oss-cn-shanghai.aliyuncs.com/Data/KRPano/designpanos/panos', designId);
                krpano.attr("basedir", baseDir);
                krpano.find('include').attr('url', skinXml);
                krpano.find("cube").each(function(ele) {
                    let imgurl = $(this).attr("url");
                    if (!imgurl.startsWith("%")) {
                        $(this).attr("url", "%BASEDIR%/{0}".format(imgurl));
                    }
                });

                krpano.find("scene").each(function(ele) {
                    let title = $(this).attr("title");
                    if (!title) {
                        $(this).attr("title", '卧室');
                    }
                });

                let self = this;
                window.getHotspotName = this.getHotspotName;
                krpano.find('hotspot').each(function(ele) {
                    $(this).attr("ondown", "draghotspot");
                    $(this).attr("onup", "dragmouseup");
                    var hs_name = "hs" + ((Date.now() + Math.random()) | 0);
                    $(this).attr('name', hs_name);
                    $(this).attr("onclick", `js(window.getHotspotName(${hs_name}))`);
                });

                window.getHotspot = this.getHotspot;
                window.saveHotspot = this.saveHotspot;
                let autorotate = `<autorotate enabled="false" />`;
                krpano.append(autorotate);
                let xmlStr = krpano[0].outerHTML;
                this.krpanoObj.call("loadxml(" + xmlStr + ", null, MERGE, BLEND(0.5));");
            }).catch((error) => {
               console.error('getKrpanoXml error: ' + error);
            });
          },
          getHotspotName(name) {
            this.hotspotName = name;
          },
          getHotspot(ath, atv) {
            this.hotspotX = ath;
            this.hotspotY = atv;
            console.log('y:' + atv);
          },
          saveHotspot() {
            console.log('=======saveHotspot==========');
            console.log('x:' + this.hotspotX);
            console.log('y:' + this.hotspotY);
          },
          addHotSpot() {
            if (!this.krpanoObj) {
              return;
            }

            var h = this.krpanoObj.get("view.hlookat");
            var v = this.krpanoObj.get("view.vlookat");
            var hs_name = "hs" + ((Date.now() + Math.random()) | 0);  // create unique/randome name
            this.krpanoObj.call("addhotspot(" + hs_name + ")");
            this.krpanoObj.set("hotspot["+hs_name+"].url", downImg);
            this.krpanoObj.set("hotspot["+hs_name+"].ath", h);
            this.krpanoObj.set("hotspot["+hs_name+"].atv", v);
            this.krpanoObj.set("hotspot["+hs_name+"].distorted", false);
            this.krpanoObj.set("hotspot["+hs_name+"].style", "hotspot_room");
            this.krpanoObj.set("hotspot["+hs_name+"].linkedscene", "scene_69bf4a07-0948-4cd8-9d31-8e552183cc19");
            if ( this.krpanoObj.get("device.html5") ) {
              // for HTML5 it's possible to assign JS functions directly to krpano events
              this.krpanoObj.set("hotspot["+hs_name+"].onclick", () => {
                this.hotspotName = hs_name;
              });
              this.krpanoObj.call("set(hotspot[" + hs_name + "].ondown, draghotspot(););");
              this.krpanoObj.call("set(hotspot[" + hs_name + "].onup, dragmouseup(););");
              this.krpanoObj.call("set(hotspot[" + hs_name + "].onloaded, add_all_the_time_tooltip(););");
            }
          },
          setHotspotIcon() {
            this.krpanoObj.set("hotspot[" + this.hotspotName + "].url", downImg);
          }
        },
    }
</script>

<style lang="scss" scoped>
  #wrapper{
      width: 100%;
      height: 100%;
      position: absolute;
        #krpano{
            width: 100%;
            height: 100%;
        }
        .add-btn {
          position: absolute;
          top: 10px;
          left: 10px;
          cursor: pointer;
        }
  }
</style>
