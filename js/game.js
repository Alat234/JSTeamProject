document.addEventListener('DOMContentLoaded', function() {

    let clickCount = 0;
    let currentStage = 1;
    const deathStage = 6; 
    const hungerDeathStage = 7; 
    const clicksPerStage = 5;
    const totalClicks = clicksPerStage * (deathStage - 1); 
    
    let satiety = 100; 
    const maxSatiety = 100;
    const satietyDecayRate = 10; 
    let satietyDecayTimer = null;
    
    let activeItems = []; 
    let itemTimerId = null;
    const itemDuration = 1000; 
    const itemInterval = 1000; 
    
    let isGameOver = false;
    
    const characterImage = document.getElementById('character-image');
    const resetButton = document.getElementById('reset-button');
    const clickCountElement = document.getElementById('click-count');
    const progressBar = document.getElementById('progress-bar');
    const satietyBar = document.getElementById('satiety-bar');
    const gameContainer = document.getElementById('game-container');
    
    initGame();
    
    function initGame() {
        clickCount = 0;
        currentStage = 1;
        satiety = maxSatiety;
        isGameOver = false; 
        characterImage.src = 'game/stage1.png';
        updateUI();
        
        resetButton.addEventListener('click', resetGame);
        
        scheduleNextItem();
        startSatietyDecay();
    }
    
    function handleProteinClick(event) {
        if (isGameOver) return;
        incrementScore(1);
        removeItem(event.target);
        restoreSatiety(20);
        showMessage('Чудово! Протеїн допоможе наростити м\'язи!');
    }
    
    function handleBurgerClick(event) {
        if (isGameOver) return;
        incrementScore(-1);
        removeItem(event.target);
        restoreSatiety(20);
        showMessage('Ой-ой! Бургер не допомагає накачатись!');
    }
    
    function incrementScore(amount) {
        if (isGameOver) return;
        
        clickCount = Math.max(0, clickCount + amount);
        
        characterImage.classList.add('pulse-animation');
        setTimeout(() => {
            characterImage.classList.remove('pulse-animation');
        }, 500);
        
        const newStage = Math.min(Math.floor(clickCount / clicksPerStage) + 1, deathStage);
        
        if (newStage !== currentStage) {
            currentStage = newStage;
            characterImage.src = `game/stage${currentStage}.png`;
            
            if (currentStage === deathStage) {
                endGame('overexertion');
            } else {
                let message = '';
                switch(currentStage) {
                    case 2: message = 'Початок змін! Продовжуй!'; break;
                    case 3: message = 'Вже видно прогрес! Ще трохи!'; break;
                    case 4: message = 'Вражаючі м\'язи! Не зупиняйся!'; break;
                    case 5: message = 'Ти майже на піку форми!'; break;
                }
                if (message) showMessage(message);
            }
        }
        
        updateUI();
    }
    
    function restoreSatiety(amount) {
        if (isGameOver) return;
        satiety = Math.min(maxSatiety, satiety + amount);
        updateSatietyBar();
    }

    function decreaseSatiety(amount) {
        if (isGameOver) return;
        satiety = Math.max(0, satiety - amount);
        updateSatietyBar();
        
        if (satiety <= 0) {
            endGame('hunger');
        }
    }

    function updateSatietyBar() {
        const satietyPercentage = (satiety / maxSatiety) * 100;
        satietyBar.style.width = `${satietyPercentage}%`;
        satietyBar.setAttribute('aria-valuenow', satietyPercentage);
        
        satietyBar.classList.remove('bg-info', 'bg-warning', 'bg-danger');
        if (satietyPercentage <= 20) {
            satietyBar.classList.add('bg-danger');
        } else if (satietyPercentage <= 50) {
            satietyBar.classList.add('bg-warning');
        } else {
            satietyBar.classList.add('bg-info');
        }
    }

    function startSatietyDecay() {
        satietyDecayTimer = setInterval(() => {
            if (!isGameOver && activeItems.length > 0) {
                decreaseSatiety(satietyDecayRate);
            }
        }, 2000);
    }

    function endGame(reason) {
        isGameOver = true;
        clearInterval(satietyDecayTimer);
        clearTimeout(itemTimerId);
        removeAllItems();
        satiety = 0;
        
        if (reason === 'hunger') {
            currentStage = hungerDeathStage;
            characterImage.src = 'game/stage7.png';
            showMessage('Твій персонаж помер від голоду! Натисни "Почати спочатку", щоб спробувати ще раз.');
        } else if (reason === 'overexertion') {
            currentStage = deathStage;
            characterImage.src = 'game/stage6.png';
            showMessage('Твій персонаж помер від перекачування! Натисни "Почати спочатку", щоб спробувати ще раз.');
        }
        
        updateUI();
    }
    
    function resetGame() {
        clickCount = 0;
        currentStage = 1;
        satiety = maxSatiety;
        isGameOver = false;
        characterImage.src = 'game/stage1.png';
        
        clearTimeout(itemTimerId);
        clearInterval(satietyDecayTimer);
        
        removeAllItems();
        updateUI();
        showMessage('Почнемо спочатку! Тренуйся розумно!');
        
        scheduleNextItem();
        startSatietyDecay();
    }
    
    function updateUI() {
        clickCountElement.textContent = clickCount;    
        const progress = Math.min((clickCount / totalClicks) * 100, 100);
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
        
        let progressColor = 'bg-success';
        if (currentStage >= 5) progressColor = 'bg-danger';
        else if (currentStage >= 3) progressColor = 'bg-warning';
        
        progressBar.classList.remove('bg-success', 'bg-warning', 'bg-danger');
        progressBar.classList.add(progressColor);
        updateSatietyBar();
    }
    
    function showMessage(text) {
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-primary border-0';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${text}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 3000 });
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', function() { toast.remove(); });
    }
    
    function scheduleNextItem() {
        if (isGameOver) return;
        if (itemTimerId) clearTimeout(itemTimerId);
        itemTimerId = setTimeout(spawnRandomItems, itemInterval);
    }
    
    function spawnRandomItems() {
        if (isGameOver) return;
        removeAllItems();
        
        for (let i = 0; i < 2; i++) {
            const itemElement = document.createElement('img');
            const isProtein = Math.random() > 0.5;
            
            if (isProtein) {
                itemElement.src = 'game/protein.png';
                itemElement.className = 'game-item protein';
                itemElement.dataset.tooltip = 'Протеїн: +1 до м\'язів';
                itemElement.addEventListener('click', handleProteinClick);
            } else {
                itemElement.src = 'game/burger.png';
                itemElement.className = 'game-item burger';
                itemElement.dataset.tooltip = 'Бургер: -1 до м\'язів';
                itemElement.addEventListener('click', handleBurgerClick);
            }
            
            itemElement.style.width = '60px';
            itemElement.style.height = 'auto';
            
            const containerRect = gameContainer.getBoundingClientRect();
            const containerWidth = containerRect.width;
            const containerHeight = containerRect.height;
            const playableHeight = containerRect.height * 0.7;
            
            const margin = 20;
            const itemWidth = 60;
            const itemHeight = 60;
            
            let left, top, attempts = 0;
            do {
                left = margin + Math.random() * (containerWidth - 2 * margin - itemWidth);
                top = margin + Math.random() * (playableHeight - 2 * margin - itemHeight);
                attempts++;
            } while (attempts < 10 && isPositionOccupied(left, top, itemWidth, itemHeight));

            itemElement.style.position = 'absolute';
            itemElement.style.left = `${left}px`;
            itemElement.style.top = `${top}px`;
            itemElement.style.cursor = 'pointer';
            itemElement.style.zIndex = '100';
            
            itemElement.style.transition = 'transform 0.2s ease-in-out';
            itemElement.addEventListener('mouseover', function() { this.style.transform = 'scale(1.1)'; });
            itemElement.addEventListener('mouseout', function() { this.style.transform = 'scale(1)'; });
            
            gameContainer.appendChild(itemElement);
            activeItems.push(itemElement);
        }
        
        setTimeout(function() {
            removeAllItems();
            scheduleNextItem();
        }, itemDuration);
    }
    
    function isPositionOccupied(x, y, width, height) {
        for (let item of activeItems) {
            const itemLeft = parseInt(item.style.left);
            const itemTop = parseInt(item.style.top);
            if (x < itemLeft + 60 && x + width > itemLeft && y < itemTop + 60 && y + height > itemTop) {
                return true;
            }
        }
        return false;
    }
    
    function removeItem(clickedItem) {
        if (clickedItem && clickedItem.parentNode) {
            clickedItem.parentNode.removeChild(clickedItem);
            const index = activeItems.indexOf(clickedItem);
            if (index > -1) activeItems.splice(index, 1);
        }
    }
    
    function removeAllItems() {
        activeItems.forEach(item => {
            if (item && item.parentNode) item.parentNode.removeChild(item);
        });
        activeItems = [];
    }
});