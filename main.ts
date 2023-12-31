import { App, addIcon, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as fs from 'fs';
import * as path from 'path';

// Remember to rename these classes and interfaces!

interface ArXivPluginSettings {
	mySetting: string;
	enableRibbonIcon: boolean;
}

interface PaperData {
  title: string;
  authors: string;
  publicationDate: string;
  summary: string;
  id: string;
  url: string;
  pdfLink: string;
  name: string;
}

const DEFAULT_SETTINGS: ArXivPluginSettings = {
	mySetting: '',
	enableRibbonIcon: false,
}

class ArxivPlugin extends Plugin {
	settings: ArXivPluginSettings;

	async fetchPaper(paperId: string, paperName: string): Promise<void> {
		if (paperId) {
			try {
				const data = await this.fetchPaperData(paperId, paperName);
				await this.createNote(data);
			} catch (error) {
				console.error('Error fetching paper data:', error);
				new Notice(`Error fetching paper data: ${paperId}`);
			}
		}
	}

	fetchPaperData(id: string, name:string): Promise<PaperData> {
		return new Promise((resolve, reject) => {
			const url = `http://export.arxiv.org/api/query?id_list=${id}`;
				const xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						const parser = new DOMParser();
						const xmlDoc = parser.parseFromString(xhr.responseText, 'application/xml');
						const entry = xmlDoc.querySelector('entry');

						if (entry) {
							const title = entry.querySelector('title')?.textContent || 'No Title';
							const authors = Array.from(entry.querySelectorAll('author name')).map(el => el.textContent).join(', ') || 'No Authors';
							const publicationDateRaw = entry.querySelector('published')?.textContent;
							const publicationDate = publicationDateRaw ? (new Date(publicationDateRaw)).toISOString().split('T')[0] : 'No Publication Date';
							const url = entry.querySelector('id')?.textContent || 'No URL';
							let summary = entry.querySelector('summary')?.textContent || 'No Summary';
							summary = summary.replace(/(\r\n|\n|\r)/gm, " ").trim();
							const pdfLink = xmlDoc.querySelector('link[title="pdf"]')?.getAttribute('href') || 'No PDF Link';

							if (name === undefined){
								name = id;
							}
							resolve({ title, authors, publicationDate, summary , id, url, pdfLink, name});
						} else {
							reject(new Error('No entry found in the response'));
						}
					} else {
						reject(new Error('Failed to fetch data'));
					}
				}
			};
			xhr.send();
		});
	}

	async createNote(data: PaperData): Promise<void> {
		const authorsList = data.authors.split(', ').map(author => `  - "${author}"`).join('\n');
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
		new Notice(`Created note: ${data.name}`);
	}
	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-arXiv-modal',
			name: 'Fetch arXiv paper info',
			callback: () => {
				new ArXivModal(this.app, (paperId, paperName) => {
				this.fetchPaper(paperId, paperName);
				}).open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
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
	async readSVGFile(): Promise<string> {

		const filePath = path.resolve(
			this.app.vault.adapter.basePath, 
			this.manifest.dir,
			'arxiv-logomark.svg'
		);

		return new Promise((resolve, reject) => {
			fs.readFile(filePath, 'utf8', (err, data) => {
				if (err) {
					console.error('Error reading SVG file:', err);
					reject('');
				} else {
					resolve(data);
				}
			});
		});
	}

	async enableRibbonIcon(){
		const arXivLogo = await this.readSVGFile();
		if (this.settings.enableRibbonIcon && arXivLogo != '') {

			addIcon('arXiv', arXivLogo);
			this.addRibbonIcon("arXiv", "arXiv fetch paper", () => {
				new ArXivModal(this.app, (paperId, paperName) => {
					this.fetchPaper(paperId, paperName);
				}).open();
			}).setAttribute('id', 'rb-arXiv-icon');
		} else {
			document.getElementById('rb-arXiv-icon')?.remove();
		}

	}
}


class ArXivSettingTab extends PluginSettingTab {
	plugin: ArxivPlugin;

	constructor(app: App, plugin: ArxivPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
		.setName('Save path')
		.setDesc('Enter the path where you want to save the file')
		.addText(
			text => text
			.setValue(this.plugin.settings.mySetting)
			.onChange(async (value) => {
				this.plugin.settings.mySetting = value;
				await this.plugin.saveSettings();
			}));

		new Setting(containerEl)
			.setName('Enable ribbon icon')
			.addToggle(
				(toggle) => toggle
				.setValue(this.plugin.settings.enableRibbonIcon)
				.onChange((value) => {
					this.plugin.settings.enableRibbonIcon = value;
					this.plugin.saveSettings();
					this.plugin.enableRibbonIcon()
				}));
	}
}

class ArXivModal extends Modal {
  arXivID: string;
  paperName: string;
  onSubmit: (result: string) => void;

  constructor(app: App, onSubmit: (arXivID: string, paperName: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;


    new Setting(contentEl)
      .setName("arXiv id:")
      .addText((text) =>
        text.onChange((value) => {
          this.arXivID = value
        }));

    new Setting(contentEl)
      .setName("Paper name (optional):")
      .addText((text) =>
        text.onChange((value) => {
          this.paperName = value
        }));

    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Fetch")
          .setCta()
          .onClick(() => {
            this.close();
            this.onSubmit(this.arXivID, this.paperName);
          }));
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

export default ArxivPlugin;

