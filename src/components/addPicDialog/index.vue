<template>
  <el-dialog
    width="500px"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    v-model="addPicData.showAdd"
    :title="getTitle"
  >
    <div class="addPic-wrap">
      <el-form label-width="68px">
        <el-form-item label="上传图片">
          <div class="img-wrap">
            <input
              class="upload-pic"
              ref="uploadPicRef"
              type="file"
              @change="uploadPic"
              style="width: 0px"
            />
            <div
              v-show="!addPicData.src"
              class="addimg-div"
              @click="clickUploadPic"
            >
              <i class="el-icon"><img src="@/assets/plus.svg" alt="" /></i>
            </div>
            <div class="img-content" v-show="addPicData.src">
              <img :src="addPicData.src" alt="" />
              <div class="mesh">
                <ZoomIn
                  style="
                    width: 20px;
                    height: 20px;
                    margin-right: 8px;
                    color: #fff;
                  "
                  @click="isShowBigPic = true"
                />
                <Delete
                  @click="addPicData.src = ''"
                  style="width: 20px; height: 20px; color: #fff"
                />
              </div>
              <el-dialog v-model="isShowBigPic" width="660px">
                <div
                  style="
                    width: 600px;
                    height: 600px;
                    display: flex;
                    justify-content: center;
                  "
                >
                  <img :src="addPicData.src" alt="" />
                </div>
              </el-dialog>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div>
        <div class="total-timeline">
          <div
            v-if="addPicData.showAdd"
            :style="`left: ${addPicData.left}%`"
            class="start-dom"
          ></div>
          <div
            v-if="addPicData.showAdd"
            :style="`left: ${addPicData.right}%`"
            class="end-dom"
          ></div>
        </div>
      </div>
      <div class="time-input">
        <el-input
          style="margin-right: 10px"
          v-model="addPicData.baseStart"
          @blur="changeTime('start')"
        ></el-input>
        -
        <el-input
          style="margin-left: 10px"
          v-model="addPicData.baseEnd"
          @blur="changeTime('end')"
        ></el-input>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addPicData.showAdd = false">取消</el-button>
        <el-button type="primary" :disabled="checkTimeIsNOk()" @click="save"
          >保存</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>
  
  <script setup name="addTxtDailog">
import { reactive, watch, nextTick, ref, computed } from "vue";
import { getSecond, toggleToTime } from "@/services/commonUtils";
import { ZoomIn, Delete } from "@element-plus/icons-vue";
import showPic from "@/services/getUploadFileUrl";
const uploadPicRef = ref(null);
const props = defineProps({
  picData: Object,
  totalTime: String,
  savePic: Function,
});

const getTitle = computed(() => {
  if (addPicData.index > -1) {
    return "编辑文字";
  }
  return "添加文字";
});

const isShowBigPic = ref(false);

function getLineStyle(item) {
  const start = getSecond(item.start);
  const end = getSecond(item.end) + 1;
  const total = getSecond(props.totalTime);
  const left = (start / total) * 100;
  const width = (end / total - start / total) * 100;
  return `left: ${left}%;width: ${width}%`;
}

const addPicData = reactive({
  showAdd: false,
  index: -1,
  src: "",
  start: "00:00:00",
  end: props.totalTime,
  baseStart: "00:00:00",
  baseEnd: props.totalTime,
  left: 0,
  right: 100,
  initData(index) {
    addPicData.index = index === undefined ? -1 : index;
    addPicData.src = props.picData[index]?.src || "";
    addPicData.start = props.picData[index]?.start || "00:00:00";
    addPicData.baseStart = props.picData[index]?.start || "00:00:00";
    addPicData.end = props.picData[index]?.end || props.totalTime;
    addPicData.baseEnd = props.picData[index]?.end || props.totalTime;
    addPicData.left = props.picData[index]?.left || 0;
    addPicData.right = props.picData[index]?.right || 100;
    if (index !== undefined) {
      changeTime();
    }
    addPicData.showAdd = true;
    nextTick(() => {
      createListen();
    });
  },
});
function clickUploadPic() {
  $(".upload-pic").click();
}
function uploadPic() {
  // 一般上传文件是直接存后端路径，然后获取到前端
  const url = showPic(uploadPicRef.value);
  uploadPicRef.value.value = "";
  addPicData.src = url;
}

