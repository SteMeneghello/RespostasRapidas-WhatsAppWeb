# WhatsApp Web - Galeria de Respostas Rápidas (Quick Replies)

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-00485B?style=for-the-badge&logo=tampermonkey&logoColor=white)
![IndexedDB](https://img.shields.io/badge/IndexedDB-Database-blue?style=for-the-badge)
![Offline First](https://img.shields.io/badge/Offline_First-100%25-brightgreen?style=for-the-badge)

Um módulo otimizado para **Tampermonkey** que injeta uma galeria de respostas rápidas (texto + imagens) diretamente na interface do WhatsApp Web, construído focado em produtividade para times de vendas, atendimento e suporte.

> **O Problema:** O WhatsApp Web não permite salvar templates complexos contendo textos longos e múltiplas imagens de forma nativa.
> 
> **A Solução:** Um script *Offline-First* que funciona como um banco de dados, capaz de injetar mídias e textos simulando a ação nativa de "Copiar e Colar" do sistema operacional, burlando as limitações de inputs de Single Page Applications (SPAs).

---

## Demonstração

<img width="1918" height="866" alt="Gravando2026-06-05232213-ezgif com-optimize" src="https://github.com/user-attachments/assets/cd3c3274-eb27-469c-928d-caa4bb255f25"/>

---

## Destaques e Arquitetura

O projeto foi desenvolvido utilizando JavaScript, sem dependências externas, priorizando performance e manutenção:

* **Armazenamento Offline (IndexedDB):** Utiliza a API nativa do navegador para salvar as imagens em base64 e os textos, garantindo acesso instantâneo sem necessidade de servidores ou APIs de terceiros.
* **Injeção de Mídia via Clipboard API:** Lida com a limitação do WhatsApp Web (React) ao instanciar objetos `DataTransfer` e disparar eventos sintéticos de `paste` (`ClipboardEvent`). Isso força o React a reconhecer a inserção do texto e das imagens perfeitamente.
* **Código Modular:** Estruturado em *Design Patterns* focados (DBManager, UIManager e WhatsAppInjector), facilitando a leitura, manutenção e escalabilidade do código.
* **SPA Proof:** Eventos dinâmicos, `setInterval` e delegação de eventos, garantem que o menu sobreviva às mudanças de estado e re-renderizações do DOM feitas pelo WhatsApp.

---

## Como Instalar e Usar

1. Instale a extensão **Tampermonkey** no seu navegador.
2. Clique no ícone do Tampermonkey e vá em **"Criar novo script..."**.
3. Copie todo o código do arquivo `whatsapp-quick-replies.user.js` deste repositório e cole no editor.
4. Salve o arquivo.
5. Acesse o [WhatsApp Web](https://web.whatsapp.com/).
6. Um novo botão verde `📸` aparecerá no canto superior direito da tela. Clique para gerenciar e injetar suas respostas!

---

## Estrutura do Código

Lógica principal:

*   `UI_CONFIG`: Centraliza o CSS e o HTML injetados no DOM.
*   `DBManager`: Gerencia o CRUD no IndexedDB de forma assíncrona (Promises).
*   `WhatsAppInjector`: Converte Base64 para arquivos (`File`/`Blob`) e orquestra a injeção na caixa de texto do WhatsApp.
*   `UIManager`: Controla a renderização do menu, os listeners de eventos e previne que a digitação nos inputs da ferramenta vaze para atalhos do WhatsApp.

---

Toda contribuição para melhorar a interface ou a performance do injetor é muito bem-vinda! 🫶
