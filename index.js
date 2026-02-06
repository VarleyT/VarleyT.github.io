const fs = require('fs-extra');
const path = require('path');
const https = require('https');

// 个人信息配置
const USER_CONFIG = {
    title: "项目导航 - VarleyT",
    username: "VarleyT",
    avatar: "https://github.com/VarleyT.png",
    // 职业标签（参考你的嵌入式背景）
    bio: "嵌入式系统工程师 | Python & C 开发者" 
};

// 获取每日一句的辅助函数
function getDailyQuote() {
    return new Promise((resolve) => {
        https.get('https://v1.hitokoto.cn/?c=i&c=k', (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const { hitokoto, from } = JSON.parse(data);
                    resolve(`${hitokoto} —— 《${from}》`);
                } catch (e) {
                    resolve("保持热爱，奔赴山海。");
                }
            });
        }).on('error', () => resolve("代码是写给人看的，附带能在机器上运行。"));
    });
}

async function generate() {
    console.log('开始构建流程...');
    await fs.ensureDir('public');
    
    const dailyQuote = await getDailyQuote();
    const sites = await fs.readJson('sites.json');

    // 图标处理
    const faviconFile = 'favicon.ico';
    let hasFavicon = false;
    if (await fs.pathExists(faviconFile)) {
        await fs.copy(faviconFile, path.join('public', 'favicon.ico'));
        hasFavicon = true;
    }

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

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${USER_CONFIG.title}</title>
        ${hasFavicon ? '<link rel="icon" href="favicon.ico" type="image/x-icon">' : ''}
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
                font-family: -apple-system, system-ui, sans-serif;
                background-color: var(--bg-color); color: var(--text-main);
                display: flex; flex-direction: column; align-items: center;
                padding: 60px 20px; min-height: 100vh;
            }

            .profile { text-align: center; margin-bottom: 50px; }
            .avatar { width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--accent); padding: 3px; margin-bottom: 15px; }
            .profile h1 { font-size: 2.2rem; margin-bottom: 5px; font-weight: 700; }
            .username { color: var(--accent); font-weight: 600; margin-bottom: 25px; display: block; font-size: 1.1rem; }
            
            /* 每日一句打字机样式 */
            .quote-container {
                min-height: 50px;
                max-width: 650px;
                margin: 0 auto 40px;
                padding: 15px 25px;
                background: rgba(47, 129, 247, 0.05);
                border-radius: 12px;
                border: 1px dashed var(--border);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            #typewriter {
                color: var(--text-dim);
                font-family: "SFMono-Regular", Consolas, monospace;
                font-size: 1rem;
                line-height: 1.6;
                text-align: center;
            }
            #typewriter::after {
                content: '_';
                animation: blink 1s infinite;
                color: var(--accent);
                font-weight: bold;
            }
            @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

            .container { width: 100%; max-width: 1000px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
            .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 24px; transition: 0.3s; height: 100%; }
            .card:hover { transform: translateY(-4px); border-color: var(--accent); background: #1c2128; }
            .card-link { text-decoration: none; color: inherit; }
            .card h3 { margin-bottom: 12px; font-size: 1.2rem; }
            .card p { color: var(--text-dim); font-size: 0.9rem; line-height: 1.5; }
            .card-footer { margin-top: 20px; color: var(--accent); font-weight: 600; display: flex; align-items: center; font-size: 0.85rem; }
            .card-footer svg { margin-left: 6px; }
        </style>
    </head>
    <body>
        <div class="profile">
            <img src="${USER_CONFIG.avatar}" alt="Avatar" class="avatar">
            <h1>项目导航</h1>
            <span class="username">@${USER_CONFIG.username}</span>
            
            <div class="quote-container">
                <p id="typewriter"></p>
            </div>
        </div>

        <main class="container">
            <div class="grid">${listItems}</div>
        </main>

        <script>
            // 由 Node.js 构建时注入的今日名言
            const quote = ${JSON.stringify(dailyQuote)};
            let i = 0;
            const speed = 100; // 打字速度（毫秒）

            function typeWriter() {
                if (i < quote.length) {
                    document.getElementById("typewriter").innerHTML += quote.charAt(i);
                    i++;
                    setTimeout(typeWriter, speed);
                }
            }

            document.addEventListener('DOMContentLoaded', typeWriter);
        </script>
    </body>
    </html>
    `;

    await fs.writeFile(path.join('public', 'index.html'), htmlContent);
    console.log('构建成功：项目导航 - VarleyT (带打字机名言)');
}

generate();