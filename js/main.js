let itemCounter = 1;
const listNameInput = document.getElementById('listName');
const menuList = document.querySelector('.menu-sub');
const mainContent = document.querySelector('.content');

// 추가됨: 디바운싱을 위한 타이머 변수
let saveTimer = null;
/**
 * 코드 템플릿 모음
 */
const codeTemplates = {
    button: `<button class="btn">클릭하세요</button>

<style>
.btn {
    background: #1db954;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}
.btn:hover {
    background: #1ed760;
}
</style>`,

    card: `<div class="card">
    <div class="card-header">제목</div>
    <div class="card-body">
        <p>카드 내용을 입력하세요.</p>
    </div>
</div>

<style>
.card {
    width: 300px;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.card-header {
    background: #f5f5f5;
    padding: 15px;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
}
.card-body {
    padding: 15px;
}
</style>`,

    form: `<form class="form">
    <div class="form-group">
        <label>이름</label>
        <input type="text" placeholder="이름을 입력하세요">
    </div>
    <div class="form-group">
        <label>이메일</label>
        <input type="email" placeholder="이메일을 입력하세요">
    </div>
    <button type="submit">제출</button>
</form>

<style>
.form {
    max-width: 300px;
    padding: 20px;
}
.form-group {
    margin-bottom: 15px;
}
.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}
.form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
}
.form button {
    background: #1db954;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
}
</style>`,

    table: `<table class="table">
    <thead>
        <tr>
            <th>이름</th>
            <th>나이</th>
            <th>직업</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>홍길동</td>
            <td>25</td>
            <td>개발자</td>
        </tr>
        <tr>
            <td>김철수</td>
            <td>30</td>
            <td>디자이너</td>
        </tr>
    </tbody>
</table>

<style>
.table {
    width: 100%;
    border-collapse: collapse;
}
.table th, .table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
}
.table th {
    background: #f5f5f5;
}
.table tr:hover {
    background: #f9f9f9;
}
</style>`,

    flexbox: `<div class="flex-container">
    <div class="flex-item">1</div>
    <div class="flex-item">2</div>
    <div class="flex-item">3</div>
</div>

<style>
.flex-container {
    display: flex;
    gap: 10px;
    padding: 10px;
    background: #f0f0f0;
}
.flex-item {
    flex: 1;
    padding: 20px;
    background: #1db954;
    color: white;
    text-align: center;
    border-radius: 4px;
}
</style>`
};

document.addEventListener('DOMContentLoaded', () => {
    loadStateFromUrl();

    // 콘솔 메시지 리스너
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'console') {
            const activeSector = document.querySelector('.content-sector.active');
            if (activeSector) {
                const consoleOutput = activeSector.querySelector('.console-output');
                if (consoleOutput) {
                    const logDiv = document.createElement('div');
                    logDiv.className = `console-log ${event.data.logType}`;
                    logDiv.textContent = event.data.message;
                    consoleOutput.appendChild(logDiv);

                    // 자동 스크롤
                    consoleOutput.scrollTop = consoleOutput.scrollHeight;
                }
            }
        }
    });

    // 템플릿 버튼 클릭 이벤트 (이벤트 위임)
    mainContent.addEventListener('click', (event) => {
        if (event.target.classList.contains('template-btn')) {
            const templateName = event.target.dataset.template;
            const template = codeTemplates[templateName];

            if (template) {
                const sectorElement = event.target.closest('.content-sector');
                if (sectorElement && sectorElement.aceEditorInstance) {
                    const editor = sectorElement.aceEditorInstance;

                    // 현재 커서 위치에 삽입
                    editor.insert(template);
                    editor.focus()

                    // 저장 및 렌더링
                    saveStateToUrl();
                    renderCode(sectorElement);
                }
            }
        }
    });

    // 변경됨: 디바운싱 추가 (500ms)
    // textarea 가 변경될때마다 renderCode 를 실행시킴
    mainContent.addEventListener('input', (event) => {
        if (event.target.tagName === 'TEXTAREA') {
            const sectorElement = event.target.closest('.content-sector');

            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {

                // 디바운싱마다 url로 현재상태 저장
                saveStateToUrl();
                // --- 추가: 렌더링 호출 ---
                renderCode(sectorElement);
            }, 500);
        }
    });

    // 추가됨: 스플리터 초기화
    initSplitters();
    // --- 추가: 초기 로드 시 모든 섹터 렌더링 ---
    document.querySelectorAll('.content-sector').forEach(renderCode);
});

