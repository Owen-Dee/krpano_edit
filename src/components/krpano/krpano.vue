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
                scenes: [],
            }
        },
        computed: {
            activeScene() {
                return this.$store.getters.activeScene;
            }
        },
        created() {
          //1.鼠标左键点击热点不松开
          window.hotspotMouseDown = this.hotspotMouseDown;
          //2.鼠标左键松开
          window.hotspotMouseUp = this.hotspotMouseUp;
          //3.显示热点面板
          window.showHotspotPanel = this.showHotspotPanel;

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
                //1. 设置baseDir,配置全景图的路径
                let baseDir = "{0}/{1}/".format(process.env.KRPANOURL, designId);
                krpano.attr("basedir", baseDir);
                //2. 将引入的skin.xml(包含了样式和逻辑)替换成本地的
                krpano.find('include').attr('url', skinXml);
                //3. 找到包含全景图的标签,配置全景图的路径
                krpano.find("cube").each((i, item) => {
                    let imgurl = $(item).attr("url");
                    if (!imgurl.startsWith('%')) {
                        $(item).attr('url', '%BASEDIR%/{0}'.format(imgurl));
                    }
                });
                //4. 找到所有的场景,并找到每个场景里的热点
                let scenes = [];
                krpano.find("scene").each((index, item) => {
                    $(item).attr('onstart', 'activatespot(90)');
                    let name = $(item).attr('name');
                    let title = $(item).attr('title');
                    if (!title) {
                        title = '无名称';
                        $(item).attr('title', title);
                    }

                    let arr = name.split('_');
                    let sceneJobId = '';
                    if (arr.length >= 1) {
                      sceneJobId = arr[1];
                    }
                    
                    let thumbUrl = ("{0}/{1}/{2}.tiles/{3}").format(process.env.KRPANOURL, designId, sceneJobId, 'thumb.jpg');
                    let scene = {
                      name: name,
                      thumbUrl: thumbUrl,
                      roomType: title,
                      hotspots: []
                    };

                    $(item).find('hotspot').each((i, hsObj) => {
                      let hotspotName = 'spot' + Math.round(Math.random() * 10000000);
                      $(hsObj).attr('name', hotspotName);
                      let ath = $(hsObj).attr('ath');
                      let atv = $(hsObj).attr('atv');
                      let linkedscene = $(hsObj).attr('linkedscene');
                      let hotspot = {
                        name: hotspotName,
                        ath: ath,
                        atv: atv,
                        linkedscene: linkedscene
                      };
                      scene.hotspots.push(hotspot);
                      $(hsObj).attr('ondown', 'draghotspot');
                      $(hsObj).attr('onup', 'dragmouseup');
                      $(hsObj).attr('onclick', `js(window.showHotspotPanel(${hotspotName}))`);
                    });

                    scenes.push(scene);
                });
                this.scenes = scenes;
                if (scenes.length > 0) {
                  let activeScene = scenes[0];
                  this.$store.dispatch('recordActiveScene', {...activeScene});
                }
                this.$store.dispatch('recordScenes', scenes);
                
                //5.设置全景图是否自动旋转
                let autorotate = `<autorotate enabled="false" />`;
                krpano.append(autorotate);
                //6. 添加底图加载
                let mapStr = this.getMapXml();
                krpano.append(mapStr);
                //6.调用krpano接口中的方法,加载xml
                let xmlStr = krpano[0].outerHTML;
                this.krpanoAPI.call(`loadxml(${xmlStr}, null, MERGE, BLEND(0.5));`);
            }).catch((error) => {
               console.error('getKrpanoXml error: ' + error);
            });
          },
          getMapXml() {
            let map = '',
                radarSwf = '',
                radar = '',
                mapspotactiveImg = '';
            if (process.env.NODE_ENV === 'production') {
              map = `https://oss-cn-shanghai.aliyuncs.com/j3ddev/Data/Designs/e351020d-4244-4ab1-9fff-6f9ec886291d/image.png?` + new Date();
              radarSwf = `./static/viewer/skin/radar.swf`;
              radar = `./static/viewer/skin/radar.js`;
              mapspotactiveImg = `./static/viewer/skin/images/vtourskin_mapspotactive.png`;
            } else {
              map = `https://oss-cn-shanghai.aliyuncs.com/j3ddev/Data/Designs/e351020d-4244-4ab1-9fff-6f9ec886291d/image.png?` + new Date();
              radarSwf = `../../../static/viewer/skin/radar.swf`;
              radar = `../../../static/viewer/skin/radar.js`;
              mapspotactiveImg = `../../../static/viewer/skin/images/vtourskin_mapspotactive.png`;
            }
            let hotspotLayer = ``;
            let i = 0;
            this.scenes.forEach((scene) => {
                let x = 200 * Math.random();
                let y = 300 * Math.random();
                let name = 'spot' + i;
                let layer = `<layer name="${name}" style="spot" x="${x}" y="${y}" />`;
                hotspotLayer += layer;
                i++;
            });
            let mapStr = `
            	<layer name="mapcontainer" keep="true" type="container" bgcolor="0x000000" bgalpha="0.5" align="righttop" x="0" y="50" width="264" height="264">
              <!-- map的url属性可以改成我们自己的地图文件，align一定是lefttop，这是为了确定热点位置，其坐标系以左上角为0点，也是为了方便我们通过ps等方法来获取热点的值。-->
                <layer name="map" url="${map}" align="top" x="4" y="4" width="prop" height="256" handcursor="false" scalechildren="true">
                  <!-- 雷达遮罩部分，确保了雷达的扇形不会超出范围，这里也就是地图map的范围。注意这里也应该是对齐左上角，下面的各种layer通通都是对齐左上角，不然坐标系不统一的话，就很难确定热点的位置 -->
                  <layer name="radarmask" type="container" align="lefttop" width="100%" height="100%" maskchildren="true">
                    <!-- 雷达插件 zoder=1 在开始时为隐藏，只有激活activetespot这个action时才会显示 zorder为叠放次序 数字越大越靠前 -->
                    <layer name="radar" visible="false"
                          url="${radarSwf}" alturl="${radar}"
                          align="lefttop" edge="center" zorder="1"
                          scale="0.3"
                          fillcolor="0xFFFFFF" fillalpha="0.8"
                          linecolor="0xFF0000" linewidth="0.5" linealpha="0.5"
                          headingoffset="0"/>
                    <!-- 热点 zorder=2，用style来统一处理 所有layer都载入了一个名为spot的style，
                    注意这里spot是由0开始，而不是由1开始的，因此在一般情况下，地图点与场景一一对应，
                    而场景的index是从0开始的，所以我们可以利用这一点提高代码的可读性-->
                    ${hotspotLayer}
                    <!-- 激活的热点 zorder=3 开始时候隐藏，在这里是一个绿色的地图点， 表示当前的场景-->
                    <layer name="activespot" url="${mapspotactiveImg}" scale="1.2" oy="-17" align="lefttop" edge="center" zorder="3" visible="false"/>
                  </layer>
                </layer>
              </layer>
            `;

            return mapStr;
          },
          showHotspotPanel(name) {
            this.hotspotName = name;
            window.Bus.$emit(window.EventEnum.SHOW_HOTSPOT_PANEL, name);
          },
          hotspotMouseDown(ath, atv, name) {
            this.hotspotX = ath;
            this.hotspotY = atv;
            this.hotspotName = name;
          },
          hotspotMouseUp() {
            let activeScene = null;
            this.scenes.forEach((scene) => {
              if (scene.name === this.activeScene.name) {
                let hotspots = scene.hotspots;
                hotspots.forEach((item) => {
                  if (item.name === this.hotspotName) {
                    item.ath = this.hotspotX;
                    item.atv = this.hotspotY;
                  }
                });

                activeScene = {...scene};
              }
            });

            if (activeScene) {
              this.$store.dispatch('recordActiveScene', activeScene);
            }
            this.$store.dispatch('recordScenes', this.scenes);
          },
          addHotSpot() {
            if (!this.krpanoAPI) {
              return;
            }

            let ath = this.krpanoAPI.get('view.hlookat');
            let atv = this.krpanoAPI.get('view.vlookat');
            let hotspotName = 'spot' + Math.round(Math.random() * 10000000);
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
