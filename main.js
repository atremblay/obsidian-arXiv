/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => main_default
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var DEFAULT_SETTINGS = {
  mySetting: "",
  enableRibbonIcon: false
};
var ArxivPlugin = class extends import_obsidian.Plugin {
  async fetchPaper(paperId, paperName) {
    if (paperId) {
      try {
        const data = await this.fetchPaperData(paperId, paperName);
        await this.createNote(data);
      } catch (error) {
        console.error("Error fetching paper data:", error);
        new import_obsidian.Notice(`Error fetching paper data: ${paperId}`);
      }
    }
  }
  fetchPaperData(id, name) {
    return new Promise((resolve2, reject) => {
      const url = `http://export.arxiv.org/api/query?id_list=${id}`;
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onreadystatechange = () => {
        var _a, _b, _c, _d, _e;
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xhr.responseText, "application/xml");
            const entry = xmlDoc.querySelector("entry");
            if (entry) {
              const title = ((_a = entry.querySelector("title")) == null ? void 0 : _a.textContent) || "No Title";
              const authors = Array.from(entry.querySelectorAll("author name")).map((el) => el.textContent).join(", ") || "No Authors";
              const publicationDateRaw = (_b = entry.querySelector("published")) == null ? void 0 : _b.textContent;
              const publicationDate = publicationDateRaw ? new Date(publicationDateRaw).toISOString().split("T")[0] : "No Publication Date";
              const url2 = ((_c = entry.querySelector("id")) == null ? void 0 : _c.textContent) || "No URL";
              let summary = ((_d = entry.querySelector("summary")) == null ? void 0 : _d.textContent) || "No Summary";
              summary = summary.replace(/(\r\n|\n|\r)/gm, " ").trim();
              const pdfLink = ((_e = xmlDoc.querySelector('link[title="pdf"]')) == null ? void 0 : _e.getAttribute("href")) || "No PDF Link";
              if (name === void 0) {
                name = id;
              }
              resolve2({ title, authors, publicationDate, summary, id, url: url2, pdfLink, name });
            } else {
              reject(new Error("No entry found in the response"));
            }
          } else {
            reject(new Error("Failed to fetch data"));
          }
        }
      };
      xhr.send();
    });
  }
  async createNote(data) {
    const authorsList = data.authors.split(", ").map((author) => `  - "${author}"`).join("\n");
    const frontMatter = `---
title: "${data.title}"
authors:
${authorsList}
published: "${data.publicationDate}"
arXiv: "${data.url}"
paper: "${data.pdfLink}"
---
`;
    const content = `
#### Abstract

${data.summary}
		`;
    await this.app.vault.create(`${this.settings.mySetting}/${data.name}.md`, frontMatter + content);
    new import_obsidian.Notice(`Created note: ${data.name}`);
  }
  async onload() {
    await this.loadSettings();
    this.addCommand({
      id: "open-arXiv-modal",
      name: "Fetch arXiv paper info",
      callback: () => {
        new ArXivModal(this.app, (paperId, paperName) => {
          this.fetchPaper(paperId, paperName);
        }).open();
      }
    });
    this.addSettingTab(new ArXivSettingTab(this.app, this));
    await this.enableRibbonIcon();
  }
  onunload() {
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async readSVGFile() {
    const filePath = path.resolve(
      this.app.vault.adapter.basePath,
      this.manifest.dir,
      "arxiv-logomark.svg"
    );
    return new Promise((resolve2, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading SVG file:", err);
          reject("");
        } else {
          resolve2(data);
        }
      });
    });
  }
  async enableRibbonIcon() {
    var _a;
    const arXivLogo = await this.readSVGFile();
    if (this.settings.enableRibbonIcon && arXivLogo != "") {
      (0, import_obsidian.addIcon)("arXiv", arXivLogo);
      this.addRibbonIcon("arXiv", "arXiv fetch paper", () => {
        new ArXivModal(this.app, (paperId, paperName) => {
          this.fetchPaper(paperId, paperName);
        }).open();
      }).setAttribute("id", "rb-arXiv-icon");
    } else {
      (_a = document.getElementById("rb-arXiv-icon")) == null ? void 0 : _a.remove();
    }
  }
};
var ArXivSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Save path").setDesc("Enter the path where you want to save the file").addText(
      (text) => text.setValue(this.plugin.settings.mySetting).onChange(async (value) => {
        this.plugin.settings.mySetting = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Enable ribbon icon").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.enableRibbonIcon).onChange((value) => {
        this.plugin.settings.enableRibbonIcon = value;
        this.plugin.saveSettings();
        this.plugin.enableRibbonIcon();
      })
    );
  }
};
var ArXivModal = class extends import_obsidian.Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    new import_obsidian.Setting(contentEl).setName("arXiv id:").addText((text) => text.onChange((value) => {
      this.arXivID = value;
    }));
    new import_obsidian.Setting(contentEl).setName("Paper name (optional):").addText((text) => text.onChange((value) => {
      this.paperName = value;
    }));
    new import_obsidian.Setting(contentEl).addButton((btn) => btn.setButtonText("Fetch").setCta().onClick(() => {
      this.close();
      this.onSubmit(this.arXivID, this.paperName);
    }));
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var main_default = ArxivPlugin;
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQXBwLCBhZGRJY29uLCBNb2RhbCwgTm90aWNlLCBQbHVnaW4sIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyBSZW1lbWJlciB0byByZW5hbWUgdGhlc2UgY2xhc3NlcyBhbmQgaW50ZXJmYWNlcyFcblxuaW50ZXJmYWNlIEFyWGl2UGx1Z2luU2V0dGluZ3Mge1xuXHRteVNldHRpbmc6IHN0cmluZztcblx0ZW5hYmxlUmliYm9uSWNvbjogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIFBhcGVyRGF0YSB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGF1dGhvcnM6IHN0cmluZztcbiAgcHVibGljYXRpb25EYXRlOiBzdHJpbmc7XG4gIHN1bW1hcnk6IHN0cmluZztcbiAgaWQ6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG4gIHBkZkxpbms6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xufVxuXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBBclhpdlBsdWdpblNldHRpbmdzID0ge1xuXHRteVNldHRpbmc6ICcnLFxuXHRlbmFibGVSaWJib25JY29uOiBmYWxzZSxcbn1cblxuY2xhc3MgQXJ4aXZQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuXHRzZXR0aW5nczogQXJYaXZQbHVnaW5TZXR0aW5ncztcblxuXHRhc3luYyBmZXRjaFBhcGVyKHBhcGVySWQ6IHN0cmluZywgcGFwZXJOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAocGFwZXJJZCkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZmV0Y2hQYXBlckRhdGEocGFwZXJJZCwgcGFwZXJOYW1lKTtcblx0XHRcdFx0YXdhaXQgdGhpcy5jcmVhdGVOb3RlKGRhdGEpO1xuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgcGFwZXIgZGF0YTonLCBlcnJvcik7XG5cdFx0XHRcdG5ldyBOb3RpY2UoYEVycm9yIGZldGNoaW5nIHBhcGVyIGRhdGE6ICR7cGFwZXJJZH1gKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRmZXRjaFBhcGVyRGF0YShpZDogc3RyaW5nLCBuYW1lOnN0cmluZyk6IFByb21pc2U8UGFwZXJEYXRhPiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGNvbnN0IHVybCA9IGBodHRwOi8vZXhwb3J0LmFyeGl2Lm9yZy9hcGkvcXVlcnk/aWRfbGlzdD0ke2lkfWA7XG5cdFx0XHRcdGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXHRcdFx0eGhyLm9wZW4oJ0dFVCcsIHVybCk7XG5cdFx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuXHRcdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcblx0XHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG5cdFx0XHRcdFx0XHRjb25zdCB4bWxEb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHhoci5yZXNwb25zZVRleHQsICdhcHBsaWNhdGlvbi94bWwnKTtcblx0XHRcdFx0XHRcdGNvbnN0IGVudHJ5ID0geG1sRG9jLnF1ZXJ5U2VsZWN0b3IoJ2VudHJ5Jyk7XG5cblx0XHRcdFx0XHRcdGlmIChlbnRyeSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCB0aXRsZSA9IGVudHJ5LnF1ZXJ5U2VsZWN0b3IoJ3RpdGxlJyk/LnRleHRDb250ZW50IHx8ICdObyBUaXRsZSc7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGF1dGhvcnMgPSBBcnJheS5mcm9tKGVudHJ5LnF1ZXJ5U2VsZWN0b3JBbGwoJ2F1dGhvciBuYW1lJykpLm1hcChlbCA9PiBlbC50ZXh0Q29udGVudCkuam9pbignLCAnKSB8fCAnTm8gQXV0aG9ycyc7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHB1YmxpY2F0aW9uRGF0ZVJhdyA9IGVudHJ5LnF1ZXJ5U2VsZWN0b3IoJ3B1Ymxpc2hlZCcpPy50ZXh0Q29udGVudDtcblx0XHRcdFx0XHRcdFx0Y29uc3QgcHVibGljYXRpb25EYXRlID0gcHVibGljYXRpb25EYXRlUmF3ID8gKG5ldyBEYXRlKHB1YmxpY2F0aW9uRGF0ZVJhdykpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSA6ICdObyBQdWJsaWNhdGlvbiBEYXRlJztcblx0XHRcdFx0XHRcdFx0Y29uc3QgdXJsID0gZW50cnkucXVlcnlTZWxlY3RvcignaWQnKT8udGV4dENvbnRlbnQgfHwgJ05vIFVSTCc7XG5cdFx0XHRcdFx0XHRcdGxldCBzdW1tYXJ5ID0gZW50cnkucXVlcnlTZWxlY3Rvcignc3VtbWFyeScpPy50ZXh0Q29udGVudCB8fCAnTm8gU3VtbWFyeSc7XG5cdFx0XHRcdFx0XHRcdHN1bW1hcnkgPSBzdW1tYXJ5LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sIFwiIFwiKS50cmltKCk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHBkZkxpbmsgPSB4bWxEb2MucXVlcnlTZWxlY3RvcignbGlua1t0aXRsZT1cInBkZlwiXScpPy5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSB8fCAnTm8gUERGIExpbmsnO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChuYW1lID09PSB1bmRlZmluZWQpe1xuXHRcdFx0XHRcdFx0XHRcdG5hbWUgPSBpZDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKHsgdGl0bGUsIGF1dGhvcnMsIHB1YmxpY2F0aW9uRGF0ZSwgc3VtbWFyeSAsIGlkLCB1cmwsIHBkZkxpbmssIG5hbWV9KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHJlamVjdChuZXcgRXJyb3IoJ05vIGVudHJ5IGZvdW5kIGluIHRoZSByZXNwb25zZScpKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmVqZWN0KG5ldyBFcnJvcignRmFpbGVkIHRvIGZldGNoIGRhdGEnKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0eGhyLnNlbmQoKTtcblx0XHR9KTtcblx0fVxuXG5cdGFzeW5jIGNyZWF0ZU5vdGUoZGF0YTogUGFwZXJEYXRhKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgYXV0aG9yc0xpc3QgPSBkYXRhLmF1dGhvcnMuc3BsaXQoJywgJykubWFwKGF1dGhvciA9PiBgICAtIFwiJHthdXRob3J9XCJgKS5qb2luKCdcXG4nKTtcblx0XHRjb25zdCBmcm9udE1hdHRlciA9IGAtLS1cbnRpdGxlOiBcIiR7ZGF0YS50aXRsZX1cIlxuYXV0aG9yczpcbiR7YXV0aG9yc0xpc3R9XG5wdWJsaXNoZWQ6IFwiJHtkYXRhLnB1YmxpY2F0aW9uRGF0ZX1cIlxuYXJYaXY6IFwiJHtkYXRhLnVybH1cIlxucGFwZXI6IFwiJHtkYXRhLnBkZkxpbmt9XCJcbi0tLVxuYDtcblxuXHRcdGNvbnN0IGNvbnRlbnQgPSBgXG4jIyMjIEFic3RyYWN0XG5cbiR7ZGF0YS5zdW1tYXJ5fVxuXHRcdGA7XG5cblx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUoYCR7dGhpcy5zZXR0aW5ncy5teVNldHRpbmd9LyR7ZGF0YS5uYW1lfS5tZGAsIGZyb250TWF0dGVyICsgY29udGVudCk7XG5cdFx0bmV3IE5vdGljZShgQ3JlYXRlZCBub3RlOiAke2RhdGEubmFtZX1gKTtcblx0fVxuXHRhc3luYyBvbmxvYWQoKSB7XG5cdFx0YXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblxuXHRcdC8vIFRoaXMgYWRkcyBhIHNpbXBsZSBjb21tYW5kIHRoYXQgY2FuIGJlIHRyaWdnZXJlZCBhbnl3aGVyZVxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ29wZW4tYXJYaXYtbW9kYWwnLFxuXHRcdFx0bmFtZTogJ0ZldGNoIGFyWGl2IHBhcGVyIGluZm8nLFxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHtcblx0XHRcdFx0bmV3IEFyWGl2TW9kYWwodGhpcy5hcHAsIChwYXBlcklkLCBwYXBlck5hbWUpID0+IHtcblx0XHRcdFx0dGhpcy5mZXRjaFBhcGVyKHBhcGVySWQsIHBhcGVyTmFtZSk7XG5cdFx0XHRcdH0pLm9wZW4oKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIFRoaXMgYWRkcyBhIHNldHRpbmdzIHRhYiBzbyB0aGUgdXNlciBjYW4gY29uZmlndXJlIHZhcmlvdXMgYXNwZWN0cyBvZiB0aGUgcGx1Z2luXG5cdFx0dGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBBclhpdlNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblx0XHRhd2FpdCB0aGlzLmVuYWJsZVJpYmJvbkljb24oKTtcblxuXHR9XG5cblx0b251bmxvYWQoKSB7XG5cblx0fVxuXG5cdGFzeW5jIGxvYWRTZXR0aW5ncygpIHtcblx0XHR0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcblx0fVxuXG5cdGFzeW5jIHNhdmVTZXR0aW5ncygpIHtcblx0XHRhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuXHR9XG5cdGFzeW5jIHJlYWRTVkdGaWxlKCk6IFByb21pc2U8c3RyaW5nPiB7XG5cblx0XHRjb25zdCBmaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShcblx0XHRcdHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuYmFzZVBhdGgsIFxuXHRcdFx0dGhpcy5tYW5pZmVzdC5kaXIsXG5cdFx0XHQnYXJ4aXYtbG9nb21hcmsuc3ZnJ1xuXHRcdCk7XG5cblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0ZnMucmVhZEZpbGUoZmlsZVBhdGgsICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuXHRcdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3IgcmVhZGluZyBTVkcgZmlsZTonLCBlcnIpO1xuXHRcdFx0XHRcdHJlamVjdCgnJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzb2x2ZShkYXRhKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHRhc3luYyBlbmFibGVSaWJib25JY29uKCl7XG5cdFx0Y29uc3QgYXJYaXZMb2dvID0gYXdhaXQgdGhpcy5yZWFkU1ZHRmlsZSgpO1xuXHRcdGlmICh0aGlzLnNldHRpbmdzLmVuYWJsZVJpYmJvbkljb24gJiYgYXJYaXZMb2dvICE9ICcnKSB7XG5cblx0XHRcdGFkZEljb24oJ2FyWGl2JywgYXJYaXZMb2dvKTtcblx0XHRcdHRoaXMuYWRkUmliYm9uSWNvbihcImFyWGl2XCIsIFwiYXJYaXYgZmV0Y2ggcGFwZXJcIiwgKCkgPT4ge1xuXHRcdFx0XHRuZXcgQXJYaXZNb2RhbCh0aGlzLmFwcCwgKHBhcGVySWQsIHBhcGVyTmFtZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuZmV0Y2hQYXBlcihwYXBlcklkLCBwYXBlck5hbWUpO1xuXHRcdFx0XHR9KS5vcGVuKCk7XG5cdFx0XHR9KS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3JiLWFyWGl2LWljb24nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JiLWFyWGl2LWljb24nKT8ucmVtb3ZlKCk7XG5cdFx0fVxuXG5cdH1cbn1cblxuXG5jbGFzcyBBclhpdlNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcblx0cGx1Z2luOiBBcnhpdlBsdWdpbjtcblxuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBBcnhpdlBsdWdpbikge1xuXHRcdHN1cGVyKGFwcCwgcGx1Z2luKTtcblx0XHR0aGlzLnBsdWdpbiA9IHBsdWdpbjtcblx0fVxuXG5cdGRpc3BsYXkoKTogdm9pZCB7XG5cdFx0Y29uc3Qge2NvbnRhaW5lckVsfSA9IHRoaXM7XG5cblx0XHRjb250YWluZXJFbC5lbXB0eSgpO1xuXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0LnNldE5hbWUoJ1NhdmUgcGF0aCcpXG5cdFx0LnNldERlc2MoJ0VudGVyIHRoZSBwYXRoIHdoZXJlIHlvdSB3YW50IHRvIHNhdmUgdGhlIGZpbGUnKVxuXHRcdC5hZGRUZXh0KFxuXHRcdFx0dGV4dCA9PiB0ZXh0XG5cdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubXlTZXR0aW5nKVxuXHRcdFx0Lm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5teVNldHRpbmcgPSB2YWx1ZTtcblx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG5cdFx0XHR9KSk7XG5cblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcblx0XHRcdC5zZXROYW1lKCdFbmFibGUgcmliYm9uIGljb24nKVxuXHRcdFx0LmFkZFRvZ2dsZShcblx0XHRcdFx0KHRvZ2dsZSkgPT4gdG9nZ2xlXG5cdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmFibGVSaWJib25JY29uKVxuXHRcdFx0XHQub25DaGFuZ2UoKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5hYmxlUmliYm9uSWNvbiA9IHZhbHVlO1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luLmVuYWJsZVJpYmJvbkljb24oKVxuXHRcdFx0XHR9KSk7XG5cdH1cbn1cblxuY2xhc3MgQXJYaXZNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgYXJYaXZJRDogc3RyaW5nO1xuICBwYXBlck5hbWU6IHN0cmluZztcbiAgb25TdWJtaXQ6IChyZXN1bHQ6IHN0cmluZykgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgb25TdWJtaXQ6IChhclhpdklEOiBzdHJpbmcsIHBhcGVyTmFtZTogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICB0aGlzLm9uU3VibWl0ID0gb25TdWJtaXQ7XG4gIH1cblxuICBvbk9wZW4oKSB7XG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiYXJYaXYgaWQ6XCIpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dC5vbkNoYW5nZSgodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLmFyWGl2SUQgPSB2YWx1ZVxuICAgICAgICB9KSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZShcIlBhcGVyIG5hbWUgKG9wdGlvbmFsKTpcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0Lm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMucGFwZXJOYW1lID0gdmFsdWVcbiAgICAgICAgfSkpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLmFkZEJ1dHRvbigoYnRuKSA9PlxuICAgICAgICBidG5cbiAgICAgICAgICAuc2V0QnV0dG9uVGV4dChcIkZldGNoXCIpXG4gICAgICAgICAgLnNldEN0YSgpXG4gICAgICAgICAgLm9uQ2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgdGhpcy5vblN1Ym1pdCh0aGlzLmFyWGl2SUQsIHRoaXMucGFwZXJOYW1lKTtcbiAgICAgICAgICB9KSk7XG4gIH1cblxuICBvbkNsb3NlKCkge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFyeGl2UGx1Z2luO1xuXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQUErRTtBQUMvRSxTQUFvQjtBQUNwQixXQUFzQjtBQW9CdEIsSUFBTSxtQkFBd0M7QUFBQSxFQUM3QyxXQUFXO0FBQUEsRUFDWCxrQkFBa0I7QUFDbkI7QUFFQSxJQUFNLGNBQU4sY0FBMEIsdUJBQU87QUFBQSxFQUdoQyxNQUFNLFdBQVcsU0FBaUIsV0FBa0M7QUFDbkUsUUFBSSxTQUFTO0FBQ1osVUFBSTtBQUNILGNBQU0sT0FBTyxNQUFNLEtBQUssZUFBZSxTQUFTLFNBQVM7QUFDekQsY0FBTSxLQUFLLFdBQVcsSUFBSTtBQUFBLE1BQzNCLFNBQVMsT0FBUDtBQUNELGdCQUFRLE1BQU0sOEJBQThCLEtBQUs7QUFDakQsWUFBSSx1QkFBTyw4QkFBOEIsU0FBUztBQUFBLE1BQ25EO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFBQSxFQUVBLGVBQWUsSUFBWSxNQUFpQztBQUMzRCxXQUFPLElBQUksUUFBUSxDQUFDQSxVQUFTLFdBQVc7QUFDdkMsWUFBTSxNQUFNLDZDQUE2QztBQUN4RCxZQUFNLE1BQU0sSUFBSSxlQUFlO0FBQ2hDLFVBQUksS0FBSyxPQUFPLEdBQUc7QUFDbkIsVUFBSSxxQkFBcUIsTUFBTTtBQS9DbEM7QUFnREksWUFBSSxJQUFJLGVBQWUsR0FBRztBQUN6QixjQUFJLElBQUksV0FBVyxLQUFLO0FBQ3ZCLGtCQUFNLFNBQVMsSUFBSSxVQUFVO0FBQzdCLGtCQUFNLFNBQVMsT0FBTyxnQkFBZ0IsSUFBSSxjQUFjLGlCQUFpQjtBQUN6RSxrQkFBTSxRQUFRLE9BQU8sY0FBYyxPQUFPO0FBRTFDLGdCQUFJLE9BQU87QUFDVixvQkFBTSxVQUFRLFdBQU0sY0FBYyxPQUFPLE1BQTNCLG1C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