// 추가됨: 개별 섹터의 스플리터 초기화
function initSectorSplitter(sectorElement) {
    const horizontalSplitter = sectorElement.querySelector('.splitter-horizontal');
    const verticalSplitter = sectorElement.querySelector('.splitter-vertical');
    const leftContainer = sectorElement.querySelector('.left-container');
    const memoArea = sectorElement.querySelector('.memo-area');
    const descriptionArea = sectorElement.querySelector('.description-area');
    const rightContainer = sectorElement.querySelector('.right-container');

    const resultIframe = sectorElement.querySelector('.result-iframe'); // 추가

    const horizontalConsoleSplitter = sectorElement.querySelector('.splitter-console'); // 추가 콘솔 splitter
    const resultArea = sectorElement.querySelector('.result-area'); // result 영역
    const consoleArea = sectorElement.querySelector('.console-area'); // console 영역

    let isResizing = false;
    let currentSplitter = null;
    let startY = 0;
    let startX = 0;
    let startMemoRatio = 1;
    let startDescriptionRatio = 1;
    let startResultRatio = 1;
    let startLeftRatio = 1;
    let startRightRatio = 1;

    let startConsoleRatio = 1;

    // rAF용 latest mouse point
    let latestMouseX = null;
    let latestMouseY = null;

    // 초기 비율 설정
    memoArea.style.flex = '2 0 0';
    descriptionArea.style.flex = '1 0 0';
    leftContainer.style.flex = '1 0 0';
    rightContainer.style.flex = '1 0 0';

    resultArea.style.flex = '4 0 0';
    consoleArea.style.flex = '1 0 0';

    horizontalSplitter.addEventListener('mousedown', (e) => {
        isResizing = true;
        currentSplitter = 'horizontal';
        horizontalSplitter.classList.add('active');

        resultIframe.classList.add('dragging'); // 추가

        latestMouseX = e.clientX;
        latestMouseY = e.clientY;

        startY = e.clientY;
        const memoHeight = memoArea.getBoundingClientRect().height;
        const descriptionHeight = descriptionArea.getBoundingClientRect().height;
        const totalHeight = memoHeight + descriptionHeight;

        startMemoRatio = memoHeight / totalHeight;
        startDescriptionRatio = descriptionHeight / totalHeight;

        e.preventDefault();
    });

    verticalSplitter.addEventListener('mousedown', (e) => {
        isResizing = true;
        currentSplitter = 'vertical';
        verticalSplitter.classList.add('active');

        resultIframe.classList.add('dragging'); // 추가

        latestMouseX = e.clientX;
        latestMouseY = e.clientY;

        startX = e.clientX;
        const leftWidth = leftContainer.getBoundingClientRect().width;
        const rightWidth = rightContainer.getBoundingClientRect().width;
        const totalWidth = leftWidth + rightWidth;

        startLeftRatio = leftWidth / totalWidth;
        startRightRatio = rightWidth / totalWidth;

        e.preventDefault();
    });

    horizontalConsoleSplitter.addEventListener('mousedown', (e) => {
        isResizing = true;
        currentSplitter = 'horizontalConsole';
        horizontalConsoleSplitter.classList.add('active');

        resultIframe.classList.add('dragging'); // 추가

        latestMouseX = e.clientX;
        latestMouseY = e.clientY;

        startY = e.clientY;
        const resultHeight = resultArea.getBoundingClientRect().height;
        const consoleHeight = consoleArea.getBoundingClientRect().height;
        const totalHeight = resultHeight + consoleHeight;

        startResultRatio = resultHeight / totalHeight;
        startConsoleRatio = consoleHeight / totalHeight;

        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        latestMouseX = e.clientX;
        latestMouseY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            horizontalSplitter.classList.remove('active');
            verticalSplitter.classList.remove('active');
            horizontalConsoleSplitter.classList.remove('active');
            resultIframe.classList.remove('dragging'); // 추가
            currentSplitter = null;
        }
    });

    // rAF 루프: 계속 실행되며, 좌표 변화가 있을 때만 UI 업데이트
    function update() {
        if (isResizing && (latestMouseX !== null || latestMouseY !== null)) {
            if (currentSplitter === 'horizontal') {
                const containerHeight = leftContainer.getBoundingClientRect().height - 4;
                const deltaY = latestMouseY - startY;

                const currentMemoHeight = containerHeight * startMemoRatio;
                const newMemoHeight = currentMemoHeight + deltaY;

                const newMemoRatio = newMemoHeight / containerHeight;
                const newDescriptionRatio = 1 - newMemoRatio;

                if (newMemoRatio > 0.1 && newMemoRatio < 0.9) {
                    memoArea.style.flex = `${newMemoRatio} 0 0`;
                    descriptionArea.style.flex = `${newDescriptionRatio} 0 0`;
                }
            } else if (currentSplitter === 'vertical') {
                const containerWidth = sectorElement.querySelector('.sector-grid-container')
                    .getBoundingClientRect().width - 4;

                const deltaX = latestMouseX - startX;

                const currentLeftWidth = containerWidth * startLeftRatio;
                const newLeftWidth = currentLeftWidth + deltaX;

                const newLeftRatio = newLeftWidth / containerWidth;
                const newRightRatio = 1 - newLeftRatio;

                if (newLeftRatio > 0.2 && newLeftRatio < 0.8) {
                    leftContainer.style.flex = `${newLeftRatio} 0 0`;
                    rightContainer.style.flex = `${newRightRatio} 0 0`;
                }
            } else if (currentSplitter === 'horizontalConsole') {
                const containerHeight = rightContainer.getBoundingClientRect().height - 4;
                const deltaY = latestMouseY - startY;

                const currentResultHeight = containerHeight * startResultRatio;
                const newResultHeight = currentResultHeight + deltaY;

                const newResultRatio = newResultHeight / containerHeight;
                const newConsoleRatio = 1 - newResultRatio;

                if (newResultRatio > 0.1 && newResultRatio < 0.9) {
                    resultArea.style.flex = `${newResultRatio} 0 0`;
                    consoleArea.style.flex = `${newConsoleRatio} 0 0`;
                }
            }
        }

        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

function initSplitters() {
    // 모든 content-sector에 대해 스플리터 초기화
    document.querySelectorAll('.content-sector').forEach(sector => {
        initSectorSplitter(sector);
    });
}


function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

// 리스트 추가 및 변경
const btn = {
    add: function () {
        const itemName = listNameInput.value.trim();
        const itemID = "sector-" + itemCounter;
        const menuID = "menu-" + itemCounter;

        if (itemName == '') {
            alert("리스트 추가 필요");
            return;
        }

        // 추가됨: 동일한 이름 체크
        const existingNames = Array.from(document.querySelectorAll('.menu-sub .menu-item div'))
            .map(div => div.textContent.trim());

        if (existingNames.includes(itemName)) {
            alert(`"${itemName}" 이름은 이미 존재합니다!`);
            return;
        }

        const li = document.createElement('li');
        li.className = 'menu-item';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-primary btn-delete';
        deleteBtn.textContent = '-';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.delete(itemID);
        });

        const a = document.createElement('a');
        a.href = '#';
        a.className = 'menu-link';
        a.setAttribute('data-tooltip', itemName)
        a.id = menuID;

        a.addEventListener('click', (event) => {
            event.preventDefault();
            this.changeSector(itemID, a);
        });

        a.innerHTML = `
                <span class="menu-icon">📝</span>
                <div>${itemName}</div>
            `;

        li.appendChild(deleteBtn);
        li.appendChild(a);
        menuList.appendChild(li);

        // 수정됨: 스플리터 구조로 content-sector 생성
        const sectorDiv = document.createElement('div');
        sectorDiv.className = 'content-sector';
        sectorDiv.id = itemID;

        const editorID = "editor-" + itemCounter;

        sectorDiv.innerHTML = `
                <div class="sector-grid-container">
                    <div class="left-container">
                        <div class="template-bar">
                            <button class="template-btn" data-template="button">버튼</button>
                            <button class="template-btn" data-template="card">카드</button>
                            <button class="template-btn" data-template="form">폼</button>
                            <button class="template-btn" data-template="table">테이블</button>
                            <button class="template-btn" data-template="flexbox">Flexbox</button>
                        </div>
                        <div class="memo-area">
                            <div id="${editorID}" class="ace-editor-input"></div>
                        </div>
                        <div class="splitter splitter-horizontal"></div>
                        <div class="description-area">
                            <textarea class="description-input" placeholder="설명 입력 구역"></textarea>
                        </div>
                    </div>
                    <div class="splitter splitter-vertical"></div>                   
                    <div class="right-container">
                        <div class="result-area">
                            <iframe class="result-iframe" sandbox="allow-scripts allow-modals"></iframe>
                        </div>
                        <div class="splitter splitter-console"></div>
                        <div class="console-area">
                            <div class="console-header">
                                <span>콘솔</span>
                                <button class="console-clear-btn" onclick="clearConsole(this)">지우기</button>
                            </div>
                            <div class="console-output"></div>
                        </div>
                    </div>
                </div>
            `;

        mainContent.appendChild(sectorDiv);

        // 추가됨: 새로 생성된 섹터의 스플리터 초기화
        initSectorSplitter(sectorDiv);

        // 추가됨: 새로 생성된 섹터에 Ace Editor 초기화
        initAceEditor(sectorDiv, '');

        this.changeSector(itemID, a);

        listNameInput.value = '';

        itemCounter++;

        saveStateToUrl();
    },
    /**
     * 특정 섹터 삭제
     * @param {string} sectorId - 삭제할 섹터 ID
     */
    delete: function(sectorId) {
        const sector = document.getElementById(sectorId);
        const menuId = sectorId.replace('sector-', 'menu-');
        const menu = document.getElementById(menuId);

        if (!sector || !menu) return;

        const menuName = menu.querySelector('div').textContent;
        if (!confirm(`"${menuName}" 리스트를 삭제하시겠습니까?`)) {
            return;
        }

        const isActive = sector.classList.contains('active');

        // DOM에서 삭제
        sector.remove();
        menu.closest('.menu-item').remove();

        // 삭제한 게 활성 상태였으면 다른 섹터 활성화
        if (isActive) {
            const remainingSectors = document.querySelectorAll('.content-sector');
            if (remainingSectors.length > 0) {
                const nextSector = remainingSectors[0];
                const nextMenuId = nextSector.id.replace('sector-', 'menu-');
                const nextMenu = document.getElementById(nextMenuId);
                this.changeSector(nextSector.id, nextMenu);
            }
        }

        saveStateToUrl();
    },
    changeSector: function (sectorIdToShow, clickedLink) {
        document.querySelectorAll('.menu-link').forEach(link => {
            link.classList.remove('active');
        });

        document.querySelectorAll('.content-sector').forEach(sector => {
            sector.classList.remove('active');
        });

        if (clickedLink) {
            clickedLink.classList.add('active');
        }

        const sectorToShow = document.getElementById(sectorIdToShow);
        if (sectorToShow) {
            sectorToShow.classList.add('active');
        }

        saveStateToUrl();
    }
}

