<template>
  <el-dialog width="500px" v-model="addCaptionsData.showAdd" :title="getTitle">
    <div class="addCaptions-wrap">
      <el-form label-width="70px">
        <el-form-item :label="isCaption ? '轨迹一' : '文字'">
          <el-input v-model="addCaptionsData.txt1" autocomplete="off" />
        </el-form-item>
        <el-form-item v-show="showSecondInput" label="轨迹二">
          <el-input v-model="addCaptionsData.txt2" autocomplete="off" />
        </el-form-item>
        <el-form-item v-show="!isCaption" label="文字大小">
          <el-input-number
            :min="12"
            :max="20"
            size="small"
            controls-position="right"
            :precision="0"
            v-model="addCaptionsData.fontSize"
            style="width: 80px; margin-right: 20px"
          ></el-input-number>
        </el-form-item>
        <el-form-item v-show="!isCaption" label="文字颜色">
          <el-color-picker v-model="addCaptionsData.color" />
        </el-form-item>
      </el-form>
      <div>
        <div class="total-timeline">
          <div
            class="haschoosetime"
            :style="getLineStyle(item)"
            v-for="item in txtData.timeLineList.filter(
              (item, index) => index !== addCaptionsData.index && isCaption
            )"
            :key="item.timestamp"
          ></div>
          <div
            v-if="addCaptionsData.showAdd"
            :style="`left: ${addCaptionsData.left}%`"
            class="start-dom"
          ></div>
          <div
            v-if="addCaptionsData.showAdd"
            :style="`left: ${addCaptionsData.right}%`"
            class="end-dom"
          ></div>
        </div>
      </div>
      <div class="time-input">
        <el-input
          style="margin-right: 10px"
          v-model="addCaptionsData.baseStart"
          @blur="changeTime('start')"
        ></el-input>
        -
        <el-input
          style="margin-left: 10px"
          v-model="addCaptionsData.baseEnd"
          @blur="changeTime('end')"
        ></el-input>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addCaptionsData.showAdd = false">取消</el-button>
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
import { textTypeKey } from "@/services/constService";
const props = defineProps({
  txtData: Object,
  totalTime: String,
  saveTxt: Function,
  isCaption: Boolean,
});

const getTitle = computed(() => {
  if (props.isCaption) {
    if (addCaptionsData.index > -1) {
      return "编辑字幕";
    }
    return "添加字幕";
  }
  if (addCaptionsData.index > -1) {
    return "编辑文字";
  }
  return "添加文字";
});
const showSecondInput = computed(() => {
  return props.txtData.textType === textTypeKey.two && props.isCaption;
});

function getLineStyle(item) {
  const start = getSecond(item.start);
  const end = getSecond(item.end) + 1;
  const total = getSecond(props.totalTime);
  const left = (start / total) * 100;
  const width = (end / total - start / total) * 100;
  return `left: ${left}%;width: ${width}%`;
}

