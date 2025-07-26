class ProposalSite {
    constructor() {
        this.currentQuestion = 1;
        this.noClickCount = 0;
        this.questionText = document.getElementById('question-text');
        this.yesBtn = document.getElementById('yes-btn');
        this.noBtn = document.getElementById('no-btn');
        this.buttonsContainer = document.querySelector('.buttons-container');
        
        this.questions = {
            1: "Let me have thy beautiful bombom",
            2: "Please...?",
            3: "System error... Accepting is mandatory 😈",
            4: "Only one choice, the ass is mine 😈",
            5: "Good will pick you up on Friday 😘"
        };
        
        this.init();
    }
    
    init() {
        this.yesBtn.addEventListener('click', () => this.handleYes());
        this.noBtn.addEventListener('click', () => this.handleNo());
        this.noBtn.addEventListener('mouseenter', () => this.handleNoHover());

        // Add touch support for mobile
        this.noBtn.addEventListener('touchstart', () => this.handleNoHover());

        // Prevent zoom on double tap for mobile
        this.yesBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleYes();
        });
    }
    
    handleYes() {
        this.showFinalMessage();
    }
    
    handleNo() {
        this.noClickCount++;
        
        switch(this.currentQuestion) {
            case 1:
                this.moveToQuestion2();
                break;
            case 2:
                this.handleQuestion2No();
                break;
            case 3:
                this.moveToQuestion4();
                break;
        }
    }
    
    handleNoHover() {
        if (this.currentQuestion === 2 && this.noClickCount < 2) {
            this.moveNoButton();
        }
    }
    
    moveToQuestion2() {
        this.currentQuestion = 2;
        this.noClickCount = 0;
        this.questionText.textContent = this.questions[2];
    }
    
    handleQuestion2No() {
        if (this.noClickCount <= 2) {
            this.moveNoButton();
        }
        
        if (this.noClickCount >= 3) {
            this.moveToQuestion3();
        }
    }
    
    moveNoButton() {
        const container = this.buttonsContainer;
        const containerRect = container.getBoundingClientRect();
        const btnRect = this.noBtn.getBoundingClientRect();

        // Make button absolutely positioned
        this.noBtn.classList.add('moving');

        // Calculate random position within container bounds with mobile-friendly margins
        const isMobile = window.innerWidth <= 600;
        const margin = isMobile ? 10 : 20;
        const maxX = containerRect.width - btnRect.width - margin;
        const maxY = containerRect.height - btnRect.height - margin;

        const randomX = Math.random() * Math.max(0, maxX - margin) + margin;
        const randomY = Math.random() * Math.max(0, maxY - margin) + margin;

        this.noBtn.style.left = randomX + 'px';
        this.noBtn.style.top = randomY + 'px';

        // Reset position after animation
        setTimeout(() => {
            if (this.noClickCount < 3) {
                this.noBtn.classList.remove('moving');
                this.noBtn.style.left = '';
                this.noBtn.style.top = '';
            }
        }, 300);
    }
    
    moveToQuestion3() {
        this.currentQuestion = 3;
        this.noClickCount = 0;
        this.questionText.textContent = this.questions[3];
        
        // Reset button position
        this.noBtn.classList.remove('moving');
        this.noBtn.style.left = '';
        this.noBtn.style.top = '';
    }
    
    moveToQuestion4() {
        this.currentQuestion = 4;
        this.questionText.textContent = this.questions[4];
        
        // Hide the No button
        this.noBtn.style.display = 'none';
        
        // Center the Yes button
        this.buttonsContainer.style.justifyContent = 'center';
    }
    
    showFinalMessage() {
        this.questionText.textContent = this.questions[5];
        this.questionText.classList.add('final-message');
        
        // Hide all buttons
        this.buttonsContainer.style.display = 'none';
        
        // Add some celebration effects
        this.addCelebrationEffects();
    }
    
    addCelebrationEffects() {
        // Create more floating hearts
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createFloatingHeart();
            }, i * 200);
        }
    }
    
    createFloatingHeart() {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.top = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 2 + 's';
        
        document.querySelector('.heart-background').appendChild(heart);
        
        // Remove heart after animation
        setTimeout(() => {
            heart.remove();
        }, 6000);
    }
}

// Initialize the proposal site when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProposalSite();
});