// 변경될때마다 url 저장
function saveStateToUrl() {
    const sectors = [];
    document.querySelectorAll('.content-sector').forEach((sectorDiv, index) => {
        const menuItem = document.querySelectorAll('.menu-sub .menu-item')[index];
        const menuName = menuItem.querySelector('div').textContent;

        // 수정됨: 스플리터 구조에서 textarea 찾기
        // const memoContent = sectorDiv.querySelector('.memo-input')?.value || '';
        // 🌟 변경: textarea 대신 Ace 인스턴스에서 코드 가져오기 🌟
        const aceEditor = sectorDiv.aceEditorInstance;
        const memoContent = aceEditor ? aceEditor.getValue() : sectorDiv.querySelector('.ace-editor-input')?.textContent || '';

        const descContent = sectorDiv.querySelector('.description-input')?.value || '';
        //const resultContent = sectorDiv.querySelector('.result-output')?.textContent || '';   //어차피 렌더링 새로함 -> 결과는 따로저장x

        sectors.push({
            id: sectorDiv.id,
            name: menuName,
            memo: memoContent,
            description: descContent,
            //result: resultContent
        });
    });

    const activeMenu = document.querySelector('.menu-link.active');
    const finalActiveMenuId = activeMenu ? activeMenu.id : null;

    const activeSector = document.querySelector('.content-sector.active');
    const finalSectorActiveId = activeSector ? activeSector.id : null;

    const state = {
        sectors: sectors,
        activeMenuId: finalActiveMenuId,
        activeSectorId: finalSectorActiveId
    };

    try {
        const jsonString = JSON.stringify(state);
        const utf8EncodedString = encodeURIComponent(jsonString);
        const base64String = btoa(utf8EncodedString);

        window.location.hash = base64String;

    } catch (e) {
        console.error("상태 저장 실패:", e);
    }
}

