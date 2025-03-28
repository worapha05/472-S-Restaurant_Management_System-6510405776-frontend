<h1 align="center">OmniDine Restaurant (Front-end)</h1>
<p align="center">
    <b>Project ภาคปลาย 2568 ประจำรายวิชา CS441/CS472</b> <br>
    <i>An open-source,</i> Restaurant Front and Management Program.<br>
    <br>
    <a href="#-about">❓ About</a>‎ ‎ |‎ ‎ 
    <a href="#-team-members">👥 Team Members</a>‎ ‎ |‎ ‎ 
    <a href="#%EF%B8%8F-installation">⚙️ Installation</a>‎ ‎ |‎ ‎ 
    <a href="#-sample-user-data">📋 Sample Data</a>‎ ‎ |‎ ‎ 
    <a href="#%EF%B8%8F-release-tag">🏷️ Release Tag</a>
</p>

---

## ❓ About
โครงงานชิ้นนี้เป็นโครงงานที่ทำควบกันระหว่างรายวิชา Web Technology (CS441) และ Agile and DevOps (CS472) เป็นระบบร้านอาหาร และระบบสำหรับการจัดการร้านอาหารที่มีชื่อว่า OmniDine

โดยลูกค้าที่สนใจเข้ามาใช้บริการร้านอาหารสามารถกดจองโต๊ะ และสามารถเลือกสั่งอาหารได้ผ่านทางหน้าเว็บ อีกทั้งมีการเก็บประวัติออเดอร์ (พร้อมรายละเอียดอาหารที่สั่ง) และการจองโต๊ะสำหรับผู้ใช้งาน พร้อมระบบหลังบ้านในการจัดการ Stock และ Order status สำหรับพนักงานประจำร้าน และระบบการเพิ่มเมนูอาหารสำหรับเจ้าของร้าน

## 👥 Team Members
- 6510451085 อภิสิทธิ์ ประเสริฐเวศยากร (<a href="https://github.com/Professors001">Professors001</a>)
- 6510405610 นพปฎล ฐานะปฏิพล (<a href="https://github.com/n-thnptp">n-thnptp</a>)
- 6510405733 ภาพตะวัน สุขุม (<a href="https://github.com/fahh11">fahh11</a>)
- 6510405776 วรพา จันทร์กลาง (<a href="https://github.com/worapha05">worapha05</a>)


## ⚙️ Installation
### Requirements
- Windows 10 or Windows 11 (Latest Version) with Hyper-V function enabled
- <a href="https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe?utm_source=docker&utm_medium=webreferral&utm_campaign=dd-smartbutton&utm_location=module">Docker Desktop</a>
- <a href="https://ubuntu.com/desktop/wsl">WSL Ubuntu (WSL2)</a> (For Windows)

1. Clone the project

```bash
git clone https://github.com/Professors001/omnidine-frontend
cd omnidine-frontend
```

2. Create .env file with the following content:
```bash
cp .env.example .env
```

```env
NEXT_PUBLIC_SERVER_API_URL=http://omnidine-backend-laravel.test-1   # for server components
NEXT_PUBLIC_CLIENT_API_URL=http://localhost                         # for client components
NEXT_PUBLIC_S3_URL=http://localhost:9000                            # for S3 image storage
NEXTAUTH_URL=http://omnidine-backend-laravel.test-1                 # for next auth dependencies (backend)
NEXTAUTH_SECRET=Tpx2mez1d+poHXMGLFgqhgMc00h/VhK3ro2Rh+w6whU=        # for next auth JWT
```

3. Executing Composer Command

```docker
docker compose up -d
```

4. Access the website on your browser with the following link: http://localhost:7070/

## 📋 Sample User Data
The following list is for default accounts:
<pre>
admin@admin.com : 123       # admin account #
staff@staff.com : 123       # staff account #
user@user.com : 123         # user account #
</pre>

## 🏷️ Release Tag
- Release Tag ที่เสร็จสมบูรณ์และใช้ในการนำเสนอ: <a href="https://github.com/omnidine/omnidine-frontend/releases/tag/1.0.2">1.0.2</a>