function createListen() {
  $(".start-dom").mousedown(function (e) {
    const totalRight = $(".total-timeline").offset().left;
    const totalWidth = $(".total-timeline").width();
    $(document).mousemove(function (e) {
      const x = e.pageX + 5 - totalRight;
      let left = (x / totalWidth) * 100;
      if (left > addPicData.right) {
        left = addPicData.right;
      } else if (left < 0) {
        left = 0;
      }
      addPicData.start = toggleToTime(
        (getSecond(props.totalTime) * left) / 100
      );
      addPicData.left = left;
      addPicData.baseStart = addPicData.start;
    });
    $(document).mouseup(function () {
      $(document).off("mousemove");
    });
  });

  $(".end-dom").mousedown(function (e) {
    const totalWidth = $(".total-timeline").width();
    const totalRight = $(".total-timeline").offset().left;

    $(document).mousemove(function (e) {
      const x = e.pageX - totalRight;
      let right = (x / totalWidth) * 100;
      if (right < addPicData.left) {
        right = addPicData.left;
      } else if (right > 100) {
        right = 100;
      }
      addPicData.right = right;
      addPicData.end = toggleToTime((getSecond(props.totalTime) * right) / 100);
      addPicData.baseEnd = addPicData.end;
    });
    $(document).mouseup(function () {
      $(document).off("mousemove");
    });
  });
}

function checkTimeIsNOk() {
  if (!addPicData.src) {
    return true;
  }
  // 检查时间是否有冲突
  let conflictTime = 0;
  props.picData.some((item, index) => {
    if (index === addPicData.index) {
      return false;
    }
    const itemStart = getSecond(item.start);
    const itemEnd = getSecond(item.end);
    const start = getSecond(addPicData.start);
    const end = getSecond(addPicData.end);
    if (
      (itemStart <= start && itemEnd >= start) ||
      (itemStart <= end && itemEnd >= end) ||
      (itemStart >= start && itemEnd <= end)
    ) {
      conflictTime++;
    }
    if (conflictTime >= 3) {
      return true;
    }
  });
  if (conflictTime >= 3) {
    return true;
  }
}

function changeTime(type) {
  if (
    /^\d+[:]\d{1,2}[:]\d{1,2}$/.test(addPicData.baseStart) &&
    /^\d+[:]\d{1,2}[:]\d{1,2}$/.test(addPicData.baseEnd)
  ) {
    let start = getSecond(addPicData.baseStart);
    let end = getSecond(addPicData.baseEnd);
    const tolal = getSecond(props.totalTime);
    if (end > tolal) {
      addPicData.baseEnd = addPicData.end;
    }
    if (end < start) {
      addPicData[type === "start" ? "baseStart" : "baseEnd"] =
        addPicData[type === "start" ? "start" : "end"];
    }
    addPicData.start = addPicData.baseStart;
    addPicData.end = addPicData.baseEnd;
    start = getSecond(addPicData.start);
    end = getSecond(addPicData.end);
    addPicData.left = (start / tolal) * 100;
    addPicData.right = (end / tolal) * 100;
  } else {
    addPicData.baseStart = addPicData.start;
    addPicData.baseEnd = addPicData.end;
  }
}

function save() {
  props.savePic(addPicData);
  addPicData.showAdd = false;
}

watch(addPicData, () => {
  if (!addPicData.showAdd) {
    $(".start-dom").off("mousedown");
    $(".end-dom").off("mousedown");
  }
});

defineExpose({
  addPicData,
  checkTimeIsNOk,
});
</script>
  
<style lang="less" scoped>
@import url(@/css/timeChange.less);
@import url(./css/index.less);
</style>