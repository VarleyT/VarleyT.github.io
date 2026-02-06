const fs = require('fs-extra');
const path = require('path');

// 个人信息配置
const USER_CONFIG = {
    title: "项目导航",
    username: "VarleyT",
    // 自动获取 GitHub 头像
    avatar: "https://github.com/VarleyT.png", 
    bio: "嵌入式工程师 | Python & C 开发者", 
    github: "https://github.com/VarleyT"
};

async function generate() {
    console.log('开始构建流程...');

    await fs.ensureDir('public');
    const sites = await fs.readJson('sites.json');

    // 图标处理
    const faviconFile = 'favicon.ico';
    let hasFavicon = false;
    if (await fs.pathExists(faviconFile)) {
        await fs.copy(faviconFile, path.join('public', 'favicon.ico'));
        hasFavicon = true;
    }

    // 站点卡片构建
    const listItems = sites.map(site => `
        <a href="${site.url}" target="_blank" class="card-link">
            <div class="card">
                <div class="card-content">
                    <h3>${site.name}</h3>
                    <p>${site.desc}</p>
                </div>
                <div class="card-footer">
                    <span>进入站点</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
            </div>
        </a>
    `).join('');

    // 完整的 HTML 模板
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${USER_CONFIG.title} - ${USER_CONFIG.username}</title>
        ${hasFavicon ? '<link rel="icon" href="favicon.ico" type="image/x-icon">' : ''}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg-color: #0b0f1a;
                --card-bg: #161b22;
                --text-main: #e6edf3;
                --text-dim: #8b949e;
                --accent: #2f81f7;
                --border: #30363d;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: 'Inter', -apple-system, system-ui, sans-serif;
                background-color: var(--bg-color);
                color: var(--text-main);
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 60px 20px;
                min-height: 100vh;
            }

            /* 个人信息栏样式 */
            .profile {
                text-align: center;
                margin-bottom: 50px;
            }
            .avatar {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                border: 3px solid var(--accent);
                padding: 3px;
                margin-bottom: 15px;
            }
            .profile h1 {
                font-size: 2rem;
                letter-spacing: -0.5px;
                margin-bottom: 8px;
            }
            .profile .username {
                color: var(--accent);
                font-weight: 600;
                font-size: 1.1rem;
                margin-bottom: 12px;
                display: block;
            }
            .profile p {
                color: var(--text-dim);
                max-width: 400px;
                font-size: 0.95rem;
            }

            /* 容器与网格 */
            .container { width: 100%; max-width: 1000px; }
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 20px;
            }

            /* 卡片样式 */
            .card-link { text-decoration: none; color: inherit; }
            .card {
                background: var(--card-bg);
                border: 1px solid var(--border);
                border-radius: 12px;
                padding: 24px;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                transition: transform 0.2s, border-color 0.2s;
            }
            .card:hover {
                transform: translateY(-4px);
                border-color: var(--accent);
            }
            .card h3 { margin-bottom: 10px; font-size: 1.2rem; }
            .card p { color: var(--text-dim); font-size: 0.9rem; margin-bottom: 20px; line-height: 1.5; }
            .card-footer {
                display: flex;
                align-items: center;
                color: var(--accent);
                font-size: 0.85rem;
                font-weight: 600;
            }
            .card-footer svg { margin-left: 5px; }

            @media (max-width: 600px) {
                body { padding: 40px 15px; }
                .profile h1 { font-size: 1.7rem; }
            }
        </style>
    </head>
    <body>
        <div class="profile">
            <img src="${USER_CONFIG.avatar}" alt="Avatar" class="avatar">
            <h1>${USER_CONFIG.title}</h1>
            <span class="username">@${USER_CONFIG.username}</span>
            <p>${USER_CONFIG.bio}</p>
        </div>

        <main class="container">
            <div class="grid">${listItems}</div>
        </main>
    </body>
    </html>
    `;

    await fs.writeFile(path.join('public', 'index.html'), htmlContent);
    console.log('中转站页面构建成功！');
}

generate();