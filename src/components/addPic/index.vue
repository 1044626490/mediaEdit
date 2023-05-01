<template>
  <div class="pic-list">
    <div
      class="pic-item"
      v-for="(item, index) in picData"
      @contextmenu="openImgEdit($event, index)"
      @click.stop
      :key="index"
    >
      <img @click="addPicData(index)" :src="item.src" alt="" />
      <span class="pic-item-time">{{ item.start }} - {{ item.end }}</span>
    </div>
    <addPicDialog
      ref="addPicDialogRef"
      :picData="picData"
      :totalTime="totalTime"
      :savePic="savePic"
    ></addPicDialog>
  </div>
</template>

<script setup name="addPic">
import { getSecond } from "@/services/commonUtils";
import { ref, reactive } from "vue";
import { menusEvent } from "vue3-menus";

const props = defineProps({
  totalTime: String,
  picEdit: Object,
});

const addPicDialogRef = ref(null);

const picData = reactive([]);

function addPicData(index) {
  if (getSecond(props.totalTime) > 0) {
    addPicDialogRef.value.addPicData.initData(index);
    props.picEdit?.cancel();
  }
}

function savePic(newData) {
  const { src, start, end, index } = newData;
  const data = {
    src,
    start,
    end,
    timestamp: `${start} - ${end}`,
  };
  if (index !== -1) {
    Object.assign(picData[index], data);
  } else {
    Object.assign(data, {
      width: 200,
      height: 200,
      rotate: 0,
      left: "50%",
      top: "50%",
    });
    picData.push(data);
  }
}
function saveEditPic(index) {
  const { left, top, rotate, width, height, cancel } = props.picEdit;
  Object.assign(picData[index], {
    left,
    top,
    rotate,
    width,
    height,
  });
  cancel();
}
const menus = reactive({
  index: -1,
  menus: [
    {
      label: "修改位置",
      click: () => {
        props.picEdit.init(picData[menus.index], menus.index);
      },
    },
    {
      label: "删除",
      click: () => {
        if (menus.index === props.picEdit.index && props.picEdit.show) {
          props.picEdit.cancel();
        }
        if (props.picEdit.index > menus.index) {
          props.picEdit.resetIndex(props.picEdit.index - 1);
        }
        picData.splice(menus.index, 1);
      },
    },
  ],
});
function openImgEdit(event, index) {
  menus.index = index;
  menusEvent(event, menus);
  event.preventDefault();
}
defineExpose({
  addPicData,
  picData,
  saveEditPic,
});
</script>

<style lang="less" scoped>
@import url(./css/index.less);
</style>