// url 로드
function loadStateFromUrl() {
    const hash = window.location.hash.substring(1);
    if (!hash) {
        itemCounter = 1;  // 초기 상태
        return;
    }

    try {
        const jsonString = atob(hash);
        const state = JSON.parse(decodeURIComponent(jsonString));

        if (!state.sectors) return;

        const menuList = document.querySelector('.menu-sub');
        const mainContent = document.querySelector('.content');

        menuList.innerHTML = '';
        mainContent.innerHTML = '';

        state.sectors.forEach(sector => {
            const li = document.createElement('li');
            li.className = 'menu-item';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-primary btn-delete';
            deleteBtn.textContent = '-';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                btn.delete(sector.id);
            });

            const a = document.createElement('a');
            a.href = '#';
            a.className = 'menu-link';
            a.setAttribute('data-tooltip', sector.name);

            a.id = sector.id.replace('sector-', 'menu-');

            a.addEventListener('click', (e) => {
                e.preventDefault();
                btn.changeSector(sector.id, a);
            });
            a.innerHTML = `<span class="menu-icon">📝</span><div>${sector.name}</div>`;
            li.appendChild(deleteBtn);
            li.appendChild(a);
            menuList.appendChild(li);

            // 수정됨: 스플리터 구조로 복원
            const sectorDiv = document.createElement('div');
            sectorDiv.className = 'content-sector';
            sectorDiv.id = sector.id;

            const editorID = sector.id.replace('sector-', 'editor-');
            sectorDiv.innerHTML = `
                    <div class="sector-grid-container">
                        <div class="left-container">
                            <div class="template-bar">
                                <button class="template-btn" data-template="button">버튼</button>
                                <button class="template-btn" data-template="card">카드</button>
                                <button class="template-btn" data-template="form">폼</button>
                                <button class="template-btn" data-template="table">테이블</button>
                                <button class="template-btn" data-template="flexbox">Flexbox</button>
                            </div>
                            <div class="memo-area">
                                <div id="${editorID}" class="ace-editor-input">${sector.memo || ''}</div>
                            </div>
                            <div class="splitter splitter-horizontal"></div>
                            <div class="description-area">
                                <textarea class="description-input" placeholder="설명 입력 구역">${sector.description || ''}</textarea>
                            </div>
                        </div>
                        <div class="splitter splitter-vertical"></div>
                        <div class="right-container">
                            <div class="result-area">
                                <iframe class="result-iframe" sandbox="allow-scripts allow-modals"></iframe>
                            </div>
                            <div class="splitter splitter-console"></div>
                            <div class="console-area">
                                <div class="console-header">
                                    <span>콘솔</span>
                                    <button class="console-clear-btn" onclick="clearConsole(this)">지우기</button>
                                </div>
                                <div class="console-output"></div>
                            </div>
                        </div>
                    </div>
                `;

            mainContent.appendChild(sectorDiv);

            // 추가됨: 복원된 섹터의 스플리터 초기화
            initSectorSplitter(sectorDiv);

            // 추가됨: 복원된 섹터에 Ace Editor 초기화 (저장된 코드 전달)
            initAceEditor(sectorDiv, sector.memo || '');
        });

        if (state.activeSectorId) {
            // ID로 실제 element 찾기
            const activeLink = state.activeMenuId
                ? document.getElementById(state.activeMenuId)
                : null;
            btn.changeSector(state.activeSectorId, activeLink);
        }

        // itemCounter = state.sectors.length + 1;
        // 변경: 최대 ID + 1로 설정 (중복 방지)
        if (state.sectors.length > 0) {
            const maxId = Math.max(...state.sectors.map(s => {
                const num = parseInt(s.id.replace('sector-', ''));
                return isNaN(num) ? 0 : num;
            }));
            itemCounter = maxId + 1;
        } else {
            itemCounter = 1;
        }

    } catch (e) {
        console.error("상태 복원 실패:", e);
    }
}

