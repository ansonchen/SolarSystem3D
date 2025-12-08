export function initContact() {
    // 1. Inject Styles
    const style = document.createElement('style');
    style.textContent = `
        #contact-btn {
            position: fixed;
            bottom: 5px;
            right: 20px;
            z-index: 2000; /* High z-index to be on top */
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #fff;
            padding: 8px 15px;
            border-radius: 20px;
            font-family: 'Orbitron', sans-serif;
            font-size: 12px;
            cursor: pointer;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 5px;
            outline: none;
        }

        #contact-btn:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: scale(1.05);
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
        }

        #contact-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 3000;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(3px);
        }

        #contact-modal.visible {
            opacity: 1;
            pointer-events: auto;
        }

        .contact-card {
            background: rgba(15, 25, 50, 0.85);
            border: 1px solid rgba(100, 200, 255, 0.3);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            color: #fff;
            font-family: 'Orbitron', sans-serif;
            box-shadow: 0 0 30px rgba(0, 150, 255, 0.2);
            transform: scale(0.9);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            max-width: 90%;
            width: 320px;
            position: relative;
        }

        #contact-modal.visible .contact-card {
            transform: scale(1);
        }

        .contact-title {
            font-size: 18px;
            margin-bottom: 20px;
            color: #4db8ff;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .contact-info {
            font-size: 16px;
            margin-bottom: 25px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            user-select: text; /* Allow copying */
            cursor: pointer;
            transition: background 0.2s;
        }

        .contact-info:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .contact-close {
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            font-size: 20px;
            cursor: pointer;
            transition: color 0.2s;
        }

        .contact-close:hover {
            color: #fff;
        }

        .copy-hint {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.5);
            margin-top: 5px;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
            #contact-btn {
                bottom: 15px;
                right: 15px;
                padding: 6px 12px;
                font-size: 11px;
            }
        }
    `;
    document.head.appendChild(style);

    // 2. Create Button
    const btn = document.createElement('button');
    btn.id = 'contact-btn';
    btn.innerHTML = '<span>✉</span> Contact Dev';
    document.body.appendChild(btn);

    // 3. Create Modal
    const modal = document.createElement('div');
    modal.id = 'contact-modal';
    modal.innerHTML = `
        <div class="contact-card">
            <button class="contact-close">&times;</button>
            <div class="contact-title">联系开发者<br><span style="font-size: 0.7em; opacity: 0.8;">Developer Contact</span></div>
            <div class="contact-info">
                微信 Wechat:<br>KK_Kirikaze
            </div>
            <div class="copy-hint">点击文字可复制 / Click text to copy</div>
        </div>
    `;
    document.body.appendChild(modal);

    // 4. Event Listeners
    const closeBtn = modal.querySelector('.contact-close');
    const contactInfo = modal.querySelector('.contact-info');
    const copyHint = modal.querySelector('.copy-hint');

    function openModal() {
        modal.classList.add('visible');
    }

    function closeModal() {
        modal.classList.remove('visible');
    }

    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering scene clicks
        openModal();
    });

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    contactInfo.addEventListener('click', () => {
        const wechatId = 'KK_Kirikaze';
        navigator.clipboard.writeText(wechatId).then(() => {
            const originalText = copyHint.textContent;
            copyHint.textContent = '已复制! / Copied!';
            copyHint.style.color = '#4db8ff';

            setTimeout(() => {
                copyHint.textContent = originalText;
                copyHint.style.color = 'rgba(255, 255, 255, 0.5)';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });
}
