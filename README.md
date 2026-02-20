# LeadGen Maps ⚡

LeadGen Maps is a premium Chrome extension designed for efficient and high-quality lead extraction from Google Maps. It empowers businesses to find and export targeted local leads with ease, featuring advanced filtering and multiple export formats.

![LeadGen Maps Interface](https://via.placeholder.com/800x400?text=LeadGen+Maps+Interface)

## 🚀 Features

-   **Intelligent Extraction**: Seamlessly extracts business data directly from Google Maps.
-   **Deep Web Scraping**: Automatically visits business websites to find emails, social media links (LinkedIn, Facebook), and contact info.
-   **Niche Library**: Save your frequent search queries to a personal library for quick access and consistent lead generation.
-   **Advanced Filtering**: Filter leads by minimum rating to ensure you're only targeting high-quality prospects.
-   **Real-time Progress Tracking**: Monitor your extraction progress with a visual progress bar and live status updates.
-   **Flexible Export Options**:
    -   **CSV**: Standard format for data portability.
    -   **Excel**: Full `.xlsx` support powered by `xlsx.js`.
    -   **Google Sheets Integration**: Directly append data to existing sheets or create new tabs using Google Apps Script.
-   **Process Control**: Start, Stop & Save, or Cancel extractions at any time. Your data is preserved even if you stop early.
-   **Premium UI**: A modern, glassmorphism-inspired interface built for a superior user experience.

## 📊 Extracted Data Fields

The extension collects a comprehensive set of data points for each business:
-   **Business Name**
-   **Average Rating & Review Count**
-   **Google Maps URL**
-   **Phone Number**
-   **Website URL**
-   **Email Addresses** (via deep scraping)
-   **Social Media Profiles** (LinkedIn & Facebook)
-   **Scrape Metadata** (Date, Source)

## 🛠️ Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/business_scrapper.git
    ```
2.  **Open Chrome Extensions**:
    Navigate to `chrome://extensions/` in your Google Chrome browser.
3.  **Enable Developer Mode**:
    Toggle the "Developer mode" switch in the top right corner.
4.  **Load Unpacked**:
    Click the "Load unpacked" button and select the `business_scrapper` directory.

## 📖 How to Use

1.  Open [Google Maps](https://www.google.com/maps).
2.  Click on the **LeadGen Maps** extension icon in your toolbar.
3.  Enter a **Search Keyword** (e.g., "Real Estate in London").
4.  (Optional) Set a **Minimum Rating** to filter results.
5.  Click **Start Extraction**. The extension will automatically scroll and collect data.
6.  Once finished (or stopped), choose your preferred **Export** format to download your leads.

## ⚙️ Google Sheets Setup (Optional)

To use the Google Sheets export features:
1.  Open the `apps_script.js` file in the repository.
2.  Create a new Google Apps Script project at `script.google.com`.
3.  Paste the contents of `apps_script.js` into the script editor.
4.  Deploy the script as a Web App (set access to "Anyone").
5.  (Optional) Update the extension code with your Web App URL if the current one is expired.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Powered by LeadGen v2.0*