const addCaptionsData = reactive({
  showAdd: false,
  index: -1,
  txt1: "",
  txt2: "",
  start: "00:00:00",
  end: props.totalTime,
  baseStart: "00:00:00",
  baseEnd: props.totalTime,
  left: 0,
  right: 100,
  fontSize: 14,
  color: "#fff",
  initData(index) {
    addCaptionsData.index = index === undefined ? -1 : index;
    addCaptionsData.txt1 = props.txtData.timeLineList[index]?.txt1 || "";
    addCaptionsData.txt2 = props.txtData.timeLineList[index]?.txt2 || "";
    addCaptionsData.start =
      props.txtData.timeLineList[index]?.start || "00:00:00";
    addCaptionsData.baseStart =
      props.txtData.timeLineList[index]?.start || "00:00:00";
    addCaptionsData.end =
      props.txtData.timeLineList[index]?.end || props.totalTime;
    addCaptionsData.baseEnd =
      props.txtData.timeLineList[index]?.end || props.totalTime;
    addCaptionsData.left = props.txtData.timeLineList[index]?.left || 0;
    addCaptionsData.right = props.txtData.timeLineList[index]?.right || 100;
    addCaptionsData.fontSize =
      props.txtData.timeLineList[index]?.fontSize || 14;
    addCaptionsData.color = props.txtData.timeLineList[index]?.color || "#fff";
    if (index !== undefined) {
      changeTime();
    }
    addCaptionsData.showAdd = true;
    nextTick(() => {
      createListen();
    });
  },
});
watch(addCaptionsData, () => {
  if (!addCaptionsData.fontSize) {
    addCaptionsData.fontSize = 14;
  }
});
function createListen() {
  $(".start-dom").mousedown(function (e) {
    const totalRight = $(".total-timeline").offset().left;
    const totalWidth = $(".total-timeline").width();
    $(document).mousemove(function (e) {
      const x = e.pageX + 5 - totalRight;
      let left = (x / totalWidth) * 100;
      if (left > addCaptionsData.right) {
        left = addCaptionsData.right;
      } else if (left < 0) {
        left = 0;
      }
      addCaptionsData.start = toggleToTime(
        (getSecond(props.totalTime) * left) / 100
      );
      addCaptionsData.left = left;
      addCaptionsData.baseStart = addCaptionsData.start;
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
      if (right < addCaptionsData.left) {
        right = addCaptionsData.left;
      } else if (right > 100) {
        right = 100;
      }
      addCaptionsData.right = right;
      addCaptionsData.end = toggleToTime(
        (getSecond(props.totalTime) * right) / 100
      );
      addCaptionsData.baseEnd = addCaptionsData.end;
    });
    $(document).mouseup(function () {
      $(document).off("mousemove");
    });
  });
}

function checkTimeIsNOk() {
  if (!props.isCaption) {
    return false;
  }
  // 检查时间是否有冲突
  return props.txtData.timeLineList.some((item, index) => {
    if (index === addCaptionsData.index) {
      return false;
    }
    const itemStart = getSecond(item.start);
    const itemEnd = getSecond(item.end);
    const start = getSecond(addCaptionsData.start);
    const end = getSecond(addCaptionsData.end);
    if (
      (itemStart <= start && itemEnd >= start) ||
      (itemStart <= end && itemEnd >= end)
    ) {
      return true;
    }
    return false;
  });
}

function changeTime(type) {
  if (
    /^\d+[:]\d{1,2}[:]\d{1,2}$/.test(addCaptionsData.baseStart) &&
    /^\d+[:]\d{1,2}[:]\d{1,2}$/.test(addCaptionsData.baseEnd)
  ) {
    let start = getSecond(addCaptionsData.baseStart);
    let end = getSecond(addCaptionsData.baseEnd);
    const tolal = getSecond(props.totalTime);
    if (end > tolal) {
      addCaptionsData.baseEnd = addCaptionsData.end;
    }
    if (end < start) {
      addCaptionsData[type === "start" ? "baseStart" : "baseEnd"] =
        addCaptionsData[type === "start" ? "start" : "end"];
    }
    addCaptionsData.start = addCaptionsData.baseStart;
    addCaptionsData.end = addCaptionsData.baseEnd;
    start = getSecond(addCaptionsData.start);
    end = getSecond(addCaptionsData.end);
    addCaptionsData.left = (start / tolal) * 100;
    addCaptionsData.right = (end / tolal) * 100;
  } else {
    addCaptionsData.baseStart = addCaptionsData.start;
    addCaptionsData.baseEnd = addCaptionsData.end;
  }
}

function save() {
  props.saveTxt(addCaptionsData);
  addCaptionsData.showAdd = false;
}

watch(addCaptionsData, () => {
  if (!addCaptionsData.showAdd) {
    $(".start-dom").off("mousedown");
    $(".end-dom").off("mousedown");
  }
});

defineExpose({
  addCaptionsData,
  checkTimeIsNOk,
});
</script>

<style lang="less" scoped>
@import url(@/css/timeChange.less);
</style>