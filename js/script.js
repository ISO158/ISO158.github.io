/**
 * script.js — Lógica do portfólio
 * - Efeito de digitação (typewriter)
 * - Revelação ao rolar (scroll reveal)
 * - Filtro de projetos
 * - Integração com API do GitHub (repositórios)
 *
 * Caminho: js/script.js
 */

document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // 1. EFEITO DE DIGITAÇÃO (Typewriter)
    // ============================================================
    const titles = [
        "Data Scientist & Analyst",
        "AI & Deep Learning Researcher",
        "Data Enthusiast"
    ];
    let count = 0;
    let index = 0;
    let currentText = '';
    let letter = '';
    let isDeleting = false;

    const typeWriterElement = document.getElementById("typewriter");
    if (!typeWriterElement) return; // segurança: sai se elemento não existir

    function type() {
        if (count === titles.length) {
            count = 0;
        }
        currentText = titles[count];

        if (isDeleting) {
            letter = currentText.slice(0, --index);
        } else {
            letter = currentText.slice(0, ++index);
        }

        typeWriterElement.textContent = letter;

        let typeSpeed = 100;
        if (isDeleting) typeSpeed /= 2;

        if (!isDeleting && letter.length === currentText.length) {
            // Pausa ao final da palavra
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && letter.length === 0) {
            isDeleting = false;
            count++;
            // Pausa antes da próxima palavra
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    type();

    // ============================================================
    // 2. ANIMAÇÃO DE SCROLL (Reveal)
    // ============================================================
    const reveals = document.querySelectorAll(".reveal");

    function revealOnScroll() {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;

        for (let i = 0; i < reveals.length; i++) {
            const elementTop = reveals[i].getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add("active");
            }
        }
    }

    window.addEventListener("scroll", revealOnScroll, { passive: true });
    revealOnScroll(); // dispara no carregamento inicial

    // ============================================================
    // 3. SISTEMA DE FILTROS DE PROJETOS
    // ============================================================
    const filterBtns = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove a classe 'active' de todos os botões
            filterBtns.forEach(b => b.classList.remove("active"));

            // Adiciona 'active' ao botão clicado
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");

            projectCards.forEach(card => {
                if (filterValue === "all" || card.getAttribute("data-category") === filterValue) {
                    card.classList.remove("hidden-project");
                } else {
                    card.classList.add("hidden-project");
                }
            });
        });
    });

    // ============================================================
    // 4. INTEGRAÇÃO COM API DO GITHUB
    // ============================================================
    const githubUsername = 'ISO158';
    const projectsGrid = document.getElementById('projects-grid');

    async function fetchGitHubRepos() {
        // Tenta buscar até 6 repositórios públicos, ordenados por atualização
        try {
            const response = await fetch(
                `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6`
            );
            if (!response.ok) {
                console.warn('GitHub API retornou status', response.status);
                return;
            }
            const repos = await response.json();

            repos.forEach(repo => {
                // Ignora o próprio repositório do portfólio para evitar duplicação
                if (repo.name.toLowerCase() === `${githubUsername.toLowerCase()}.github.io`) return;

                // Tenta inferir categoria pela linguagem/tópicos
                let category = 'data'; // padrão
                const lang = (repo.language || '').toLowerCase();
                if (lang === 'c++' || lang === 'c' || lang === 'arduino') {
                    category = 'iot';
                }

                // Cria o card com as classes do design refinado
                const repoCard = document.createElement('div');
                repoCard.className = 'project-card';
                repoCard.setAttribute('data-category', category);

                repoCard.innerHTML = `
                    <div class="project-card-header">
                        <i class="fa-regular fa-folder text-2xl text-txtMuted"></i>
                        <div class="flex gap-2">
                            <a href="${repo.html_url}" target="_blank"
                               class="text-txtMuted hover:text-accent transition-colors"
                               aria-label="Ver no GitHub">
                                <i class="fa-brands fa-github"></i>
                            </a>
                            ${repo.homepage ? `
                            <a href="${repo.homepage}" target="_blank"
                               class="text-txtMuted hover:text-accent transition-colors"
                               aria-label="Ver demo">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </a>` : ''}
                        </div>
                    </div>
                    <h4 class="project-card-title">${escapeHTML(repo.name)}</h4>
                    <p class="project-card-desc">
                        ${escapeHTML(repo.description || 'Repositório focado em desenvolvimentos, scripts ou análises.')}
                    </p>
                    <div class="flex flex-wrap items-center gap-3 font-mono text-xs text-txtMuted mt-auto">
                        ${repo.language ? `
                        <span class="flex items-center gap-1">
                            <span class="w-2 h-2 rounded-full bg-accent inline-block"></span>
                            ${escapeHTML(repo.language)}
                        </span>` : ''}
                        <span class="flex items-center gap-1">
                            <i class="fa-regular fa-star"></i> ${repo.stargazers_count}
                        </span>
                        <span class="flex items-center gap-1">
                            <i class="fa-solid fa-code-fork"></i> ${repo.forks_count}
                        </span>
                    </div>
                `;

                projectsGrid.appendChild(repoCard);
            });

            // Se houver um filtro ativo diferente de 'all', reaplica o filtro
            const activeBtn = document.querySelector('.filter-btn.active');
            if (activeBtn && activeBtn.getAttribute('data-filter') !== 'all') {
                // Dispara o clique novamente para filtrar os cards recém-criados
                activeBtn.click();
            }

        } catch (error) {
            console.error('Erro ao buscar repositórios do GitHub:', error);
        }
    }

    /**
     * Função auxiliar para escapar HTML e evitar XSS em dados vindos da API.
     */
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // Ativa a busca automática de repositórios via API do GitHub
    fetchGitHubRepos();

    // ============================================================
    // 5. SISTEMA DE MODAIS (Projetos em Destaque)
    // ============================================================
    const modalTriggers = document.querySelectorAll('.modal-trigger[data-modal]');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    let activeModal = null;

    /**
     * Abre um modal específico pelo ID.
     * Fecha qualquer modal já aberto antes de abrir o novo.
     */
    function openModal(modalId) {
        // Fecha modal atual se existir
        if (activeModal) {
            closeModal(activeModal);
        }

        const overlay = document.getElementById(modalId);
        if (!overlay) return;

        // Bloqueia scroll da página
        document.body.classList.add('modal-open');
        // Exibe o overlay
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        // Foca o botão de fechar para acessibilidade
        const closeBtn = overlay.querySelector('.modal-close');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }

        activeModal = overlay;
    }

    /**
     * Fecha o modal atualmente aberto.
     * Pode ser chamado com um elemento overlay específico ou sem argumentos.
     */
    function closeModal(overlay) {
        const target = overlay || activeModal;
        if (!target) return;

        target.classList.remove('active');
        target.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        activeModal = null;

        // Devolve o foco ao elemento que abriu o modal
        const trigger = document.querySelector(`[data-modal="${target.id}"]`);
        if (trigger) {
            setTimeout(() => trigger.focus(), 100);
        }
    }

    // Event listeners: abrir modal ao clicar no card
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal');
            if (modalId) openModal(modalId);
        });

        // Suporte a teclado (Enter / Space)
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal');
                if (modalId) openModal(modalId);
            }
        });
    });

    // Event listeners: fechar modal
    modalOverlays.forEach(overlay => {
        // Clicar no botão X
        const closeBtn = overlay.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(overlay));
        }

        // Clicar fora do painel (no overlay)
        overlay.addEventListener('click', (e) => {
            // Só fecha se o clique foi diretamente no overlay, não no painel
            if (e.target === overlay) {
                closeModal(overlay);
            }
        });
    });

    // Fechar modal pressionando a tecla 'Esc'
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeModal) {
            closeModal(activeModal);
        }
    });
});