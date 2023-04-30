<template>
  <div class="txt-wrap">
    <div class="header-txt">
      <div>
        <el-radio-group
          v-if="showRadio"
          v-model="txtData.textType"
          class="ml-4"
        >
          <el-radio :label="1">单轨字幕</el-radio>
          <el-radio :label="2">双轨字幕</el-radio>
        </el-radio-group>
      </div>
      <div
        :class="{ disabled: !canaddCaptions }"
        @click="addCaptions(-1)"
        class="right-operator"
      >
        <el-text class="mx-1">{{ getAddName }}</el-text>
        <Plus style="width: 1em; height: 1em; margin-left: 10px; color: #000" />
      </div>
    </div>
    <div class="caption-edit" v-if="isCaption">
      <span>字幕大小</span>
      <el-input-number
        :min="12"
        :max="20"
        size="small"
        controls-position="right"
        :precision="0"
        v-model="capTionData.fontSize"
        style="width: 80px; margin-right: 20px"
      ></el-input-number>
      <span>字幕颜色</span>
      <el-color-picker v-model="capTionData.color" />
    </div>
    <div class="txt-line">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in txtData.timeLineList"
          :key="activity.timestamp"
          :timestamp="activity.timestamp"
        >
          <div @click="addCaptions(index)">
            {{ ` ${activity.txt1} ` }}
          </div>
          <div @click="addCaptions(index)" v-show="!checkIsOneLine">
            {{ ` ${activity.txt2} ` }}
          </div>
          <div>
            <span
              v-if="!showRadio && wordEdit.index !== index"
              class="editPosition"
              @click="wordEdit.init(activity, index)"
              >修改位置</span
            >
            <span
              v-if="showRadio || wordEdit.index !== index"
              class="editPosition"
              @click="deleteTxt(index)"
              >删除</span
            >
            <span
              v-if="!showRadio && wordEdit.index === index"
              class="editPosition"
              @click="saveEditWord(index)"
              >保存</span
            >
            <span
              v-if="!showRadio && wordEdit.index === index"
              class="editPosition"
              @click="wordEdit.cancel()"
              >取消</span
            >
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
    <addTxtDialog
      ref="addTxtDialogRef"
      :txtData="txtData"
      :totalTime="totalTime"
      :isCaption="isCaption"
      :saveTxt="saveTxt"
    ></addTxtDialog>
  </div>
</template>

<script setup name="addCaptions">
import { ref, reactive, computed, watch } from "vue";
import { Plus } from "@element-plus/icons-vue";
import addTxtDialog from "@/components/addTxtDialog/index.vue";
import { getSecond } from "@/services/commonUtils";
import { textTypeKey } from "@/services/constService";

const addTxtDialogRef = ref(null);

const props = defineProps({
  isCaption: Boolean,
  totalTime: String,
  currentTime: String,
  wordEdit: Object,
});
const showRadio = computed(() => {
  return props.isCaption;
});
const getAddName = computed(() => {
  return props.isCaption ? "添加字幕" : "添加文字";
});
const canaddCaptions = computed(() => {
  return getSecond(props.totalTime) > 0;
});
const capTionData = reactive({
  fontSize: 14,
  color: "#fff",
});
watch(capTionData, () => {
  if (!capTionData.fontSize) {
    capTionData.fontSize = 14;
  }
});
// 字幕/文字数据
const txtData = reactive({
  textType: textTypeKey.one, // 默认为单轨字幕
  timeLineList: [],
});
function deleteTxt(index) {
  if (index < props.wordEdit.index && props.wordEdit.show) {
    props.wordEdit.resetIndex(props.wordEdit.index - 1);
  }
  txtData.timeLineList.splice(index, 1);
}
const checkIsOneLine = computed(() => {
  return txtData.textType === textTypeKey.one;
});

function addCaptions(index) {
  if (getSecond(props.totalTime) > 0) {
    addTxtDialogRef.value.addCaptionsData.initData(index);
    !props.isCaption && props.wordEdit.cancel();
  }
}

function saveTxt(newData) {
  const { txt1, txt2, start, end, index, fontSize, color } = newData;
  const data = {
    txt1,
    txt2,
    start,
    end,
    timestamp: `${start} - ${end}`,
    fontSize,
    color,
  };
  if (index !== -1) {
    Object.assign(txtData.timeLineList[index], data);
  } else {
    data.left = "50%";
    data.top = "50%";
    txtData.timeLineList.push(data);
  }
}

function saveEditWord(index) {
  const { top, left, cancel } = props.wordEdit;
  txtData.timeLineList[index].top = top;
  txtData.timeLineList[index].left = left;
  cancel();
}

defineExpose({
  addCaptions,
  txtData,
  capTionData,
  saveEditWord,
});
</script>

<style lang="less" scoped>
@import url(./css/index.less);
</style>