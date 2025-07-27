class ProposalSite {
    constructor() {
        this.currentQuestion = 1;
        this.noClickCount = 0;
        this.questionText = document.getElementById('question-text');
        this.yesBtn = document.getElementById('yes-btn');
        this.noBtn = document.getElementById('no-btn');
        this.buttonsContainer = document.querySelector('.buttons-container');
        this.startTime = new Date();
        this.interactions = [];
        this.sessionId = this.generateSessionId();
        this.lastActivity = new Date();
        this.isCompleted = false;
        this.inactivityTimer = null;
        this.inactivityThreshold = 60000; // 1 minute of inactivity

        this.questions = {
            1: "Let me have thy beautiful bombom 🥹🥹",
            2: "Please...?",
            3: "System error... 'Back to sender' won't work. Accepting is mandatory 😈",
            4: "Only one choice, the ass is mine 😈",
            5: "Good will pick you up on Friday 😘"
        };

        this.init();
        this.setupTrackingListeners();
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
        this.updateActivity();
        this.logInteraction('YES', `Question ${this.currentQuestion}`, this.questions[this.currentQuestion]);
        this.isCompleted = true;
        this.clearInactivityTimer();
        this.sendEmailNotification('COMPLETED');
        this.showFinalMessage();
    }

    handleNo() {
        this.updateActivity();
        this.noClickCount++;
        this.logInteraction('NO', `Question ${this.currentQuestion}`, this.questions[this.currentQuestion]);

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
        this.resetInactivityTimer();
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

        // Add final text input after a short delay
        setTimeout(() => {
            this.showFinalTextInput();
        }, 2000);

        // Add some celebration effects
        this.addCelebrationEffects();
    }

    showFinalTextInput() {
        // Create final input container
        const inputContainer = document.createElement('div');
        inputContainer.className = 'final-input-container';
        inputContainer.innerHTML = `
            <h2 class="final-question">Ready to receive it hot? 🙂</h2>
            <textarea id="final-response" placeholder="Tell me what's on your mind... 💭" maxlength="500"></textarea>
            <button id="submit-final" class="btn final-submit-btn">Submit 💕</button>
        `;

        // Add to proposal card
        document.querySelector('.proposal-card').appendChild(inputContainer);

        // Add event listener for submit
        document.getElementById('submit-final').addEventListener('click', () => {
            this.handleFinalSubmission();
        });

        // Add enter key support
        document.getElementById('final-response').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.handleFinalSubmission();
            }
        });
    }

    async handleFinalSubmission() {
        const responseText = document.getElementById('final-response').value.trim();

        if (!responseText) {
            alert('Please share your thoughts! 💕');
            return;
        }

        // Log the final response
        this.logInteraction('FINAL_RESPONSE', 'Final Question', responseText);

        // Submit to Netlify
        await this.submitFinalResponse(responseText);

        // Show thank you message
        this.showThankYouMessage();
    }

    async submitFinalResponse(responseText) {
        try {
            const formData = new URLSearchParams();
            formData.append('form-name', 'final-responses');
            formData.append('email', 'ejezievictor7@gmail.com');
            formData.append('session-id', this.sessionId);
            formData.append('final-response', responseText);
            formData.append('total-interactions', this.interactions.length);
            formData.append('total-time', Math.round((new Date() - this.startTime) / 1000));
            formData.append('timestamp', new Date().toISOString());

            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });

            console.log('✅ Final response submitted successfully!');

        } catch (error) {
            console.log('❌ Final response submission failed:', error);
        }
    }

    showThankYouMessage() {
        const inputContainer = document.querySelector('.final-input-container');
        inputContainer.innerHTML = `
            <h2 class="thank-you-message">Thank you for sharing! 💕</h2>
            <p class="thank-you-text">Your response has been received. Can't wait for our date! 😘</p>
        `;

        // Add more celebration effects
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

    logInteraction(action, question, questionText) {
        const interaction = {
            timestamp: new Date().toISOString(),
            action: action,
            question: question,
            questionText: questionText,
            timeFromStart: Math.round((new Date() - this.startTime) / 1000)
        };
        this.interactions.push(interaction);
        console.log('Interaction logged:', interaction);
    }

    async sendEmailNotification(eventType = 'COMPLETED') {
        console.log(`🚀 Attempting to send ${eventType} notification...`);

        try {
            // Try primary form submission
            console.log('📝 Submitting to proposal-responses form...');
            await this.submitToNetlify(eventType);
            console.log(`✅ ${eventType} notification sent successfully via Netlify!`);

            // Also try backup simple form
            console.log('📝 Submitting to simple-contact form...');
            await this.submitSimpleForm(eventType);
            console.log('✅ Backup form submitted successfully!');

        } catch (error) {
            console.log(`❌ Netlify submission failed for ${eventType}:`, error);
            // Fallback: try to open email client
            this.openEmailClientFallback(eventType);
        }
    }

    generateEmailContent() {
        const totalTime = Math.round((new Date() - this.startTime) / 1000);
        const totalNoClicks = this.interactions.filter(i => i.action === 'NO').length;

        let content = `🎉 GREAT NEWS! Someone just said YES to your proposal! 💕\n\n`;
        content += `📊 INTERACTION SUMMARY:\n`;
        content += `⏱️ Total time: ${totalTime} seconds\n`;
        content += `❌ Total "No" clicks: ${totalNoClicks}\n`;
        content += `✅ Final answer: YES! 🎉\n\n`;
        content += `📝 DETAILED LOG:\n`;

        this.interactions.forEach((interaction, index) => {
            content += `${index + 1}. [${interaction.timeFromStart}s] ${interaction.action} on "${interaction.question}"\n`;
            content += `   Question: "${interaction.questionText}"\n`;
            content += `   Time: ${new Date(interaction.timestamp).toLocaleString()}\n\n`;
        });

        content += `🎯 The proposal was successful! Time to plan that Friday pickup! 😘`;

        return content;
    }

    async submitToNetlify(eventType = 'COMPLETED') {
        const totalTime = Math.round((new Date() - this.startTime) / 1000);
        const totalNoClicks = this.interactions.filter(i => i.action === 'NO').length;

        // Create URLSearchParams directly for proper form encoding
        const formData = new URLSearchParams();
        formData.append('form-name', 'proposal-responses');
        formData.append('email', 'ejezievictor7@gmail.com');
        formData.append('session-id', this.sessionId);
        formData.append('event-type', eventType);
        formData.append('final-answer', this.isCompleted ? 'YES' : 'ABANDONED');
        formData.append('stopped-at-question', this.currentQuestion);
        formData.append('total-time', totalTime);
        formData.append('no-clicks', totalNoClicks);
        formData.append('interaction-log', this.generateDetailedLog(eventType));
        formData.append('timestamp', new Date().toISOString());

        const response = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
    }

    generateDetailedLog(eventType = 'COMPLETED') {
        const totalTime = Math.round((new Date() - this.startTime) / 1000);
        const totalNoClicks = this.interactions.filter(i => i.action === 'NO').length;

        let log = '';

        if (eventType === 'COMPLETED') {
            log = `🎉 PROPOSAL SUCCESS! Someone said YES! 💕\n\n`;
            log += `📊 SUMMARY:\n`;
            log += `⏱️ Total time: ${totalTime} seconds\n`;
            log += `❌ Total "No" clicks: ${totalNoClicks}\n`;
            log += `✅ Final answer: YES! 🎉\n\n`;
        } else {
            const eventMessages = {
                'ABANDONED_TAB_SWITCH': '😔 Someone left by switching tabs',
                'ABANDONED_CLOSED': '😔 Someone closed the page',
                'ABANDONED_INACTIVE': '😔 Someone became inactive',
                'ABANDONED_TIMEOUT': '😔 Someone timed out'
            };

            log = `${eventMessages[eventType] || '😔 Someone abandoned the proposal'}\n\n`;
            log += `📊 ABANDONMENT SUMMARY:\n`;
            log += `⏱️ Time spent: ${totalTime} seconds\n`;
            log += `❌ Total "No" clicks: ${totalNoClicks}\n`;
            log += `🛑 Stopped at: Question ${this.currentQuestion}\n`;
            log += `📍 Last question: "${this.questions[this.currentQuestion]}"\n\n`;
        }

        log += `📝 DETAILED INTERACTIONS:\n`;
        log += `🆔 Session ID: ${this.sessionId}\n\n`;

        this.interactions.forEach((interaction, index) => {
            log += `${index + 1}. [${interaction.timeFromStart}s] ${interaction.action} on "${interaction.question}"\n`;
            log += `   Question: "${interaction.questionText}"\n`;
            log += `   Time: ${new Date(interaction.timestamp).toLocaleString()}\n\n`;
        });

        if (eventType === 'COMPLETED') {
            log += `🎯 Time to plan that Friday pickup! 😘`;
        } else {
            log += `💡 Maybe try a different approach next time? 🤔`;
        }

        return log;
    }

    async submitSimpleForm(eventType) {
        const formData = new URLSearchParams();
        formData.append('form-name', 'simple-contact');
        formData.append('email', 'ejezievictor7@gmail.com');
        formData.append('message', `${eventType}: ${this.generateDetailedLog(eventType)}`);

        const response = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });

        return response;
    }

    openEmailClientFallback() {
        const subject = encodeURIComponent('💕 Proposal Website - Someone Said YES! 🎉');
        const body = encodeURIComponent(this.generateDetailedLog());
        const mailtoLink = `mailto:ejezievictor7@gmail.com?subject=${subject}&body=${body}`;

        // Try to open email client as fallback
        window.open(mailtoLink, '_blank');
    }

    // === COMPREHENSIVE TRACKING METHODS ===

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupTrackingListeners() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && !this.isCompleted) {
                this.logInteraction('PAGE_HIDDEN', `Question ${this.currentQuestion}`, 'User switched tab/minimized');
                this.sendEmailNotification('ABANDONED_TAB_SWITCH');
            } else if (!document.hidden) {
                this.logInteraction('PAGE_VISIBLE', `Question ${this.currentQuestion}`, 'User returned to tab');
                this.updateActivity();
            }
        });

        // Track page unload (closing/refreshing)
        window.addEventListener('beforeunload', () => {
            if (!this.isCompleted) {
                this.logInteraction('PAGE_UNLOAD', `Question ${this.currentQuestion}`, 'User closed/refreshed page');
                this.sendEmailNotification('ABANDONED_CLOSED');
            }
        });

        // Track mouse movement and clicks for activity
        document.addEventListener('mousemove', () => this.updateActivity());
        document.addEventListener('click', () => this.updateActivity());
        document.addEventListener('keypress', () => this.updateActivity());
        document.addEventListener('scroll', () => this.updateActivity());
        document.addEventListener('touchstart', () => this.updateActivity());

        // Start inactivity timer
        this.resetInactivityTimer();

        // Log session start
        this.logInteraction('SESSION_START', 'Question 1', 'User arrived at proposal site');
    }

    updateActivity() {
        this.lastActivity = new Date();
    }

    resetInactivityTimer() {
        this.clearInactivityTimer();
        this.inactivityTimer = setTimeout(() => {
            if (!this.isCompleted) {
                this.logInteraction('INACTIVITY_TIMEOUT', `Question ${this.currentQuestion}`, `No activity for ${this.inactivityThreshold/1000} seconds`);
                this.sendEmailNotification('ABANDONED_INACTIVE');
            }
        }, this.inactivityThreshold);
    }

    clearInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
    }
}

// Initialize the proposal site when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProposalSite();
});
