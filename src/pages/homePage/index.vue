<template>
  <div class="homepage-wrap">
    <div class="left-wrap">
      <div class="video-wrap">
        <div class="no-src" v-if="!playerOptions.src">
          <b @click="clickUploadMV">请上传视频</b>
        </div>
        <videoPlay
          class="video-player vjs-custom-skin"
          ref="videoPlayerRef"
          v-bind="playerOptions"
        ></videoPlay>
        <div
          v-show="captionPosition.show"
          :style="`left: ${captionPosition.changeLeft};top: ${captionPosition.changeTop};`"
          class="captions-position change-position"
          @contextmenu="captionPosition.captionMenu"
          @click.stop
        >
          <div>字幕1</div>
          <div>字幕2</div>
        </div>
        <div
          v-show="wordEdit.show"
          :style="`left: ${wordEdit.left};top: ${wordEdit.top};`"
          class="word-position change-position"
          @contextmenu="wordEdit.wordMenu"
          @click.stop
        >
          {{ wordEdit.word }}
        </div>
        <div
          v-show="picEdit.show"
          :style="`margin: -${picEdit.width / 2}px;left: ${picEdit.left};top: ${
            picEdit.top
          };width: ${picEdit.width}px;height: ${
            picEdit.height
          }px;transform: rotate(${picEdit.rotate}deg);`"
          class="img-position change-position"
          @contextmenu="picEdit.imgMenu"
          @click.stop
          v-resizable="picEdit"
        >
          <div class="mesh"></div>
          <img :src="picEdit.src" alt="" />
          <div class="rotate-img">
            <img
              @mousedown="picEdit.rotateChange('left', true)"
              @click="picEdit.rotateChange('left', false)"
              @mouseleave="picEdit.rotateChange('left', false)"
              src="@/assets/acrotate.svg"
              alt=""
            />
            <img
              @mousedown="picEdit.rotateChange('right', true)"
              @click="picEdit.rotateChange('right', false)"
              @mouseleave="picEdit.rotateChange('right', false)"
              src="@/assets/cwrotate.svg"
              alt=""
            />
          </div>
        </div>
        <div class="all-content">
          <div
            v-for="(item, index) in showContent.img"
            :key="index"
            :style="`margin: -${item.width / 2}px;left: ${item.left};top: ${
              item.top
            };width: ${item.width}px;height: ${
              item.height
            }px;transform: rotate(${item.rotate}deg);`"
            class="img-position change-position no-border"
          >
            <img :src="item.src" alt="" />
          </div>
          <div
            v-for="(item, index) in showContent.word"
            :key="index"
            :style="`left: ${item.left};top: ${item.top};font-size: ${item.fontSize}px;color: ${item.color}`"
            class="word-position change-position no-border"
          >
            {{ item.txt1 }}
          </div>
          <div
            v-for="(item, index) in showContent.caption"
            :key="index"
            :style="`left: ${captionPosition.left};top: ${captionPosition.top};font-size: ${item.fontSize}px;color: ${item.color}`"
            class="captions-position change-position no-border"
          >
            <div>{{ item.txt1 }}</div>
            <div v-show="textType === 2">
              {{ item.txt2 }}
            </div>
          </div>
        </div>
      </div>
      <div class="operator">
        <div class="middel-operator-button">
          <input
            class="upload-mv"
            ref="uploadMVRef"
            type="file"
            @change="uploadMV"
            style="width: 0px"
          />
          <el-button @click="clickUploadMV">上传视频</el-button>
          <el-button @click="addNewPic">新增图片</el-button>
          <el-button
            @click="captionPosition.show = true"
            v-show="!captionPosition.show"
            >修改字幕位置</el-button
          >
          <el-button :disabled="!playerOptions.src" @click="exportData.init"
            >导出</el-button
          >
        </div>
        <el-dialog title="导出数据" v-model="exportData.showJson">
          <div class="export-wrap">
            <json-viewer :value="exportData.data"></json-viewer>
          </div>
        </el-dialog>
        <div class="video-pic-wrap">
          <draggable
            :list="playerOptions.videoList"
            ghost-class="ghost"
            chosen-class="chosenClass"
            animation="300"
            @start="drag = true"
            @end="dragEnd"
            item-key="start"
            class="video-list"
          >
            <template #item="{ element, index }">
              <div class="video-item">
                <el-popover
                  :visible="
                    videoEdit.showSplitVideo && videoEdit.index === index
                  "
                  placement="top"
                  :width="500"
                >
                  <div @mouseleave="videoEdit.showSplitVideo = false">
                    <div
                      class="video-timeline"
                      v-if="
                        videoEdit.showSplitVideo && videoEdit.index === index
                      "
                    >
                      <div class="time">
                        {{ videoEdit.start }}
                      </div>
                      <div class="total-timeline">
                        <div
                          :style="`left: ${videoEdit.left}%`"
                          class="start-dom"
                        ></div>
                      </div>
                      <div class="time">
                        {{ videoEdit.end }}
                      </div>
                    </div>
                    <div class="time-input">
                      <el-input
                        v-model="videoEdit.backSplitPointTime"
                        @blur="videoEdit.editTime"
                      ></el-input>
                    </div>
                    <div class="footer-button">
                      <el-button @click="videoEdit.deleteVideo">删除</el-button>
                      <el-button
                        :disabled="videoEdit.totalStart === videoEdit.totalEnd"
                        type="primary"
                        @click="videoEdit.split"
                        >切割</el-button
                      >
                    </div>
                  </div>
                  <template #reference>
                    <div @click="videoEdit.init(index)">
                      <img :src="element.src" alt="" />
                      <span class="video-item-time"
                        >{{ element.start }} - {{ element.end }}</span
                      >
                    </div>
                  </template>
                </el-popover>
              </div>
            </template>
          </draggable>
          <addPic
            ref="addPicRef"
            :picEdit="picEdit"
            :totalTime="mediaData.totalTime"
          ></addPic>
        </div>
      </div>
    </div>
    <div class="txt-line">
      <el-tabs v-model="rightTabData.activeName" class="demo-tabs">
        <el-tab-pane
          :label="rightTabData.tabList[0].label"
          :name="rightTabData.tabList[0].name"
        >
          <addCaptions
            :isCaption="true"
            :totalTime="mediaData.totalTime"
            ref="addCaptionsRef"
          ></addCaptions>
        </el-tab-pane>
        <el-tab-pane
          :label="rightTabData.tabList[1].label"
          :name="rightTabData.tabList[1].name"
        >
          <addCaptions
            :isCaption="false"
            :totalTime="mediaData.totalTime"
            ref="addWordRef"
            :wordEdit="wordEdit"
          ></addCaptions>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="header-wrap"></div>
  </div>
</template>

<script setup name="homePage">
import { ref, reactive, onMounted, nextTick, watch, computed } from "vue";
import { menusEvent } from "vue3-menus";
import showPic from "@/services/getUploadFileUrl";
import { tabName, textTypeKey } from "@/services/constService";
import addCaptions from "@/components/addCaption/index.vue";
import addPic from "@/components/addPic/index.vue";
import videoPlay from "@/components/vue3VideoPlay/video-play/main.vue";
import { getSecond, toggleToTime } from "@/services/commonUtils";

const videoPlayerRef = ref(null);
const uploadMVRef = ref(null);
const addCaptionsRef = ref(null);
const addWordRef = ref(null);
const addPicRef = ref(null);
// 用于视频展示判断是否是单轨道
const textType = ref(textTypeKey.one);

// 导出展示
const exportData = reactive({
  data: {},
  showJson: false,
  init() {
    // 视频数据
    const videoData = {
      videoList: playerOptions.videoList, // 视频列表，按顺序播放
      src: playerOptions.src, // 视频路径（一般导入到后端，src获取来源于后端）
    };
    // 字幕数据
    const { left, top } = captionPosition;
    const { color, fontSize } = addCaptionsRef.value.capTionData;
    const captionData = {
      commonCaptionData: {
        left,
        top,
        color,
        fontSize,
      },
      txtData: addCaptionsRef.value.txtData.timeLineList, // 字幕数组
      textType: addCaptionsRef.value.txtData.textType, // 轨道类型
    };
    // 文字数据
    const wordData = {
      txtData: addWordRef.value.txtData.timeLineList, // 文字数组
    };
    // 图片数据
    const imgData = {
      picData: addPicRef.value.picData, // 图片数组
    };
    exportData.data = {
      videoData,
      captionData,
      wordData,
      imgData,
    };
    exportData.showJson = true;
  },
});

// 视频播放时，各个时间应该展示的内容
const showContent = reactive({
  img: [],
  word: [],
  caption: [],
});

// 视频data
const playerOptions = reactive({
  width: "800px", //播放器高度
  height: "450px", //播放器高度
  color: "#409eff", //主题色
  title: "", //视频名称
  src: "", //视频源
  muted: false, //静音
  webFullScreen: false,
  speedRate: ["0.75", "1.0", "1.25", "1.5", "2.0"], //播放倍速
  autoPlay: false, //自动播放
  loop: false, //循环播放
  mirror: false, //镜像画面
  ligthOff: true, //关灯模式
  volume: 1, //默认音量大小
  control: true, //是否显示控制
  controlBtns: ["audioTrack", "quality", "volume"], //显示所有按钮,
  loadVideoOver, // 加载视频完成后回调
  videoList: [], // 视频列表
  changeShowContent(currentTime) {
    // 时间变换时修改展示的内容
    if (addPicRef.value && addWordRef.value && addCaptionsRef.value) {
      textType.value = addCaptionsRef.value.txtData.textType;
      showContent.img = addPicRef.value?.picData.filter(
        (item) =>
          getSecond(item.start) <= currentTime &&
          getSecond(item.end) >= currentTime
      );
      showContent.word = addWordRef.value?.txtData.timeLineList.filter(
        (item) =>
          getSecond(item.start) <= currentTime &&
          getSecond(item.end) >= currentTime
      );
      showContent.caption = addCaptionsRef.value?.txtData.timeLineList.filter(
        (item) => {
          item.color = addCaptionsRef.value.capTionData.color;
          item.fontSize = addCaptionsRef.value.capTionData.fontSize;
          return (
            getSecond(item.start) <= currentTime &&
            getSecond(item.end) >= currentTime
          );
        }
      );
    }
  },
});

const mediaData = reactive({
  totalTime: "00:00:00", // 总时长
});
// 上传视频
function clickUploadMV() {
  $(".upload-mv").click();
}
function uploadMV() {
  // 一般上传文件是直接存后端路径，然后获取到前端
  const url = showPic(uploadMVRef.value);
  uploadMVRef.value.value = "";
  playerOptions.src = url;
  nextTick(() => {
    videoPlayerRef.value.pause();
    videoPlayerRef.value.duration;
  });
}
// 分割视频时间点监听
function createSplitDom() {
  $(".start-dom").mousedown(function (e) {
    const totalRight = $(".total-timeline").offset().left;
    const totalWidth = $(".total-timeline").width();
    $(document).mousemove(function (e) {
      const x = e.pageX + 5 - totalRight;
      let left = (x / totalWidth) * 100;
      if (left > 100) {
        left = 100;
      } else if (left < 0) {
        left = 0;
      }
      videoEdit.splitPoint =
        (videoEdit.totalEnd - videoEdit.totalStart) * (left / 100) +
        videoEdit.totalStart;
      videoEdit.left = left;
      videoEdit.splitPointTime = toggleToTime(videoEdit.splitPoint);
      videoEdit.backSplitPointTime = videoEdit.splitPointTime;
    });
    $(document).mouseup(function () {
      $(document).off("mousemove");
    });
  });
}
// 视频编辑对象
const videoEdit = reactive({
  showSplitVideo: false,
  index: -1,
  start: "00:00:00",
  end: mediaData.totalTime,
  splitPoint: 0,
  splitPointTime: "",
  backSplitPointTime: "",
  left: 0,
  totalEnd: 0,
  totalStart: 0,
  init(index) {
    // 初始化数据
    videoEdit.index = index;
    videoEdit.start = playerOptions.videoList[index].start;
    videoEdit.end = playerOptions.videoList[index].end;
    videoEdit.showSplitVideo = true;
    videoEdit.totalEnd = getSecond(videoEdit.end);
    videoEdit.totalStart = getSecond(videoEdit.start);
    videoEdit.splitPoint = parseInt(
      (videoEdit.totalEnd + 1) / 2 + videoEdit.totalStart / 2
    );
    videoEdit.left =
      ((videoEdit.splitPoint - videoEdit.totalStart) /
        (videoEdit.totalEnd - videoEdit.totalStart)) *
      100;
    videoEdit.splitPointTime = toggleToTime(videoEdit.splitPoint);
    videoEdit.backSplitPointTime = videoEdit.splitPointTime;
    nextTick(createSplitDom);
  },
  split() {
    // 分割
    videoPlayerRef.value.screentShotFn(videoEdit.splitPoint, (res) => {
      let end = videoEdit.splitPoint;
      let start = videoEdit.splitPoint;
      if (end === videoEdit.totalEnd) {
        end--;
      } else {
        if (start === videoEdit.totalStart) {
          start = videoEdit.splitPointTime + 1;
        } else {
          start++;
        }
      }
      end = toggleToTime(end);
      start = toggleToTime(start);
      playerOptions.videoList.splice(
        videoEdit.index,
        1,
        Object.assign({}, playerOptions.videoList[videoEdit.index], {
          end,
        }),
        Object.assign({}, playerOptions.videoList[videoEdit.index], {
          start,
          src: res,
        })
      );
      videoEdit.showSplitVideo = false;
    });
  },
  deleteVideo() {
    // 删除
    playerOptions.videoList.splice(videoEdit.index, 1);
    videoEdit.showSplitVideo = false;
    if (playerOptions.videoList.length) {
      const duration = playerOptions.videoList.reduce((num, item) => {
        num += getSecond(item.end) - getSecond(item.start) + 1;
        return num;
      }, 0);
      videoPlayerRef.value.setDuration(duration === 0 ? 0 : duration - 1);
    } else {
      playerOptions.src = "";
      videoPlayerRef.value.setDuration(0);
    }
  },
  editTime() {
    // 编辑时间点blur函数
    if (/^\d+[:]\d{1,2}[:]\d{1,2}$/.test(videoEdit.backSplitPointTime)) {
      let end = getSecond(videoEdit.backSplitPointTime);
      const tolal = videoEdit.totalEnd;
      const start = videoEdit.totalStart;
      if (end > tolal) {
        videoEdit.backSplitPointTime = videoEdit.splitPointTime;
      }
      videoEdit.splitPointTime = videoEdit.backSplitPointTime;
      videoEdit.splitPoint = getSecond(videoEdit.splitPointTime);
      videoEdit.left = ((videoEdit.splitPoint - start) / (tolal - start)) * 100;
    } else {
      videoEdit.backSplitPointTime = videoEdit.splitPointTime;
    }
  },
});
// 关闭监听
watch(videoEdit, () => {
  if (!videoEdit.showSplitVideo) {
    $(".start-dom").off("mousedown");
  }
});
// 视频拖拽参数
const drag = ref(false);
// 拖拽结束回调
function dragEnd(evt) {
  const duration = playerOptions.videoList.reduce((num, item) => {
    num += getSecond(item.end) - getSecond(item.start) + 1;
    return num;
  }, 0);
  videoPlayerRef.value.setDuration(duration);
  evt.preventDefault();
}
// 初始化加载视频回调
function loadVideoOver(totalTime) {
  mediaData.totalTime = totalTime;
  playerOptions.videoList.splice(0);
  videoPlayerRef.value.screentShotFn(0, (res) => {
    playerOptions.videoList.push({
      start: "00:00:00",
      end: totalTime,
      src: res,
    });
  });
}
// 字幕定位数据
const captionPosition = reactive({
  show: false,
  left: "50%",
  top: "50%",
  changeLeft: "50%",
  changeTop: "50%",
  menus: [
    // 右键菜单
    {
      label: "保存",
      click: () => {
        captionPosition.save();
      },
    },
    {
      label: "取消",
      click: () => {
        captionPosition.cancel();
      },
    },
  ],
  captionMenu(event) {
    menusEvent(event, captionPosition);
    event.preventDefault();
  },
  save() {
    this.left = this.changeLeft;
    this.top = this.changeTop;
    this.show = false;
  },
  cancel() {
    this.changeLeft = this.left;
    this.changeTop = this.top;
    this.show = false;
  },
});
// 添加图片
function addNewPic() {
  addPicRef.value.addPicData();
}
// 右侧tab数据
const rightTabData = reactive({
  activeName: Object.keys(tabName)[0],
  tabList: Object.keys(tabName).map((item) => ({
    label: tabName[item],
    name: item,
  })),
});

// 字幕轨迹拖拽修改位置
function addCaptionsDomDrag(className) {
  const isCaption = className === ".captions-position";
  const isImg = className === ".img-position .mesh";
  const imgWrapDom = $(".img-position");
  const dom = $(className);
  dom.mousedown(function (e) {
    const totalWidth = $(".video-wrap").width();
    const totalHeight = $(".video-wrap").height();
    let offleft = dom.offset().left - 20;
    let offTop = dom.offset().top - 20;
    if (!isCaption) {
      if (isImg) {
        offleft += imgWrapDom.width() / 2;
        offTop += imgWrapDom.height() / 2;
        offleft += 10;
        offTop += 10;
      } else {
        offTop += dom.height() / 2;
        offleft += dom.width() / 2;
        offleft += 10;
      }
    } else {
      offTop += dom.height() / 2;
    }
    let startX = e.clientX;
    let startY = e.clientY;

    document.onmousemove = function (event) {
      event = event || window.event;
      let moveX = event.clientX - startX;
      let moveY = event.clientY - startY;

      const left =
        ((offleft + moveX) / totalWidth + (isCaption ? 0.5 : 0)) * 100;
      let top = ((offTop + moveY) / totalHeight) * 100;

      if (top < 0) {
        top = 0;
      }
      if (top > 100) {
        top = 100;
      }

      // 元素最终位置
      if (isCaption) {
        captionPosition.changeLeft = left + "%";
        captionPosition.changeTop = top + "%";
      } else if (isImg) {
        picEdit.left = left + "%";
        picEdit.top = top + "%";
      } else {
        wordEdit.left = left + "%";
        wordEdit.top = top + "%";
      }
    };
    document.onmouseup = function () {
      document.onmousemove = document.onmouseup = null;
    };
  });
}
// 文字编辑
const wordEdit = reactive({
  show: false,
  word: "",
  left: "50%",
  top: "50%",
  index: -1,
  menus: [
    {
      label: "保存",
      click: () => {
        addWordRef.value.saveEditWord(wordEdit.index);
      },
    },
    {
      label: "取消",
      click: () => {
        wordEdit.cancel();
      },
    },
  ],
  wordMenu(event) {
    menusEvent(event, wordEdit);
    event.preventDefault();
  },
  resetIndex(index) {
    wordEdit.index = index;
  },
  init(data, index) {
    wordEdit.index = index;
    wordEdit.show = true;
    wordEdit.left = data.left;
    wordEdit.top = data.top;
    wordEdit.word = data.txt1;
  },
  cancel() {
    wordEdit.index = -1;
    wordEdit.show = false;
    wordEdit.left = "50%";
    wordEdit.top = "50%";
    wordEdit.word = "";
  },
});
// 图片编辑
const picEdit = reactive({
  show: false,
  src: "",
  left: "50%",
  top: "50%",
  width: 200,
  height: 200,
  rotate: 0,
  side: "right, bottom",
  index: -1,
  interval: null,
  menus: [
    {
      label: "保存",
      click: () => {
        addPicRef.value.saveEditPic(picEdit.index);
      },
    },
    {
      label: "取消",
      click: () => {
        picEdit.cancel();
      },
    },
  ],
  resetIndex(index) {
    picEdit.index = index;
  },
  imgMenu(event) {
    menusEvent(event, picEdit);
    event.preventDefault();
  },
  rotateChange(type, isStart) {
    clearInterval(picEdit.interval);
    if (isStart) {
      picEdit.interval = setInterval(() => {
        if (type === "left") {
          picEdit.rotate = picEdit.rotate === 0 ? 360 : picEdit.rotate;
          picEdit.rotate--;
          if (picEdit.rotate === 0) {
            picEdit.rotate = 360;
          }
        } else {
          picEdit.rotate = picEdit.rotate === 360 ? 0 : picEdit.rotate;
          picEdit.rotate++;
          if (picEdit.rotate === 360) {
            picEdit.rotate = 0;
          }
        }
      }, 25);
    }
  },
  init(data, index) {
    picEdit.index = index;
    picEdit.show = true;
    picEdit.width = data.width;
    picEdit.height = data.height;
    picEdit.rotate = data.rotate;
    picEdit.left = data.left;
    picEdit.top = data.top;
    picEdit.src = data.src;
  },
  cancel() {
    picEdit.index = -1;
    picEdit.show = false;
    picEdit.left = "50%";
    picEdit.top = "50%";
    picEdit.src = "";
  },
});
onMounted(() => {
  addCaptionsDomDrag(".captions-position");
  addCaptionsDomDrag(".word-position");
  addCaptionsDomDrag(".img-position .mesh");
});
</script>

<style lang="less" scoped>
@import url(@/css/timeChange.less);
@import url(./css/index.less);
.time-input {
  margin-bottom: 20px;
}
:deep(.el-dialog__body) {
  max-height: 70vh;
  overflow: hidden;
  .export-wrap {
    max-height: 70vh;
    overflow: auto;
  }
}
</style>