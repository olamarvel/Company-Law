# Company Law 📜🤖

An automated end-to-end pipeline and **n8n** workflow that parses the **Companies and Allied Matters Act (CAMA) 2020** PDF, stores structured legal provisions in **MongoDB**, and uses **Google Gemini AI** to generate clear, simplified, and practical corporate law lessons sent directly to **Telegram**.

---

## 🌟 Overview & Key Features

* **PDF Legal Data Parser (`paser.js`)**: Extracts legal sections from `cama.pdf`, eliminates duplicate table-of-contents entries by selecting complete section text, and formats laws into standard JSON (`all_cama_laws.json`).
* **Automated MongoDB Importer (`import.js`)**: Cleans old records and seeds MongoDB database with fresh law provisions tracked via a `has_been_used` flag.
* **n8n AI Workflow Automation (`CAMA.json`)**: An n8n workflow that sequentially fetches unread law sections, feeds them to Google Gemini AI, and routes formatted lessons to a Telegram chat.
* **Entrepreneur-Focused AI Prompt**: Instructs Gemini to summarize laws into plain English, provide a realistic Nigerian business scenario, and highlight a "Did You Know?" legal tip.
* **Strict Telegram HTML Formatting**: Enforces safe Telegram HTML styling (`<b>`, `<i>`) to prevent message delivery failures caused by Markdown syntax errors.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    A["📄 cama.pdf (Raw CAMA 2020 Act)"] -->|paser.js| B["📦 all_cama_laws.json"]
    B -->|import.js| C[("🍃 MongoDB (cama_laws collection)")]
    C -->|1. Fetch query: has_been_used=false| D["⚙️ n8n Workflow (CAMA.json)"]
    D -->|2. Section Text & Prompt| E["🧠 Google Gemini AI (gemini-3.1-flash-lite)"]
    E -->|3. Structured HTML Lesson| D
    D -->|4. Send HTML Message| F["📱 Telegram Channel / Bot"]
```

---

## 📂 File Directory Overview

| File | Description |
| :--- | :--- |
| [`cama.pdf`](file:///home/olamarvel/Desktop/lawyers/cama.pdf) | Raw PDF document of the Companies and Allied Matters Act 2020. |
| [`paser.js`](file:///home/olamarvel/Desktop/lawyers/paser.js) | Node.js script using `pdf-parse` to extract and parse sections into JSON. |
| [`all_cama_laws.json`](file:///home/olamarvel/Desktop/lawyers/all_cama_laws.json) | Cleaned JSON dataset containing section numbers, act metadata, and text. |
| [`import.js`](file:///home/olamarvel/Desktop/lawyers/import.js) | MongoDB migration script that populates the `cama_laws` collection. |
| [`CAMA.json`](file:///home/olamarvel/Desktop/lawyers/CAMA.json) | Exported n8n workflow file ready to be imported into your n8n instance. |
| [`package.json`](file:///home/olamarvel/Desktop/lawyers/package.json) | Project dependencies (`mongodb`, `pdf-parse`, `axios`, `cheerio`). |

---

## ⚙️ Prerequisites & Setup Preparation

Before running the data scripts or setting up n8n, ensure you have:

1. **Node.js** (v18.x or higher) and **npm** installed.
2. **MongoDB**: A running instance of MongoDB (locally via Docker or remote like MongoDB Atlas).
3. **n8n**: A self-hosted or cloud instance of [n8n](https://n8n.io/).
4. **Google Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/).
5. **Telegram Bot & Chat ID**:
   - Create a bot via [@BotFather](https://t.me/BotFather) on Telegram and save the Bot Token.
   - Get your target user or channel `chatId` (e.g., using `@userinfobot`).

---

## 🚀 Getting Started

### 1. Installation

Clone or open the project folder and install Node.js dependencies:

```bash
npm install
```

### 2. Extracting Laws from PDF

Ensure `cama.pdf` is placed in the project root directory, then run the parser:

```bash
node paser.js
```

* **What it does**: Reads `cama.pdf`, matches sections using regex, sorts them numerically, filters out header noise, and saves the output to `all_cama_laws.json`.

### 3. Importing Data into MongoDB

Configure your MongoDB connection string in [`import.js`](file:///home/olamarvel/Desktop/lawyers/import.js):

```javascript
// Default local URI example:
const uri = "mongodb://admin:secret@localhost:27017/?authSource=admin";
```

Run the seed script:

```bash
node import.js
```

* **What it does**: Connects to the `N8N` database, resets the `cama_laws` collection, and inserts all extracted law sections with `has_been_used: false`.

---

## 🔄 Setting Up the n8n Workflow

1. **Import Workflow**:
   - Open your n8n dashboard.
   - Click **Workflows** > **Import from File** and select [`CAMA.json`](file:///home/olamarvel/Desktop/lawyers/CAMA.json).

2. **Configure Credentials in n8n**:
   - **MongoDB Node**: Set up credentials matching your database host, port, authentication database (`admin`), username, and password.
   - **Google Gemini Chat Model Node**: Add your Gemini API key under **Google Gemini(PaLM) API**.
   - **Telegram Node**: Add your Telegram Bot Token under **Telegram API**. Update the `chatId` parameter in the Telegram node to your target Telegram Chat ID.

3. **Workflow Logic & Customization**:
   - **Find Documents**: Queries MongoDB for 1 document where `has_been_used` is `false`.
   - **Basic LLM Chain**: Sends the law section to Gemini (`gemini-3.1-flash-lite`) with prompt instructions to simplify the legal wording for Nigerian entrepreneurs using HTML formatting (`<b>`, `<i>`).
   - **Send Telegram Message**: Delivers the generated response formatted as `HTML` to Telegram.

4. **Execute & Test**:
   - Click **Execute Workflow** in n8n to test the pipeline.
   - Check Telegram for the formatted legal lesson.

---

## 📝 Prompt Architecture

The n8n workflow uses the following structured prompt for Gemini AI:

```text
You are explaining Nigerian corporate law to a Nigerian entrepreneur.
Using ONLY the legal provision provided:
1. Explain what it means in plain English.
2. Give a practical example involving a Nigerian business.
3. Give one memorable "Did you know?" fact.
4. Do not invent legal requirements.
5. Keep it concise and formatted for Telegram.

CRITICAL FORMATTING RULE: You must format your response using ONLY Telegram-supported HTML tags (<b> for bold, <i> for italic). Do NOT use any Markdown characters like asterisks (*), hashtags (#), or dashes (-). Telegram will crash if you use Markdown.
```

---

## 🛠️ Maintenance & Next Steps

* **Marking Used Laws**: You can extend the n8n workflow by adding a MongoDB Update node after sending the message to set `has_been_used: true` for the processed document ID.
* **Scheduled Execution**: Replace the `Manual Trigger` node in n8n with a `Schedule Trigger` node (e.g., once daily at 9:00 AM) for regular automated lesson publishing.

