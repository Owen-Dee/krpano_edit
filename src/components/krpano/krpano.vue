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
    import topImg from './img/top.png';
    import leftOne from './img/left_one.png';
    import leftTwo from './img/left_two.png';
    import rightOne from './img/right_one.png';
    import rightTwo from './img/right_two.png';

    export default {
        name:'Krpano',
        data(){
            return {
                krpanoAPI: null,
                hotspotX: 0,
                hotspotY: 0,
                hotspotName: null,
            }
        },
        created() {
          window.Bus.$on(window.EventEnum.ADD_HOTSPOT, () => {
            this.addHotSpot();
          });
        },
        mounted(){
            this.$nextTick(() => {
                let xmlUrl = '';
                if (process.env.NODE_ENV === 'production') {
                  xmlUrl = `./static/viewer/krpano.xml`;
                } else {
                  xmlUrl = `../../../static/viewer/krpano.xml`;
                }

                embedpano({
                    xml: xmlUrl,
                    target: 'krpano',
                    html5: 'prefer',
                    id: 'quPlusKrpano',
                    passQueryParameters: true,
                    onready : this.krpanoOnready
                });
            });
        },
        methods:{
          krpanoOnready(krpanoAPI) {
            this.krpanoAPI = krpanoAPI;
            this.$store.dispatch('recordKrpanoAPI', krpanoAPI);
            let designId = 32800;
            let jobId = '2ccc8a1c-d66b-4529-8694-abc24a0d5fa6';
            let krpanoService = KrpanoService.getInstance();
            krpanoService.getKrpanoXml(designId, jobId).then((result) => {
                if (!result) {
                  return;
                }

                debugger;
                let krpano = $(result).find("krpano");
                let skinXml = '';
                if (process.env.NODE_ENV === 'production') {
                  skinXml = `./static/viewer/skin/skin.xml`;
                } else {
                  skinXml = `../../../static/viewer/skin/skin.xml`;
                }

                let baseDir = "{0}/{1}/".format(process.env.KRPANOURL, designId);
                krpano.attr("basedir", baseDir);
                krpano.find('include').attr('url', skinXml);
                krpano.find("cube").each(function(ele) {
                    let imgurl = $(this).attr("url");
                    if (!imgurl.startsWith('%')) {
                        $(this).attr('url', '%BASEDIR%/{0}'.format(imgurl));
                    }
                });

                krpano.find("scene").each(function(ele) {
                    let title = $(this).attr('title');
                    if (!title) {
                        $(this).attr('title', '卧室');
                    }
                });
                window.getHotspot = this.getHotspot;
                window.saveHotspot = this.saveHotspot;
                window.showHotspotPanel = this.showHotspotPanel;
                krpano.find('hotspot').each(function(ele) {
                    $(this).attr('ondown', 'draghotspot');
                    $(this).attr('onup', 'dragmouseup');
                    let hotspotName = 'hs' + ((Date.now() + Math.random()) | 0);
                    $(this).attr('name', hotspotName);
                    $(this).attr('onclick', `js(window.showHotspotPanel(${hotspotName}))`);
                });
                let autorotate = `<autorotate enabled="false" />`;
                krpano.append(autorotate);
                let xmlStr = krpano[0].outerHTML;
                this.krpanoAPI.call(`loadxml(${xmlStr}, null, MERGE, BLEND(0.5));`);
            }).catch((error) => {
               console.error('getKrpanoXml error: ' + error);
            });
          },
          showHotspotPanel(name) {
            this.hotspotName = name;
            window.Bus.$emit(window.EventEnum.SHOW_HOTSPOT_PANEL, name);
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
            if (!this.krpanoAPI) {
              return;
            }

            let ath = this.krpanoAPI.get('view.hlookat');
            let atv = this.krpanoAPI.get('view.vlookat');
            let hotspotName = 'hs' + ((Date.now() + Math.random()) | 0);
            this.krpanoAPI.call(`addhotspot(${hotspotName})`);
            this.krpanoAPI.set(`hotspot[${hotspotName}].url`, topImg);
            this.krpanoAPI.set(`hotspot[${hotspotName}].ath`, ath);
            this.krpanoAPI.set(`hotspot[${hotspotName}].atv`, atv);
            this.krpanoAPI.set(`hotspot[${hotspotName}].distorted`, false);
            this.krpanoAPI.set(`hotspot[${hotspotName}].style`, 'hotspot_top');
            this.krpanoAPI.set(`hotspot[${hotspotName}].linkedscene`, 'scene_69bf4a07-0948-4cd8-9d31-8e552183cc19');
            if ( this.krpanoAPI.get('device.html5') ) {
              this.krpanoAPI.set(`hotspot[${hotspotName}].onclick`, () => {
                  this.hotspotName = hotspotName;
                  window.Bus.$emit(window.EventEnum.SHOW_HOTSPOT_PANEL, hotspotName);
              });
              this.krpanoAPI.call(`set(hotspot[${hotspotName}].ondown, draghotspot(););`);
              this.krpanoAPI.call(`set(hotspot[${hotspotName}].onup, dragmouseup(););`);
              this.krpanoAPI.call(`set(hotspot[${hotspotName}].onloaded, add_all_the_time_tooltip(););`);
            }
          },
          setHotspotIcon() {
            this.krpanoAPI.set("hotspot[" + this.hotspotName + "].url", topImg);
          }
        },
    }
</script>

<style lang="scss" scoped>
@import './style/krpano.scss';
</style>
