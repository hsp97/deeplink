let itemCounter = 1;
const listNameInput = document.getElementById('listName');
const menuList = document.querySelector('.menu-sub');
const mainContent = document.querySelector('.content');

// 디바운싱을 위한 타이머 변수
let saveTimer = null;

// 실시간 렌더링 활성화 유무
let liveMode = true;
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
</style>`,
    sample: `
    <div class="container">
  <h1>Hello World!</h1>
  <p>Live Editor에 오신 것을 환영합니다.</p>
  <button id="myBtn">클릭하세요</button>
  <p id="output"></p>
</div>

<style>
.container {
  font-family: Arial, sans-serif;
  padding: 20px;
  text-align: center;
}

h1 {
  color: #333;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
</style>
<script>
const btn = document.getElementById('myBtn');
const output = document.getElementById('output');
let count = 0;

btn.addEventListener('click', () => {
  count++;
  output.textContent = count + '번 클릭했습니다!';
  console.log('버튼 클릭:', count);
});

console.log('JavaScript가 로드되었습니다!');
</script>
    `

};

/**
 * 라이브러리 cdn 모음
 */
const libraryUrls = {
    jquery: {
        js: ['https://code.jquery.com/jquery-3.7.1.min.js']
    },
    bootstrap: {
        css: ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'],
        js: ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js']
    },
    tailwind: {
        js: ['https://cdn.tailwindcss.com']
    },
    vue: {
        js: ['https://unpkg.com/vue@3/dist/vue.global.js']
    }
};


/**
 * 클릭 이벤트 핸들러 모음
 */
const clickHandlers = {
    // 탭 전환
    handleTabClick: function(event, sectorElement) {
        const tab = event.target.closest('.editor-tab');
        if (!tab) return false;

        const tabType = tab.dataset.tab;

        sectorElement.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        sectorElement.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        sectorElement.querySelector(`.${tabType}-content`).classList.add('active');

        const editor = sectorElement.aceEditorInstance;
        if (editor) {
            const resultArea = sectorElement.querySelector('.result-area'); // result 영역
            const consoleArea = sectorElement.querySelector('.console-area'); // console 영역

            // 프론트엔드와 백엔드 콘솔창 비율 조절
            if (tabType === 'backend') {
                const language = sectorElement.querySelector('.language-radio input:checked').value;
                updateEditorMode(editor, language);

                resultArea.style.flex = `1 0 0`;
                consoleArea.style.flex = `15 0 0`;
            } else {
                updateEditorMode(editor, 'html');

                resultArea.style.flex = `4 0 0`;
                consoleArea.style.flex = `1 0 0`;
            }
        }
        return true;
    },

    // 템플릿 버튼
    handleTemplateClick: function(event, sectorElement) {
        if (!event.target.classList.contains('template-btn')) return false;

        const templateName = event.target.dataset.template;
        const template = codeTemplates[templateName];

        if (template && sectorElement.aceEditorInstance) {
            const editor = sectorElement.aceEditorInstance;
            editor.insert(template + '\n');
            editor.focus();
            saveStateToUrl();
            renderCode(sectorElement);
        }
        return true;
    },

    // 포맷 버튼
    handleFormatClick: function(event, sectorElement) {
        if (!event.target.classList.contains('format-btn')) return false;
        formatCode(event.target);
        return true;
    },

    // 실행 버튼
    handleRunClick: async function(event, sectorElement) {
        if (!event.target.classList.contains('run-btn')) return false;

        const btn = event.target;
        const editor = sectorElement.aceEditorInstance;
        if (!editor) return true;

        const code = editor.getValue();
        if (!code.trim()) {
            alert('실행할 코드를 입력하세요.');
            return true;
        }

        const languageInput = sectorElement.querySelector('.language-radio input:checked');
        const language = languageInput ? languageInput.value : 'python';
        const consoleOutput = sectorElement.querySelector('.console-output');

        btn.disabled = true;
        btn.textContent = '실행 중...';
        consoleOutput.innerHTML = '';

        appendConsoleLog(consoleOutput, `[${language.toUpperCase()}] 코드 실행 중...`, 'info');

        try {
            const result = await executeCode(language, code);

            if (result.run) {
                if (result.run.stdout) {
                    appendConsoleLog(consoleOutput, result.run.stdout, 'log');
                }
                if (result.run.stderr) {
                    appendConsoleLog(consoleOutput, result.run.stderr, 'error');
                }
                if (!result.run.stdout && !result.run.stderr) {
                    appendConsoleLog(consoleOutput, '(출력 없음)', 'info');
                }
                appendConsoleLog(consoleOutput, `[완료] 실행 시간: ${result.run.time || 0}ms`, 'info');
            }

            if (result.message) {
                appendConsoleLog(consoleOutput, `[에러] ${result.message}`, 'error');
            }
        } catch (error) {
            appendConsoleLog(consoleOutput, `[에러] API 호출 실패: ${error.message}`, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = '▶ 실행';
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
        }
        return true;
    }
};


new Sortable(menuList, {
    animation: 150,
    handle: '.menu-link',  // 드래그 핸들 (메뉴 링크 영역)
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onEnd: function(evt) {
        // 메뉴 순서에 맞게 섹터 순서도 변경
        const menuItems = document.querySelectorAll('.menu-sub .menu-item');
        const contentArea = document.querySelector('.content');

        // 섹터들을 메뉴 순서대로 재배치
        menuItems.forEach(menuItem => {
            const menuLink = menuItem.querySelector('.menu-link');
            const sectorId = menuLink.id.replace('menu-', 'sector-');
            const sector = document.getElementById(sectorId);

            if (sector) {
                contentArea.appendChild(sector);
            }
        });

        saveStateToUrl();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadStateFromUrl();

    menuList.addEventListener('dblclick', (event) => {
        const menuLink = event.target.closest('.menu-link');
        if (!menuLink) return;

        const nameDiv = menuLink.querySelector('div');
        if (!nameDiv) return;

        const currentName = nameDiv.textContent.trim();

        // 이미 편집 중이면 무시
        if (menuLink.querySelector('.edit-input')) return;

        // input 생성
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = currentName;

        // 기존 이름 숨기고 input 삽입
        nameDiv.style.display = 'none';
        menuLink.appendChild(input);
        input.focus();
        input.select();

        // 저장 함수
        const saveName = () => {
            const newName = input.value.trim();

            if (newName && newName !== currentName) {
                // 중복 체크
                const existingNames = Array.from(
                        document.querySelectorAll('.menu-sub .menu-item div')
                    )
                    .map(div => div.textContent.trim())
                    .filter(name => name !== currentName);

                if (existingNames.includes(newName)) {
                    alert(`"${newName}" 이름은 이미 존재합니다!`);
                    nameDiv.style.display = '';
                    input.remove();
                    return;
                }

                nameDiv.textContent = newName;
                menuLink.setAttribute('data-tooltip', newName);
                saveStateToUrl();
            }

            nameDiv.style.display = '';
            input.remove();
        };

        // Enter 키로 저장
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveName();
            }
            if (e.key === 'Escape') {
                nameDiv.style.display = '';
                input.remove();
            }
        });

        const cancelEdit = () => {
            nameDiv.style.display = '';
            input.remove();
        };

        // 외곽 클릭시에는 수정 취소
        input.addEventListener('blur', cancelEdit);
    });

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
    mainContent.addEventListener('click', async (event) => {

        const sectorElement = event.target.closest('.content-sector');
        if (!sectorElement) return;

        // 각 핸들러 순차 실행 (처리되면 중단)
        if (clickHandlers.handleTabClick(event, sectorElement)) return;
        if (clickHandlers.handleTemplateClick(event, sectorElement)) return;
        if (clickHandlers.handleFormatClick(event, sectorElement)) return;
        await clickHandlers.handleRunClick(event, sectorElement);

    });

    // 라이브러리 체크박스 변경 이벤트
    mainContent.addEventListener('change', (event) => {

        const sectorElement = event.target.closest('.content-sector');

        if (event.target.matches('.language-radio input[type="radio"]')) {
            const editor = sectorElement.aceEditorInstance;
            if (editor) {
                updateEditorMode(editor, event.target.value);
            }
        }

        if (event.target.matches('.library-checkbox input[type="checkbox"]')) {
            if (sectorElement) {
                saveStateToUrl();
                renderCode(sectorElement);
            }
        }
    });

    // 디바운싱 추가 (500ms)
    // textarea 가 변경될때마다 renderCode 를 실행시킴
    mainContent.addEventListener('input', (event) => {
        if (event.target.tagName === 'TEXTAREA') {
            const sectorElement = event.target.closest('.content-sector');

            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {

                // 디바운싱마다 url로 현재상태 저장
                saveStateToUrl();
                // 렌더링 호출
                renderCode(sectorElement);
            }, 500);
        }
    });

    // 스플리터 초기화
    initSplitters();
    // --- 초기 로드 시 모든 섹터 렌더링 ---
    document.querySelectorAll('.content-sector').forEach(renderCode);

    /**
     * ESC 키로 전체화면 해제
     */
    document.addEventListener('keydown', (e) => {
        const activeSector = document.querySelector('.content-sector.active');

        // ESC - 전체화면 해제
        if (e.key === 'Escape') {
            const fullscreenArea = document.querySelector('.result-area.fullscreen');
            if (fullscreenArea) {
                const btn = fullscreenArea.querySelector('.fullscreen-btn');
                toggleFullscreen(btn);
            }
        }

        // F11 - 전체화면 토글
        if (e.key === 'F11') {
            e.preventDefault();
            if (activeSector) {
                const btn = activeSector.querySelector('.fullscreen-btn');
                if (btn) toggleFullscreen(btn);
            }
            return;
        }

        // Ctrl 조합키
        if (e.ctrlKey) {
            // Ctrl + S - 저장
            if (e.key === 's') {
                /*
                ** 기능 추가 보류
                e.preventDefault();
                saveStateToUrl();
                showToast('저장되었습니다');
                 */
                return;
            }

            // Ctrl + Enter - 실행
            if (e.key === 'Enter') {
                /*
                ** 기능 추가 보류
                e.preventDefault();
                if (activeSector) {
                    renderCode(activeSector);
                    showToast('실행되었습니다');
                }
                */
                return;
            }

            // Ctrl + D - 다운로드
            if (e.key === 'd') {
                e.preventDefault();
                downloadHTML();
                return;
            }

            // Ctrl + Shift + F - 포맷팅
            if (e.shiftKey && e.key === 'F') {
                e.preventDefault();
                if (activeSector) {
                    const formatBtn = activeSector.querySelector('.format-btn');
                    if (formatBtn) formatCode(formatBtn);
                }
                return;
            }
        }

    });

});

// 개별 섹터의 스플리터 초기화
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

        // 동일한 이름 체크
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

        // 스플리터 구조로 content-sector 생성
        const sectorDiv = document.createElement('div');
        sectorDiv.className = 'content-sector';
        sectorDiv.id = itemID;

        const editorID = "editor-" + itemCounter;

        sectorDiv.innerHTML = `
                <div class="sector-grid-container">
                    <div class="left-container">
                        <div class="editor-tabs">
                            <button class="editor-tab active" data-tab="frontend">프론트엔드</button>
                            <button class="editor-tab" data-tab="backend">백엔드</button>
                        </div>
                        <div class="tab-content frontend-content active">
                            <div class="template-bar">
                                <button class="template-btn" data-template="button">버튼</button>
                                <button class="template-btn" data-template="card">카드</button>
                                <button class="template-btn" data-template="form">폼</button>
                                <button class="template-btn" data-template="table">테이블</button>
                                <button class="template-btn" data-template="flexbox">Flexbox</button>
                                <button class="format-btn">코드 정렬</button>
                            </div>
                            <div class="library-bar">
                                <label class="library-checkbox">
                                    <input type="checkbox" data-library="jquery"> jQuery
                                </label>
                                <label class="library-checkbox">
                                    <input type="checkbox" data-library="bootstrap"> Bootstrap
                                </label>
                                <label class="library-checkbox">
                                    <input type="checkbox" data-library="tailwind"> Tailwind
                                </label>
                                <label class="library-checkbox">
                                    <input type="checkbox" data-library="vue"> Vue.js
                                </label>
                            </div>
                        </div>
                        <div class="tab-content backend-content">
                            <div class="language-bar">
                                <label class="language-radio">
                                    <input type="radio" name="language-${itemCounter}" value="python" checked> Python
                                </label>
                                <label class="language-radio">
                                    <input type="radio" name="language-${itemCounter}" value="java"> Java
                                </label>
                                <label class="language-radio">
                                    <input type="radio" name="language-${itemCounter}" value="php"> PHP
                                </label>
                                <label class="language-radio">
                                    <input type="radio" name="language-${itemCounter}" value="typescript"> Typescript
                                </label>
                                <button class="run-btn">▶ 실행</button>
                            </div>
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
                            <button class="fullscreen-btn" onclick="toggleFullscreen(this)">⛶</button>
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

        // 새로 생성된 섹터의 스플리터 초기화
        initSectorSplitter(sectorDiv);

        // 새로 생성된 섹터에 Ace Editor 초기화
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

        // 스플리터 구조에서 textarea 찾기
        // const memoContent = sectorDiv.querySelector('.memo-input')?.value || '';
        // Ace 인스턴스에서 코드 가져오기
        const aceEditor = sectorDiv.aceEditorInstance;
        const memoContent = aceEditor ? aceEditor.getValue() : sectorDiv.querySelector('.ace-editor-input')?.textContent || '';

        const descContent = sectorDiv.querySelector('.description-input')?.value || '';
        //const resultContent = sectorDiv.querySelector('.result-output')?.textContent || '';   //어차피 렌더링 새로함 -> 결과는 따로저장x

        const selectedLibraries = [];
        sectorDiv.querySelectorAll('.library-checkbox input:checked').forEach(checkbox => {
            selectedLibraries.push(checkbox.dataset.library);
        });

        // 현재 활성 탭 (프론트엔드/백엔드)
        const activeTab = sectorDiv.querySelector('.editor-tab.active');
        const selectedEditor = activeTab ? activeTab.dataset.tab : 'frontend';

        // 선택된 언어 (백엔드용)
        const languageInput = sectorDiv.querySelector('.language-radio input:checked');
        const selectedLanguage = languageInput ? languageInput.value : 'python';

        sectors.push({
            id: sectorDiv.id,
            name: menuName,
            memo: memoContent,
            description: descContent,
            libraries: selectedLibraries,
            editor: selectedEditor,
            language: selectedLanguage
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
        /*
        const utf8EncodedString = encodeURIComponent(jsonString);
        const base64String = btoa(utf8EncodedString);
        */

        // LZString.compressToEncodedURIComponent를 사용하여 URL에 안전하게 압축 (압축률 대략 70%)
        const compressedData = LZString.compressToEncodedURIComponent(jsonString);
        window.location.hash = compressedData;

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
        // const jsonString = atob(hash);
        // const state = JSON.parse(decodeURIComponent(jsonString));
        const jsonString = LZString.decompressFromEncodedURIComponent(hash);
        const state = JSON.parse(jsonString);

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

            // 스플리터 구조로 복원
            const sectorDiv = document.createElement('div');
            sectorDiv.className = 'content-sector';
            sectorDiv.id = sector.id;

            const editorID = sector.id.replace('sector-', 'editor-');
            sectorDiv.innerHTML = `
                    <div class="sector-grid-container">
                        <div class="left-container">
                            <div class="editor-tabs">
                                <button class="editor-tab" data-tab="frontend">프론트엔드</button>
                                <button class="editor-tab" data-tab="backend">백엔드</button>
                            </div>
                            <div class="tab-content frontend-content">
                                <div class="template-bar">
                                    <button class="template-btn" data-template="button">버튼</button>
                                    <button class="template-btn" data-template="card">카드</button>
                                    <button class="template-btn" data-template="form">폼</button>
                                    <button class="template-btn" data-template="table">테이블</button>
                                    <button class="template-btn" data-template="flexbox">Flexbox</button>
                                    <button class="format-btn">코드 정렬</button>
                                </div>
                                <div class="library-bar">
                                    <label class="library-checkbox">
                                        <input type="checkbox" data-library="jquery"> jQuery
                                    </label>
                                    <label class="library-checkbox">
                                        <input type="checkbox" data-library="bootstrap"> Bootstrap
                                    </label>
                                    <label class="library-checkbox">
                                        <input type="checkbox" data-library="tailwind"> Tailwind
                                    </label>
                                    <label class="library-checkbox">
                                        <input type="checkbox" data-library="vue"> Vue.js
                                    </label>
                                </div>
                            </div>
                            <div class="tab-content backend-content">
                                <div class="language-bar">
                                    <label class="language-radio">
                                        <input type="radio" name="language-${sector.id}" value="python" checked> Python
                                    </label>
                                    <label class="language-radio">
                                        <input type="radio" name="language-${sector.id}" value="java"> Java
                                    </label>
                                    <label class="language-radio">
                                        <input type="radio" name="language-${sector.id}" value="php"> PHP
                                    </label>
                                    <label class="language-radio">
                                        <input type="radio" name="language-${sector.id}" value="typescript"> Typescript
                                    </label>
                                    <button class="run-btn">▶ 실행</button>
                                </div>
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
                                <button class="fullscreen-btn" onclick="toggleFullscreen(this)">⛶</button>
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

            // 복원된 섹터의 스플리터 초기화
            initSectorSplitter(sectorDiv);

            // 복원된 섹터에 Ace Editor 초기화 (저장된 코드 전달)
            const initialMode = (sector.editor === 'backend') ? (sector.language || 'python') : 'html';
            initAceEditor(sectorDiv, sector.memo || '', initialMode);

            // 라이브러리 선택 상태 복원
            if (sector.libraries && sector.libraries.length > 0) {
                sector.libraries.forEach(lib => {
                    const checkbox = sectorDiv.querySelector(`.library-checkbox input[data-library="${lib}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }

            // 탭 상태 복원
            if (sector.editor) {
                sectorDiv.querySelectorAll('.editor-tab').forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.dataset.tab === sector.editor) {
                        tab.classList.add('active');
                    }
                });

                sectorDiv.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                sectorDiv.querySelector(`.${sector.editor}-content`)?.classList.add('active');
            }

            // 언어 상태 복원
            if (sector.language) {
                const languageInput = sectorDiv.querySelector(`.language-radio input[value="${sector.language}"]`);
                if (languageInput) {
                    languageInput.checked = true;
                }
            }

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

    if(!liveMode){
        return;
    }

    // Ace 인스턴스 참조
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

    // 선택된 라이브러리 가져오기
    const selectedLibraries = [];
    sectorElement.querySelectorAll('.library-checkbox input:checked').forEach(checkbox => {
        selectedLibraries.push(checkbox.dataset.library);
    });

    // 라이브러리 태그 생성
    let libraryTags = '';
    selectedLibraries.forEach(lib => {
        const urls = libraryUrls[lib];
        if (urls) {
            if (urls.css) {
                urls.css.forEach(url => {
                    libraryTags += `<link rel="stylesheet" href="${url}">\n`;
                });
            }
            if (urls.js) {
                urls.js.forEach(url => {
                    libraryTags += `<script src="${url}"><\/script>\n`;
                });
            }
        }
    });

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

    // 입력된 코드를 포함하는 완전한 HTML 문서 템플릿을 만듭니다.
    // 사용자가 CSS를 입력했다고 가정하고 <style> 태그로 묶습니다.
    // HTML 코드는 <body> 안에 삽입됩니다.
    const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                ${consoleOverride}
                ${libraryTags}
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

    // iframe에 콘텐츠를 씁니다.// srcdoc 사용
    resultIframe.srcdoc = content;
}

