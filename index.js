const fs = require('fs-extra');
const path = require('path');

async function generate() {
    console.log('开始构建流程...');

    // 1. 确保输出目录存在
    await fs.ensureDir('public');

    // 2. 读取站点数据
    const sites = await fs.readJson('sites.json');

    // 3. 处理图标文件 (favicon.ico)
    const faviconFile = 'favicon.ico';
    let hasFavicon = false;

    if (await fs.pathExists(faviconFile)) {
        await fs.copy(faviconFile, path.join('public', 'favicon.ico'));
        hasFavicon = true;
        console.log('已成功拷贝图标文件：favicon.ico');
    }

    // 4. 构建 HTML 列表
    const listItems = sites.map(site => `
        <a href="${site.url}" target="_blank" class="card-link">
            <div class="card">
                <div class="card-content">
                    <h3>${site.name}</h3>
                    <p>${site.desc}</p>
                </div>
                <div class="card-footer">
                    <span>访问直达</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
            </div>
        </a>
    `).join('');

    // 5. HTML 模板
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>我的项目导航</title>
        ${hasFavicon ? '<link rel="icon" href="favicon.ico" type="image/x-icon">' : ''}
        <style>
            /* 这里保留之前的深色主题 CSS 样式... */
            :root { --bg-color: #0f172a; --card-bg: #1e293b; --text-primary: #f8fafc; --text-secondary: #94a3b8; --accent-color: #38bdf8; }
            body { font-family: sans-serif; background: var(--bg-color); color: var(--text-primary); padding: 40px 20px; display: flex; flex-direction: column; align-items: center; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; width: 100%; max-width: 1200px; }
            .card { background: var(--card-bg); padding: 24px; border-radius: 16px; transition: 0.3s; border: 1px solid rgba(255,255,255,0.05); }
            .card:hover { transform: translateY(-5px); border-color: var(--accent-color); }
            .card-link { text-decoration: none; color: inherit; }
            h1 { margin-bottom: 40px; background: linear-gradient(to right, #fff, var(--accent-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        </style>
    </head>
    <body>
        <h1>项目导航</h1>
        <div class="grid">${listItems}</div>
    </body>
    </html>
    `;

    // 6. 写入文件
    await fs.writeFile(path.join('public', 'index.html'), htmlContent);
    console.log('构建完成：public/index.html');
}

generate();