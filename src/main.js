import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index";
import { directive, Vue3Menus } from "vue3-menus";
import resizable from "./services/resizable";
import draggable from "vuedraggable";

import "./style.css";

// vue video插件

const app = createApp(App);

app.use(router);
app.use(resizable);

app.component("draggable", draggable);
app.component("vue3-menus", Vue3Menus);
app.directive("menus", directive);

app.mount("#app");