// --- Ace Editor 초기화 및 이벤트 연결 함수 ---
function initAceEditor(sectorElement, initialCode, initialMode = 'html') {
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

    // 전달받은 모드로 설정
    updateEditorMode(editor, initialMode);
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


/**
 * 코드 포맷팅 (Prettier 사용)
 * @param {HTMLElement} btnElement - 클릭된 버튼
 */
async function formatCode(btnElement) {
    const sectorElement = btnElement.closest('.content-sector');
    if (!sectorElement || !sectorElement.aceEditorInstance) return;

    const editor = sectorElement.aceEditorInstance;
    const code = editor.getValue();

    if (!code.trim()) return;

    // 버튼 비활성화 (중복 클릭 방지)
    btnElement.disabled = true;
    btnElement.textContent = '정리 중...';

    try {
        const formatted = await prettier.format(code, {
            parser: 'html',
            plugins: prettierPlugins,
            tabWidth: 4,
            printWidth: 80,
            htmlWhitespaceSensitivity: 'ignore'
        });

        editor.setValue(formatted, -1);
        saveStateToUrl();
        renderCode(sectorElement);

    } catch (e) {
        console.error('포맷팅 실패:', e);
        alert('코드 포맷팅에 실패했습니다. 문법 오류가 있는지 확인해주세요.');
    } finally {
        btnElement.disabled = false;
        btnElement.textContent = '코드 정렬';
    }
}

/**
 * 미리보기 전체화면 토글
 * @param {HTMLElement} btnElement - 클릭된 버튼
 */
function toggleFullscreen(btnElement) {
    const resultArea = btnElement.closest('.result-area');

    if (resultArea.classList.contains('fullscreen')) {
        // 전체화면 해제
        resultArea.classList.remove('fullscreen');
        btnElement.textContent = '⛶';
        document.body.style.overflow = '';
    } else {
        // 전체화면 진입
        resultArea.classList.add('fullscreen');
        btnElement.textContent = '✕';
        document.body.style.overflow = 'hidden';
    }
}

// 모달 열기
function openModal() {
    document.getElementById('introlistModal').classList.add('show');
}

// 모달 닫기
function closeModal() {
    document.getElementById('introlistModal').classList.remove('show');
}

function updateEditorMode(editor, language) {
    const modeMap = {
        python: 'ace/mode/python',
        java: 'ace/mode/java',
        php: 'ace/mode/php',
        typescript: 'ace/mode/typescript',
        html: 'ace/mode/html'
    };

    if (language == 'html') {
        liveMode = true;
    } else {
        liveMode = false;
    }
    editor.session.setMode(modeMap[language] || 'ace/mode/text');
}

/**
 * Piston API로 코드 실행
 * @param {string} language - 언어 (python, java, php)
 * @param {string} code - 실행할 코드
 * @returns {Promise<object>} - 실행 결과
 */
async function executeCode(language, code) {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            language: language,
            version: '*',
            files: [{ content: code }]
        })
    });

    return await response.json();
}

/**
 * 콘솔 로그 추가 헬퍼 함수
 */
function appendConsoleLog(consoleOutput, message, type) {
    const logDiv = document.createElement('div');
    logDiv.className = `console-log ${type}`;
    logDiv.textContent = message;
    consoleOutput.appendChild(logDiv);
}