// --- 코드 렌더링 함수 ---
function renderCode(sectorElement) {

    // 🌟 변경: memoInput 대신 Ace 인스턴스 참조 🌟
    const aceEditor = sectorElement.aceEditorInstance;
    const resultIframe = sectorElement.querySelector('.result-iframe');
    const consoleOutput = sectorElement.querySelector('.console-output');

    if (!aceEditor || !resultIframe) return;

    // 콘솔 초기화
    if (consoleOutput) {
        consoleOutput.innerHTML = '';
    }

    // Ace 인스턴스에서 현재 코드 가져오기
    const code = aceEditor.getValue();

    // 콘솔 오버라이드 스크립트
    const consoleOverride = `
        <script>
            (function() {
                const originalConsole = {
                    log: console.log,
                    error: console.error,
                    warn: console.warn,
                    info: console.info
                };
                
                function sendToParent(type, args) {
                    const message = Array.from(args).map(arg => {
                        if (typeof arg === 'object') {
                            try {
                                return JSON.stringify(arg, null, 2);
                            } catch (e) {
                                return String(arg);
                            }
                        }
                        return String(arg);
                    }).join(' ');
                    
                    parent.postMessage({
                        type: 'console',
                        logType: type,
                        message: message
                    }, '*');
                }
                
                console.log = function() {
                    sendToParent('log', arguments);
                    originalConsole.log.apply(console, arguments);
                };
                
                console.error = function() {
                    sendToParent('error', arguments);
                    originalConsole.error.apply(console, arguments);
                };
                
                console.warn = function() {
                    sendToParent('warn', arguments);
                    originalConsole.warn.apply(console, arguments);
                };
                
                console.info = function() {
                    sendToParent('info', arguments);
                    originalConsole.info.apply(console, arguments);
                };
                
                // 에러 캐치
                window.onerror = function(msg, url, line, col, error) {
                    sendToParent('error', ['Error: ' + msg + ' (line ' + line + ')']);
                    return false;
                };
            })();
        <\/script>
    `;

    // 2. 입력된 코드를 포함하는 완전한 HTML 문서 템플릿을 만듭니다.
    // 사용자가 CSS를 입력했다고 가정하고 <style> 태그로 묶습니다.
    // HTML 코드는 <body> 안에 삽입됩니다.
    const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                ${consoleOverride}
                <style>
                    /* 기본 margin 제거 및 iframe 크기 조정에 유연하도록 설정 */
                    body { margin: 0; padding: 0; font-family: sans-serif; }
                </style>
            </head>
            <body>
                ${code}
            </body>
            </html>
        `;

    // 3. iframe에 콘텐츠를 씁니다.// srcdoc 사용
    resultIframe.srcdoc = content;
}

// --- 추가: Ace Editor 초기화 및 이벤트 연결 함수 ---
function initAceEditor(sectorElement, initialCode) {
    const editorID = sectorElement.querySelector('.ace-editor-input').id;

    // Ace 인스턴스 생성
    const editor = ace.edit(editorID);

    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
    });

    // 기본 설정
    editor.setTheme("ace/theme/monokai"); // 다크 테마 설정
    editor.session.setMode("ace/mode/html"); // 기본 모드는 HTML로 설정
    editor.setValue(initialCode || "", -1); // 코드 설정 및 커서를 시작 위치로 이동

    // 에디터의 변경 이벤트 리스너
    editor.session.on('change', () => {
        // Ace 에디터 변경 시에도 기존 디바운싱 로직을 따르도록 구현

        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            // Ace에서 변경된 코드 가져오기
            // const currentCode = editor.getValue();

            // Ace 인스턴스에 임시로 값 저장 (상태 저장 시 사용하기 위함)
            sectorElement.aceEditorInstance = editor;

            saveStateToUrl();
            renderCode(sectorElement);
        }, 500);
    });

    // Ace 인스턴스를 섹터 요소에 저장하여 나중에 접근할 수 있게 함
    sectorElement.aceEditorInstance = editor;
}

/**
 * 콘솔 출력 지우기
 * @param {HTMLElement} btn - 클릭된 버튼
 */
function clearConsole(btn) {
    const consoleOutput = btn.closest('.console-area').querySelector('.console-output');
    if (consoleOutput) {
        consoleOutput.innerHTML = '';
    }
}

function downloadHTML() {
    const activeSector = document.querySelector('.content-sector.active');

    if (!activeSector) {
        alert('다운로드할 리스트를 선택해주세요.');
        return;
    }

    const aceEditor = activeSector.aceEditorInstance;
    if (!aceEditor) return;

    const code = aceEditor.getValue();

    // 완전한 HTML 문서 생성
    const content = `<!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <style>
                body { margin: 0; padding: 0; font-family: sans-serif; }
            </style>
        </head>
        <body>
        ${code}
        </body>
        </html>`;

    // 파일명 가져오기 (메뉴 이름 사용)
    const menuId = activeSector.id.replace('sector-', 'menu-');
    const menu = document.getElementById(menuId);
    const fileName = menu ? menu.querySelector('div').textContent.trim() : 'download';

    // Blob 생성 및 다운로드
    const blob = new Blob([content], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.html`;
    a.click();

    URL.revokeObjectURL(url);
}