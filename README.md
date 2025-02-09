# Financial Learning & Analysis Platform

Our website is designed to make learning and utilizing financial statements both easy and fun. 

## 📌 Problem Statement

**Balance sheets and income statements** are essential for understanding a company’s financial health. However, many employees struggle with financial interpretation, leading them to avoid reviewing these documents. Our platform simplifies the process by offering two core features: an interactive analysis tool and a guided learning experience, helping users become proficient in financial analysis with ease.

## ⭐ Key Features

### 1. Analysis Tool

- **Drag & Drop Interface**
    
    Easily input key financial statement data, such as balance sheets and income statements, via CSV or Excel files. If the file is not in one of these formats, it will be assumed to be an image.
    
- **Visual Data Generation**
    
    Automatically convert your data into visual charts and graphs that highlight essential financial metrics.
    
- **Comparative Analysis**
    
    Quickly and intuitively compare data across different periods or categories to support informed decision-making. 
    

### 2. Interactive Learning Game

- **Foundational Concept Learning**
    
    Learn the basics of balance sheets and financial metrics through a variety of interactive challenges.
    
- **Game-Based Learning**
    
    Designed with beginners in mind, our engaging and interactive game maximizes your learning experience.
    

## 🚩 Getting Started

1. **Visit the Website** 
    
    Go to [Website URL] and start exploring.
    
2. **Sign Up and Log In** 
    
    Register quickly and gain instant access to both the Analysis Tool and the Learning Game.
    
3. **Input and Analyze Data** 
    
    Use our drag & drop feature to input your financial data and experience the power of visual and comparative analysis.
    
4. **Upload Financial Statements**
    - You can upload balance sheets and income statements for up to 5 companies. Each company can have financial data for multiple years.
    - Once an image is uploaded, the system will parse the data and auto-fill the respective fields. Users should verify that the extracted data matches their original files before proceeding.
5. **View Data Visualizations**
    - After confirming the uploaded data, clicking the ‘Next’ button will generate eight different visualizations.
        - Balance Sheet Comparison: Bar chart and line chart comparing balance sheet components across companies.
        - Income Statement Comparison: Bar chart and line chart comparing income statement components across companies.
        - Balance Sheet Financial Data Analysis: Bar chart displaying balance sheet data for a single company over multiple years.
        - Income Statement Financial Data Analysis: Bar char displaying income statement data for a single company over multiple years.
        - Financial Ratios: Key calculated ratios presented per company.
        - EBITA: A dedicated chart displaying EBITDA calculations.
    - These visualizations provide users with a comprehensive financial analysis of their balance sheet and income statement data.
6. **Utilize the Learning Game**
    - If interpreting the generated charts proves challenging, it may indicate a lack of foundational financial knowledge. The Learning Game helps users build this understanding.
    - Selecting the game section will present 10 randomly selected questions from the following categories.
        - Definition-based questions testing fundamental financial concepts.
        - Interpretation questions assessing the ability to analyze economic indicators.
        - Calculation questions requiring users to compute financial metrics based on given balance sheet and income statement data.
            - For this calculation-based questions, hints about relevant formulas will be provided.

## 🖥️ Tech Stack
### 🌐 Frontend
- **Core Frameworks & Libraries**
  - ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB): A JavaScript library for building user interfaces.
  - ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white): A JavaScript library for data visualization and chart rendering.
- **Build Tools & Bundlers**
  - ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white): A fast build tool optimized for modern web development.
- **Programming Languages & Utilities**
  - ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black): The primary language used for frontend development.
  - ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white): A promise-based HTTP client for making API requests.

### 🛠 Backend
- **Runtime Environment & Frameworks**
  - ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white): A JavaScript runtime for building scalable network applications.
  - ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white): A minimal and flexible Node.js web application framework.
- **Database & Storage**
  - ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white): A NoSQL database for storing application data.

### ☁️ Cloud & API
- **Cloud Infrastructure & Storage**
  - ![AWS S3](https://img.shields.io/badge/AWS%20S3-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white): Amazon's cloud object storage for managing and storing data.
  - ![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white): A fully managed cloud database service for MongoDB.
- **Artificial Intelligence & API Services**
  - ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white): A powerful AI-based API service for language models and automation.


## 🙋‍♂️ Future Steps

1. **Enhance Data Integration**
    - Support additional financial statement formats such as cash flow statements.
    - Enable parsing of CSV and Excel files in addition to image uploads for improved input flexibility.
2. **Expand Learning Game Content**
    - Introduce advanced financial analysis scenarios.
    - Enhance engagement by incorporating features such as avatar customization and competitive elements among users.
3. **Introduce Collaborative Features**
    - Create a discussion platform where users can engage in financial report analysis and exchange insights.
