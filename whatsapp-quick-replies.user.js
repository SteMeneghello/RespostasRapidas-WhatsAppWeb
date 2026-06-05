// ==UserScript==
// @name         WhatsApp Web - Galeria de Respostas Rápidas
// @namespace    http://tampermonkey.net/
// @version      2.1.0
// @description  Módulo de armazenamento offline e injeção automática de mídias/textos no WhatsApp Web.
// @author       Stefany
// @match        https://web.whatsapp.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 1. CONFIGURAÇÕES E ESTILOS (CSS/HTML)

    const UI_CONFIG = {
        css: `
            #wg-dock { position: fixed; top: 70px; right: 0; z-index: 9999; background: #333; padding: 10px 5px; border-radius: 8px 0 0 8px; display: flex; flex-direction: column; gap: 10px; }
            .dock-btn { background: #25D366; color: #fff; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-size: 18px; width: 40px; height: 40px; box-shadow: 0 4px 6px rgba(0,0,0,.3); transition: .2s; }
            .dock-btn:hover { filter: brightness(.8); }
            #wg-gallery-modal { color-scheme: light; position: fixed; top: 70px; right: 60px; z-index: 9999; background: #fff; border-radius: 8px; padding: 20px; width: 310px; box-shadow: -5px 0 15px rgba(0,0,0,.2); display: none; font-family: Arial, sans-serif; border: 1px solid #ddd; }
            #wg-gallery-modal h3 { margin-top: 0; margin-bottom: 15px; font-size: 16px; color: #333; }
            .wg-group { margin-bottom: 10px; }
            .wg-group label { display: block; font-size: 12px; margin-bottom: 4px; color: #555; font-weight: 700; }
            .wg-group input, .wg-group select, .wg-group textarea { width: 100%; padding: 8px; border: 1px solid #ccc !important; border-radius: 4px; box-sizing: border-box; color: #000 !important; background-color: #fff !important; outline: 0 !important; }
            .close-btn { position: absolute; top: 10px; right: 10px; cursor: pointer; font-weight: 700; color: #999; }
            .preview-img { width: 62px; height: 62px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; background: #f0f0f0; }
            .wg-btn { width: 100%; color: white; border: none; padding: 10px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 13px; margin-top: 10px; transition: 0.2s; }
            .wg-btn:disabled { background: #999 !important; cursor: not-allowed; }
            .btn-green { background: #25D366; } .btn-green:hover { background: #1ebe57; }
            .btn-gray { background: #555; } .btn-gray:hover { background: #444; }
            .btn-blue { background: #185B9D; } .btn-blue:hover { background: #113f6d; }
            .item-card { display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; border: 1px solid #e0e0e0; padding: 10px; margin-bottom: 8px; border-radius: 6px; }
            .item-info { display: flex; flex-direction: column; gap: 3px; }
            .item-nome { font-size: 13px; font-weight: 700; color: #2c3e50; }
            .item-id { font-size: 10px; color: #888; font-family: monospace; background: #eee; padding: 2px 5px; border-radius: 3px; width: fit-content; }
            .item-acoes button { background: none; border: none; cursor: pointer; font-size: 16px; transition: 0.2s; }
            .item-acoes button:hover { transform: scale(1.1); }
        `,
        html: `
            <div id="wg-dock">
                <button class="dock-btn" id="wg-btn-gallery-toggle" title="Respostas Rápidas">📸</button>
            </div>
            <div id="wg-gallery-modal">
                <span id="wg-close-gallery" class="close-btn">X</span>

                <!-- TELA: ENVIAR PARA O CHAT -->
                <div id="wg-tela-enviar">
                    <h3>Respostas Rápidas 📸</h3>
                    <div class="wg-group">
                        <label>Escolha o Item:</label>
                        <select id="wg-select-item"><option value="">Selecione...</option></select>
                    </div>
                    <div id="wg-conteudo-item" style="display: none;">
                        <div class="wg-group" style="display:flex; gap:6px; justify-content:space-between; margin-bottom: 5px;">
                            <img id="wg-prev-1" class="preview-img"><img id="wg-prev-2" class="preview-img">
                            <img id="wg-prev-3" class="preview-img"><img id="wg-prev-4" class="preview-img">
                        </div>
                        <button id="wg-btn-injetar" class="wg-btn btn-green">Jogar no Chat</button>
                        <div id="wg-msg-injetar" style="font-size: 11px; color: #666; text-align: center; margin-top: 5px; min-height: 15px;"></div>
                    </div>
                    <button id="wg-btn-ir-gerenciar" class="wg-btn btn-gray" style="padding: 6px; font-size: 11px; margin-top: 15px;">⚙️ Gerenciar Respostas</button>
                </div>

                <!-- TELA: GERENCIAR ITENS -->
                <div id="wg-tela-gerenciar" style="display:none; max-height: 430px; overflow-y: auto; padding-right: 5px;">
                    <h3 id="wg-titulo-gerenciar">Cadastrar Resposta 📝</h3>
                    <div class="wg-group"><label>ID (sem espaços/acentos):</label><input type="text" id="wg-add-chave" placeholder="Ex: promo_01"></div>
                    <div class="wg-group"><label>Título Interno:</label><input type="text" id="wg-add-nome" placeholder="Ex: Promoção de Inverno"></div>
                    <div class="wg-group"><label>Texto da Mensagem:</label><textarea id="wg-add-texto" style="height:80px; resize:none; font-family:sans-serif;"></textarea></div>
                    <div class="wg-group">
                        <label>Fotos (Até 4 imagens):</label>
                        <input type="file" id="wg-add-fotos" multiple accept="image/*" style="font-size:11px;">
                        <span id="wg-aviso-foto" style="display:none; font-size:10px; color:#185B9D;">Mantenha ou Altere as fotos atuais.</span>
                    </div>
                    <div style="display:flex; gap:5px; margin-bottom:15px;">
                        <button id="wg-btn-salvar" class="wg-btn btn-green" style="margin-top:0;">Salvar 💾</button>
                        <button id="wg-btn-cancelar" style="display:none; width:35px; background:#ccc; border:none; border-radius:4px; cursor:pointer;">❌</button>
                    </div>
                    <label style="display:block; font-size:12px; font-weight:bold; color:#555; margin-bottom:8px; border-top: 1px solid #eee; padding-top: 10px;">Itens Cadastrados:</label>
                    <div id="wg-lista-itens"></div>
                    <button id="wg-btn-ir-enviar" class="wg-btn btn-blue" style="padding: 8px; font-size: 12px; margin-top: 15px;">⬅️ Voltar</button>
                </div>
            </div>
        `
    };

    // 2. GERENCIADOR DE BANCO DE DADOS (IndexedDB)

    const DBManager = {
        db: null,
        data: {},

        async init() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open("WhatsAppGalleryDB", 1);
                request.onupgradeneeded = e => {
                    if (!e.target.result.objectStoreNames.contains("items")) {
                        e.target.result.createObjectStore("items", { keyPath: "id" });
                    }
                };
                request.onsuccess = e => { this.db = e.target.result; resolve(); };
                request.onerror = e => reject(e);
            });
        },

        async loadData() {
            return new Promise((resolve, reject) => {
                const request = this.db.transaction(["items"], "readonly").objectStore("items").getAll();
                request.onsuccess = () => {
                    this.data = {};
                    request.result.forEach(item => this.data[item.id] = item);
                    resolve(this.data);
                };
                request.onerror = () => reject();
            });
        },

        async save(id, nome, texto, fotos) {
            return new Promise((resolve, reject) => {
                const request = this.db.transaction(["items"], "readwrite").objectStore("items").put({ id, nome, texto, fotos });
                request.onsuccess = () => resolve();
                request.onerror = () => reject();
            });
        },

        async delete(id) {
            return new Promise((resolve, reject) => {
                const request = this.db.transaction(["items"], "readwrite").objectStore("items").delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject();
            });
        }
    };

    // 3. INJETOR DO WHATSAPP WEB

    const WhatsAppInjector = {
        async fetchAsFile(dataUrl, filename = "imagem.jpg") {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            return new File([blob], filename, { type: blob.type });
        },

        async inject(item, btnRef, msgRef) {
            const chatInput = document.querySelector('div[contenteditable="true"][data-tab="10"]') || document.querySelector('div[contenteditable="true"]');

            if (!chatInput) {
                msgRef.style.color = "red";
                msgRef.innerText = "Abra uma conversa primeiro!";
                return;
            }

            btnRef.disabled = true;
            btnRef.innerText = "Jogando no Chat... ⏳";

            try {
                // 1. Copia o texto para a área de transferência
                await navigator.clipboard.writeText(item.texto);

                // 2. Prepara as imagens simulando um Drop/Paste de arquivos
                const dataTransfer = new DataTransfer();
                for (let url of item.fotos) {
                    if (url) {
                        const file = await this.fetchAsFile(url);
                        dataTransfer.items.add(file);
                    }
                }

                // 3. Foca e dispara o evento de colar as imagens no input inicial
                chatInput.focus();
                chatInput.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dataTransfer, bubbles: true, cancelable: true }));

                // 4. Aguarda a janela de legenda (Caption Box) do WhatsApp abrir para colar o texto formatado
                let attempts = 0;
                const checkInterval = setInterval(() => {
                    attempts++;
                    const editables = document.querySelectorAll('div[contenteditable="true"]');
                    const captionBox = Array.from(editables).reverse().find(el => el !== chatInput && el.offsetHeight > 0);

                    if (captionBox) {
                        clearInterval(checkInterval);
                        captionBox.focus();

                        const textTransfer = new DataTransfer();
                        textTransfer.setData('text/plain', item.texto);
                        textTransfer.setData('text/html', item.texto.replace(/\n/g, '<br>'));

                        captionBox.dispatchEvent(new ClipboardEvent('paste', { clipboardData: textTransfer, bubbles: true, cancelable: true }));

                        msgRef.style.color = "green";
                        msgRef.innerText = "Pronto para envio!";
                        setTimeout(() => {
                            document.getElementById('wg-gallery-modal').style.display = 'none';
                            msgRef.innerText = "";
                        }, 2500);
                    }

                    if (attempts > 40) { // Fallback após ~8 segundos
                        clearInterval(checkInterval);
                        msgRef.style.color = "#888";
                        msgRef.innerText = "Use Ctrl+V na legenda.";
                    }
                }, 200);

            } catch (e) {
                console.error("Erro na injeção:", e);
                msgRef.style.color = "red";
                msgRef.innerText = "Erro ao injetar.";
            } finally {
                btnRef.disabled = false;
                btnRef.innerText = "Jogar no Chat";
            }
        }
    };

    // 4. GERENCIADOR DE INTERFACE E EVENTOS

    const UIManager = {
        getEl: (id) => document.getElementById(id),

        async renderUI() {
            // Injeta CSS
            const style = document.createElement('style');
            style.innerHTML = UI_CONFIG.css;
            document.head.appendChild(style);

            // Injeta HTML
            document.body.insertAdjacentHTML('beforeend', UI_CONFIG.html);

            this.bindEvents();
            await this.refreshLists();
        },

        async refreshLists() {
            await DBManager.loadData();

            const select = this.getEl('wg-select-item');
            const lista = this.getEl('wg-lista-itens');
            const currentVal = select.value;

            // Atualiza Select
            select.innerHTML = '<option value="">Selecione...</option>';
            Object.values(DBManager.data).forEach(m => {
                select.innerHTML += `<option value="${m.id}">${m.nome}</option>`;
            });
            select.value = DBManager.data[currentVal] ? currentVal : "";
            this.handleSelectChange();

            // Atualiza Lista de Gerenciamento
            lista.innerHTML = Object.values(DBManager.data).map(m => `
                <div class="item-card">
                    <div class="item-info"><span class="item-nome">${m.nome}</span><span class="item-id">ID: ${m.id}</span></div>
                    <div class="item-acoes">
                        <button class="wg-btn-editar" data-id="${m.id}" title="Editar Item">✏️</button>
                        <button class="wg-btn-deletar" data-id="${m.id}" title="Excluir Item">❌</button>
                    </div>
                </div>
            `).join('');
        },

        handleSelectChange() {
            const id = this.getEl('wg-select-item').value;
            const item = DBManager.data[id];
            const divConteudo = this.getEl('wg-conteudo-item');

            if (item) {
                [1, 2, 3, 4].forEach(i => {
                    const img = this.getEl('wg-prev-' + i);
                    img.src = item.fotos[i - 1] || "";
                    img.style.display = item.fotos[i - 1] ? "block" : "none";
                });
                divConteudo.style.display = "block";
                this.getEl('wg-msg-injetar').innerText = "";
            } else {
                divConteudo.style.display = "none";
            }
        },

        fileToDataURL(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = e => reject(e);
                reader.readAsDataURL(file);
            });
        },

        resetForm() {
            const inputChave = this.getEl('wg-add-chave');
            inputChave.value = ""; inputChave.readOnly = false; inputChave.style.backgroundColor = "#ffffff";
            this.getEl('wg-add-nome').value = "";
            this.getEl('wg-add-texto').value = "";
            this.getEl('wg-add-fotos').value = "";

            const btnSalvar = this.getEl('wg-btn-salvar');
            btnSalvar.innerText = "Salvar 💾";
            btnSalvar.className = "wg-btn btn-green";

            this.getEl('wg-titulo-gerenciar').innerText = "Cadastrar Resposta 📝";
            this.getEl('wg-btn-cancelar').style.display = "none";
            this.getEl('wg-aviso-foto').style.display = "none";
        },

        bindEvents() {
            const modal = this.getEl('wg-gallery-modal');
            const telaEnviar = this.getEl('wg-tela-enviar');
            const telaGerenciar = this.getEl('wg-tela-gerenciar');

            // Toggle Modal
            this.getEl('wg-btn-gallery-toggle').onclick = () => modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
            this.getEl('wg-close-gallery').onclick = () => modal.style.display = 'none';

            // Navegação entre telas
            this.getEl('wg-btn-ir-gerenciar').onclick = () => { telaEnviar.style.display = "none"; telaGerenciar.style.display = "block"; this.resetForm(); };
            this.getEl('wg-btn-ir-enviar').onclick = () => { telaGerenciar.style.display = "none"; telaEnviar.style.display = "block"; };

            // Eventos do Select e Injeção
            this.getEl('wg-select-item').onchange = () => this.handleSelectChange();
            this.getEl('wg-btn-injetar').onclick = () => WhatsAppInjector.inject(DBManager.data[this.getEl('wg-select-item').value], this.getEl('wg-btn-injetar'), this.getEl('wg-msg-injetar'));

            // Evitar bloqueio de digitação no WhatsApp Web
            ['keydown', 'keyup', 'keypress', 'paste'].forEach(evt => modal.addEventListener(evt, e => e.stopPropagation()));

            // Formulário de Cadastro/Edição
            this.getEl('wg-btn-cancelar').onclick = () => this.resetForm();

            this.getEl('wg-btn-salvar').onclick = async () => {
                const inputChave = this.getEl('wg-add-chave');
                const btnSalvar = this.getEl('wg-btn-salvar');
                const chave = inputChave.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                const nome = this.getEl('wg-add-nome').value.trim();
                const texto = this.getEl('wg-add-texto').value.trim();
                const inputFotos = this.getEl('wg-add-fotos');

                if (!chave || !nome || !texto) return alert("Preencha todos os campos obrigatórios!");

                btnSalvar.disabled = true;
                const originalText = btnSalvar.innerText;
                btnSalvar.innerText = "Salvando...";

                let fotosArray = [];
                if (inputFotos.files && inputFotos.files.length > 0) {
                    for (let i = 0; i < Math.min(inputFotos.files.length, 4); i++) {
                        fotosArray.push(await this.fileToDataURL(inputFotos.files[i]));
                    }
                } else if (DBManager.data[chave]) {
                    fotosArray = DBManager.data[chave].fotos;
                }

                try {
                    await DBManager.save(chave, nome, texto, fotosArray);
                    await this.refreshLists();
                    this.resetForm();
                    telaGerenciar.style.display = "none";
                    telaEnviar.style.display = "block";
                } catch (e) {
                    alert("Erro ao salvar no banco local.");
                } finally {
                    btnSalvar.disabled = false;
                    btnSalvar.innerText = originalText;
                }
            };

            // Evento dos botões Editar/Deletar
            this.getEl('wg-lista-itens').onclick = async (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;

                const id = btn.getAttribute('data-id');
                if (btn.classList.contains('wg-btn-deletar')) {
                    if (confirm(`Excluir item "${id}" definitivamente?`)) {
                        await DBManager.delete(id);
                        await this.refreshLists();
                        if (this.getEl('wg-add-chave').value === id) this.resetForm();
                    }
                } else if (btn.classList.contains('wg-btn-editar')) {
                    const item = DBManager.data[id];
                    this.getEl('wg-titulo-gerenciar').innerText = "Editar Resposta ✏️";

                    const inputChave = this.getEl('wg-add-chave');
                    inputChave.value = id;
                    inputChave.readOnly = true;
                    inputChave.style.backgroundColor = "#e0e0e0";

                    this.getEl('wg-add-nome').value = item.nome;
                    this.getEl('wg-add-texto').value = item.texto;
                    this.getEl('wg-add-fotos').value = "";

                    this.getEl('wg-aviso-foto').style.display = "block";
                    this.getEl('wg-btn-cancelar').style.display = "block";

                    const btnSalvar = this.getEl('wg-btn-salvar');
                    btnSalvar.innerText = "Atualizar 💾";
                    btnSalvar.className = "wg-btn btn-blue";
                }
            };
        }
    };
  
    // 5. INICIALIZAÇÃO DO APP

    async function startApp() {
        try {
            await DBManager.init();
            await UIManager.renderUI();
            console.log("Módulo carregado com sucesso.");
        } catch (e) {
            console.error("Falha ao inicializar, banco de dados offline.", e);
        }
    }

    startApp();

})();
