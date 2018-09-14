<template>
  <div id="wrapper">
      <div id="krpano"></div>
  </div>
</template>
<script>
    import KrpanoService from '../../api/krpanoService.js';
    import { deepClone, getUrlParam } from '../../utils/common.js';
    import topImg from './img/top.png';
    import leftOneImg from './img/left_one.png';
    import leftTwoImg from './img/left_two.png';
    import rightOneImg from './img/right_one.png';
    import rightTwoImg from './img/right_two.png';

    export default {
        name:'Krpano',
        data(){
            return {
                krpanoAPI: null, // 保存krpano的api接口
                hotspotX: 0, // 热点的x坐标(ath)
                hotspotY: 0, // 热点的y坐标(atv)
                hotspotName: null, // 热点名称
                scenes: [], // 记录漫游中所有的场景
                referObj: { // 参照对象:用于计算地图上显示的热点
                  x: 0, // 设计最左端的x坐标
                  y: 0, // 设计最下端的y坐标
                  width: 1, // 设计的宽度
                  height: 1 // 设计的长度
                },
                hasMapGPS: true, //是否有地图导航
            }
        },
        computed: {
            activeScene() {
                return this.$store.getters.activeScene;
            }
        },
        created() {
          //1.鼠标左键点击热点不松开(监听拖拽热点)
          window.hotspotMouseDown = this.hotspotMouseDown;
          //2.鼠标左键松开
          window.hotspotMouseUp = this.hotspotMouseUp;
          //3.显示热点面板
          window.showHotspotPanel = this.showHotspotPanel;
          //4. 通过点击地图上的标注,重置热点位置
          window.resetHotspots = this.resetHotspots;

          window.Bus.$on(window.EventEnum.ADD_HOTSPOT, (job) => {
            this.addHotSpot(job);
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
            let designId = getUrlParam('designId');
            let jobId = getUrlParam('jobId');
            if (!designId || !jobId) {
              return;
            }
            
            let krpanoService = KrpanoService.getInstance();
            krpanoService.getKrpanoXml(designId, jobId).then((result) => {
                if (!result) {
                  return;
                }

                let krpano = $(result).find("krpano");
                // 1.设置配置路径
                this.setConfigurationPath(krpano, designId);
                // 2.设置参照物的信息
                this.setReferInfo(krpano);
                // 4.设置所有的场景数据,并找到每个场景里的热点
                this.setSceneData(krpano, designId);
                // 5.添加导航底图
                if (this.hasMapGPS) {
                  let mapStr = this.getMapXml(krpano);
                  krpano.append(mapStr);
                }
                // 6.设置全景图是否自动旋转
                let autorotate = `<autorotate enabled="false" />`;
                krpano.append(autorotate);
                //7.调用krpano接口中的方法,加载xml
                let xmlStr = krpano[0].outerHTML;
                this.krpanoAPI.call(`loadxml(${xmlStr}, null, MERGE, BLEND(0.5));`);
            }).catch((error) => {
               console.error('getKrpanoXml error: ' + error);
            });
          },
          setConfigurationPath(krpano, designId) {
            //1. 设置baseDir,配置全景图的路径
            let baseDir = "{0}/{1}/".format(process.env.KRPANOURL, designId);
            krpano.attr("basedir", baseDir);
            //2. 将引入的skin.xml(包含了样式和逻辑)替换成本地的
            let skinXml = '';
            if (process.env.NODE_ENV === 'production') {
              skinXml = `./static/viewer/skin/skin.xml`;
            } else {
              skinXml = `../../../static/viewer/skin/skin.xml`;
            }
            krpano.find('include').attr('url', skinXml);
            //3. 找到包含全景图的标签,配置全景图的路径
            krpano.find("cube").each((i, item) => {
                let imgurl = $(item).attr("url");
                if (!imgurl.startsWith('%')) {
                    $(item).attr('url', '%BASEDIR%/{0}'.format(imgurl));
                }
            });
          },
          setReferInfo(krpano) {
            let designInfo = krpano.find('design_info');
            if (!designInfo) {
              return;
            }

            let boundInfo = designInfo.find('boundInfo');
            if (!boundInfo) { // 旧的全景漫游没有boundInfo
              this.hasMapGPS = false;
            }

            let x = Number(boundInfo.attr('startX'));
            let y = Number(boundInfo.attr('startY'));
            let width = Number(boundInfo.attr('width'));
            let height = Number(boundInfo.attr('height'));
            this.referObj = {
              x: x, // 设计最左端的x坐标
              y: y, // 设计最下端的y坐标
              width: width, // 设计的宽度
              height: height // 设计的长度
            }
          },
          setSceneData(krpano, designId) {
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
                  mark: 'old', // old:标记为已经有的全景图
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
                  let style = $(hsObj).attr('style');
                  let condition = $(hsObj).attr('if');
                  let imgUrl = this.getImgUrl(style);
                  let hotspot = {
                    url: imgUrl,
                    condition: condition,
                    name: hotspotName,
                    ath: ath,
                    atv: atv,
                    linkedscene: linkedscene,
                    style: style
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
              let activeScene = deepClone({}, scenes[0]);
              // 想当前场景中的每个热点添加对应的图片和名称
              this.$store.dispatch('recordActiveScene', activeScene);
            }
            this.$store.dispatch('recordScenes', scenes);
          },
          getImgUrl(style) {
              let imgUrl = '';
              switch(style) {
                case 'hotspot_room':
                  imgUrl = topImg;
                  break;
                case 'hotspot_top':
                  imgUrl = topImg;
                  break;
                case 'hotspot_left_one':
                  imgUrl = leftOneImg;
                  break;
                case 'hotspot_left_two':
                  imgUrl = leftTwoImg;
                  break;
                case 'hotspot_right_one':
                  imgUrl = rightOneImg;
                  break;
                case 'hotspot_right_two':
                  imgUrl = rightTwoImg;
                  break;
                default:
                  break;
              }

              return imgUrl;
          },
          getXYPoint(posX, posY) {
            /**
             * ------------------x
             * │
             * │
             * │         .p(posX, posY)-->设计方案上相机渲染全景图的位置
             * │
             * │
             * │
             * │.p′(this.referObj.x, this.referObj.y)-->设计方案最左下角的坐标位置
             * y
             */
            const imgWidth = 240, // 户型图的宽度
                  imgHeight = 280; // 户型图的高度
            let x = 0, // 对应地图上的x坐标
                y = 0, // 对应地图上的x坐标
                y1 = 0; // 临时坐标
            if (this.referObj.width > this.referObj.height) {
              x = (imgWidth / this.referObj.width) * Math.abs(posX- this.referObj.x);
              y1 = (imgWidth / this.referObj.width) * Math.abs(posY - this.referObj.y);
            } else {
              x = (imgWidth / this.referObj.height) * Math.abs(posX - this.referObj.x);
              y1 = (imgWidth / this.referObj.height) * Math.abs(posY - this.referObj.y);
            }

            if (x >= imgWidth) { // 如果x超出了图片的宽度,取中点
              x = imgWidth * 0.5;
            }

            if (y1 >= imgHeight) { // 如果y1超出了图片的宽度,取中点
              y = imgHeight * 0.5;
            } else {
              y = imgHeight - y1;
            }

            return { // 图片上对应的x,y坐标
              x: x,
              y: y
            }
          },
          getMapXml(krpano) {
            let designId = getUrlParam('guid');
            let map = `${process.env.DESIGNIMGURL}/${designId}/thumbnail.png?` + new Date(),
                radarSwf = '',
                radar = '',
                mapspotactiveImg = '';
            if (process.env.NODE_ENV === 'production') {
              radarSwf = `./static/viewer/skin/radar.swf`;
              radar = `./static/viewer/skin/radar.js`;
              mapspotactiveImg = `./static/viewer/skin/images/vtourskin_mapspotactive.png`;
            } else {
              radarSwf = `../../../static/viewer/skin/radar.swf`;
              radar = `../../../static/viewer/skin/radar.js`;
              mapspotactiveImg = `../../../static/viewer/skin/images/vtourskin_mapspotactive.png`;
            }
            let hotspotLayer = ``;
            let i = 0;
            krpano.find('scene').each((index, item) => {
              let cameraInfo = $(item).find('cameraInfo');
              if (cameraInfo) {
                let posX = Number(cameraInfo.attr('posX'));
                let posY = Number(cameraInfo.attr('posY'));
                let xyPoint = this.getXYPoint(posX, posY);
                let name = 'spot' + i;
                let layer = `<layer name="${name}" style="spot" x="${xyPoint.x}" y="${xyPoint.y}" />`;
                hotspotLayer += layer;
                i++;
              }
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
                    <layer name="activespot" url="${mapspotactiveImg}" scale="0.3" oy="-17" align="lefttop" edge="center" zorder="3" visible="false"/>
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

                activeScene = deepClone({}, scene);
              }
            });

            this.$store.dispatch('recordActiveScene', activeScene);
            this.$store.dispatch('recordScenes', this.scenes);
          },
          addHotSpot(job) {
            if (!this.krpanoAPI) {
              return;
            }

            // 1. 先添加对应的scene
            let sceneName = `scene_${job.ID}`;
            let title = job.RoomTypeDisplayName ? job.RoomTypeDisplayName : '无名称';
            let thumbUrl = job.PreviewUrl + '?' + new Date();
            this.krpanoAPI.call(`addscene(${sceneName})`);
            this.krpanoAPI.set(`scene[${sceneName}].title`, title);
            let scene = {
              mark: 'new', // new:标记为新添加的全景图
              name: sceneName,
              thumbUrl: thumbUrl,
              roomType: title,
              hotspots: []
            };
            this.scenes.push(scene);

            // 2. 添加热点,热点的linkedscene对应场景scene的name,
            // 热点上方显示的文字对应场景scene的title
            let imgUrl = topImg;
            let ath = this.krpanoAPI.get('view.hlookat');
            let atv = this.krpanoAPI.get('view.vlookat');
            let hotspotName = 'spot' + Math.round(Math.random() * 10000000);
            let style = 'hotspot_top';
            this.krpanoAPI.call(`addhotspot(${hotspotName})`);
            this.krpanoAPI.set(`hotspot[${hotspotName}].url`, imgUrl);
            this.krpanoAPI.set(`hotspot[${hotspotName}].ath`, ath);
            this.krpanoAPI.set(`hotspot[${hotspotName}].atv`, atv);
            this.krpanoAPI.set(`hotspot[${hotspotName}].distorted`, false);
            this.krpanoAPI.set(`hotspot[${hotspotName}].style`, style);
            this.krpanoAPI.set(`hotspot[${hotspotName}].linkedscene`, sceneName);
            if ( this.krpanoAPI.get('device.html5') ) {
              this.krpanoAPI.set(`hotspot[${hotspotName}].onclick`, () => {
                  this.hotspotName = hotspotName;
                  window.Bus.$emit(window.EventEnum.SHOW_HOTSPOT_PANEL, hotspotName);
              });
              this.krpanoAPI.call(`set(hotspot[${hotspotName}].ondown, draghotspot(););`);
              this.krpanoAPI.call(`set(hotspot[${hotspotName}].onup, dragmouseup(););`);
              this.krpanoAPI.call(`set(hotspot[${hotspotName}].onloaded, add_all_the_time_tooltip(););`);
            }
            // 3. 更新数据
            let hotspot = {
              url: imgUrl,
              condition: '!webvr.isenabled',
              name: hotspotName,
              ath: ath,
              atv: atv,
              linkedscene: sceneName,
              style: style
            };
            this.scenes.forEach((scene) => {
              if (scene.name === this.activeScene.name) {
                scene.hotspots.push(hotspot);
                let activeScene = deepClone({}, scene);
                this.$store.dispatch('recordActiveScene', activeScene);
              }
            });
          },
          resetHotspots(sceneName) {
            this.scenes.forEach((scene) => {
              if (scene.name === sceneName) {
                this.$store.dispatch('recordActiveScene', deepClone({}, scene));
                let hotspots = scene.hotspots;
                hotspots.forEach((item) => {
                  let hotspotName = item.name;
                  this.krpanoAPI.call("removehotspot(" + hotspotName + ");");
                  this.krpanoAPI.call(`addhotspot(${hotspotName})`);
                  this.krpanoAPI.set(`hotspot[${hotspotName}].if`, item.condition);
                  this.krpanoAPI.set(`hotspot[${hotspotName}].url`, item.url);
                  this.krpanoAPI.set(`hotspot[${hotspotName}].ath`, item.ath);
                  this.krpanoAPI.set(`hotspot[${hotspotName}].atv`, item.atv);
                  this.krpanoAPI.set(`hotspot[${hotspotName}].distorted`, false);
                  this.krpanoAPI.set(`hotspot[${hotspotName}].style`, item.style);
                  this.krpanoAPI.set(`hotspot[${hotspotName}].linkedscene`, item.linkedscene);
                  if ( this.krpanoAPI.get('device.html5') ) {
                    this.krpanoAPI.set(`hotspot[${hotspotName}].onclick`, () => {
                        this.hotspotName = hotspotName;
                        window.Bus.$emit(window.EventEnum.SHOW_HOTSPOT_PANEL, hotspotName);
                    });
                    this.krpanoAPI.call(`set(hotspot[${hotspotName}].ondown, draghotspot(););`);
                    this.krpanoAPI.call(`set(hotspot[${hotspotName}].onup, dragmouseup(););`);
                    this.krpanoAPI.call(`set(hotspot[${hotspotName}].onloaded, add_all_the_time_tooltip(););`);
                  }
                });
              }
            });
          },
        },
    }
</script>

<style lang="scss" scoped>
@import './style/krpano.scss';
</style>
