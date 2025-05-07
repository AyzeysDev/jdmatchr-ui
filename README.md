# jdmatchr-ui
💼 JDMatchR UI – A free and open-source resume and job description analyzer built with Next.js. Instantly compare your resume with any JD and get improvement tips.


# 🎯 JDMatchR UI — Resume & JD Analyzer (Frontend)

**JDMatchR** is a free, open-source web app that helps job seekers compare their resumes against job descriptions. This is the **frontend** built with **Next.js**, styled using **MUI**, and designed to be highly responsive and production-grade.

---

## ✨ Features

- 📄 Upload or paste your resume (PDF parsing supported)
- 📝 Paste a job description to extract role-specific keywords
- 📊 View real-time match percentage and skill gaps
- 🧠 AI suggestions for resume improvement (via backend GPT-4o)
- 🧾 Clean UI with **page-based routing**
- 📱 Responsive across mobile, tablet, and desktop
- 🔐 **Custom Auth** with JWT + **OAuth** via Google and GitHub

---

## 🧱 Tech Stack

| Layer        | Stack                                           |
|--------------|-------------------------------------------------|
| Framework    | [Next.js 14 (App Router)](https://nextjs.org/)  |
| Styling      | [MUI](https://mui.com/) + CSS Modules           |
| Routing      | Page-based routing via `app/` directory         |
| State Mgmt   | React Context + useReducer (auth, match state)  |
| PDF Parsing  | `pdfjs-dist`, custom parser                     |
| Auth         | JWT for session + OAuth (Google, GitHub)        |

---


