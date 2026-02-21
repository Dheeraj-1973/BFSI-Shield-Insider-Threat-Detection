# 🛡️ BFSI Shield: Insider Threat & Signal Detection System

**BFSI Shield** is an enterprise-grade cybersecurity command center designed to monitor, intercept, and analyze corporate communications in real-time. Built specifically for the **BFSI (Banking, Financial Services, and Insurance)** sector, it uses Natural Language Processing (NLP) to detect malicious intent and prevent data exfiltration.

---

## 🚀 Key Features
* **Real-Time Interception**: Captures and scans outgoing employee communications before they leave the network.
* **Neural Risk Analysis**: Uses a custom-built NLP engine to categorize threats into High, Medium, and Low severity.
* **Target Risk Leaderboard**: An automated ranking system that identifies high-risk employees based on behavioral history.
* **Threat Isolation**: Allows security administrators to "Isolate" (remove) critical threats from the live databank instantly.
* **Secure Authentication**: Admin access protected by salted and hashed passwords using `bcryptjs`.

---

## 🏗️ Technical Architecture (MERN Stack)
* **Frontend**: React.js with a high-tech "Cyber Command" UI and custom state management.
* **Backend**: Node.js & Express API handling asynchronous threat scanning.
* **Database**: MongoDB Atlas cloud-hosted database for persistent logging and security.

---

## 📊 Evaluation Criteria Focus
| Criteria | Implementation |
| :--- | :--- |
| **Innovation** | Real-time pattern matching for sensitive data like SSNs and credit cards. |
| **Architecture** | Scalable decoupled MERN architecture with live cloud integration. |
| **Functionality** | Full CRUD operations (Post threats, Fetch logs, Isolate/Delete incidents). |
| **Impact** | Protects BFSI firms from multimillion-dollar internal data breaches. |

---

## 🛠️ Installation & Setup

### 1. Prerequisites
* Node.js installed.
* A MongoDB Atlas Cluster link.

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
