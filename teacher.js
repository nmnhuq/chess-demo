// Chess Teacher Module
class ChessTeacher {
    constructor() {
        this.currentLesson = 0;
        this.pieceDescriptions = {
            'p': {
                name: 'Pawn',
                movement: 'Pawns move forward one square, but capture diagonally. On their first move, they can advance two squares.',
                value: '1 point',
                tips: 'Pawns are stronger when they support each other. Try to keep them connected!',
                special: 'En passant: A special capture when an enemy pawn moves two squares. Promotion: When a pawn reaches the end, it becomes a Queen (or other piece)!'
            },
            'n': {
                name: 'Knight',
                movement: 'Knights move in an L-shape: two squares in one direction and one square perpendicular.',
                value: '3 points',
                tips: 'Knights are the only pieces that can jump over others. They work best in the center of the board!',
                special: 'Knights can fork multiple pieces at once - look for opportunities to attack two valuable pieces!'
            },
            'b': {
                name: 'Bishop',
                movement: 'Bishops move diagonally any number of squares.',
                value: '3 points',
                tips: 'Bishops work well in pairs - one controls light squares, the other dark squares.',
                special: 'Long-range bishops are powerful in open positions with few pawns blocking their diagonals.'
            },
            'r': {
                name: 'Rook',
                movement: 'Rooks move horizontally or vertically any number of squares.',
                value: '5 points',
                tips: 'Rooks are powerful on open files (columns without pawns) and the 7th rank.',
                special: 'Castling: A special move with the King for safety. Rooks work best when doubled on a file!'
            },
            'q': {
                name: 'Queen',
                movement: 'The Queen combines Rook and Bishop movement - any direction, any distance!',
                value: '9 points',
                tips: "The Queen is your most powerful piece - don't bring her out too early where she can be attacked!",
                special: 'The Queen is excellent for both attack and defense, but losing her often means losing the game.'
            },
            'k': {
                name: 'King',
                movement: 'The King moves one square in any direction.',
                value: 'Priceless!',
                tips: 'Keep your King safe! Castle early to protect him behind pawns.',
                special: 'Castling: Move the King two squares toward a Rook, and the Rook jumps over. You cannot castle through check!'
            }
        };
        
        this.strategies = {
            opening: [
                'Control the center with pawns (e4, d4)',
                'Develop knights before bishops',
                'Castle your king to safety early',
                "Don't move the same piece twice in the opening",
                "Don't bring your queen out too early"
            ],
            middlegame: [
                'Look for tactical patterns: forks, pins, skewers',
                'Improve your worst-placed piece',
                'Create weaknesses in your opponent\'s position',
                'Control important squares and files',
                'Coordinate your pieces for attacks'
            ],
            endgame: [
                'Activate your king - it\'s a strong piece in the endgame!',
                'Push passed pawns toward promotion',
                'Centralize your king',
                'Use opposition to control key squares',
                'Remember: Rook endgames are most common'
            ]
        };
    }

    showWelcome() {
        this.updateTeachingPanel(`
            <h4>Welcome to Chess!</h4>
            <p>I'm your chess teacher. I'll help you learn as you play!</p>
            <ul>
                <li>🎯 Click any piece to see where it can move</li>
                <li>💡 Use the "Get Hint" button when you need help</li>
                <li>📚 I'll explain moves and strategies as we play</li>
                <li>🏆 Try different AI difficulty levels as you improve!</li>
            </ul>
            <p><strong>Tip:</strong> White always moves first. Good luck!</p>
        `);
    }

    startTutorial() {
        const tutorials = [
            {
                title: 'How Pieces Move',
                content: 'Each piece has unique movement. Click on any piece to see its legal moves highlighted in green!'
            },
            {
                title: 'The Goal',
                content: 'Checkmate the enemy King! This means the King is under attack (check) and cannot escape.'
            },
            {
                title: 'Basic Strategy',
                content: '1. Control the center\n2. Develop your pieces\n3. Castle for safety\n4. Look for tactics!'
            }
        ];
        
        let currentTutorial = 0;
        const showNextTutorial = () => {
            if (currentTutorial < tutorials.length) {
                const tutorial = tutorials[currentTutorial];
                this.updateTeachingPanel(`
                    <h4>Tutorial ${currentTutorial + 1}/${tutorials.length}: ${tutorial.title}</h4>
                    <p>${tutorial.content}</p>
                    <button onclick="window.teacher.nextTutorialStep()" class="btn btn-primary">Next</button>
                `);
                currentTutorial++;
            } else {
                this.showWelcome();
            }
        };
        
        this.nextTutorialStep = showNextTutorial;
        showNextTutorial();
    }

    explainPiece(pieceType) {
        const piece = this.pieceDescriptions[pieceType];
        if (!piece) return;
        
        this.updateTeachingPanel(`
            <h4>${piece.name}</h4>
            <p><strong>Movement:</strong> ${piece.movement}</p>
            <p><strong>Value:</strong> ${piece.value}</p>
            <p><strong>Tip:</strong> ${piece.tips}</p>
            <p><em>${piece.special}</em></p>
        `);
    }

    explainHint(piece, move) {
        const pieceInfo = this.pieceDescriptions[piece.type];
        const files = 'abcdefgh';
        const ranks = '87654321';
        const from = files[move.from.col] + ranks[move.from.row];
        const to = files[move.to.col] + ranks[move.to.row];
        
        const reasons = [];
        
        // Check if it's a capture
        const targetPiece = window.game.board[move.to.row][move.to.col];
        if (targetPiece) {
            reasons.push(`Captures ${this.pieceDescriptions[targetPiece.type].name}`);
        }
        
        // Check center control
        if ((move.to.row === 3 || move.to.row === 4) && (move.to.col === 3 || move.to.col === 4)) {
            reasons.push('Controls the center');
        }
        
        // Check development
        if (piece.type === 'n' || piece.type === 'b') {
            if (move.from.row === 7 || move.from.row === 0) {
                reasons.push('Develops a piece');
            }
        }
        
        this.updateTeachingPanel(`
            <h4>💡 Hint: ${pieceInfo.name} ${from} to ${to}</h4>
            <p><strong>Why this move?</strong></p>
            <ul>
                ${reasons.map(r => `<li>${r}</li>`).join('')}
            </ul>
            <p><em>The highlighted pieces show good moves. Click one to explore!</em></p>
        `);
    }

    analyzeAIMove(move) {
        const piece = window.game.board[move.to.row][move.to.col];
        if (!piece) return;
        
        const pieceInfo = this.pieceDescriptions[piece.type];
        const files = 'abcdefgh';
        const ranks = '87654321';
        const from = files[move.from.col] + ranks[move.from.row];
        const to = files[move.to.col] + ranks[move.to.row];
        
        const messages = [
            `Black moved ${pieceInfo.name} from ${from} to ${to}`,
            'Think about how to respond!',
            'Look for tactics and threats.'
        ];
        
        this.updateTeachingPanel(`
            <h4>AI Move Analysis</h4>
            <p>${messages.join(' ')}</p>
            <p><strong>Your turn!</strong> Take your time to find the best move.</p>
        `);
    }

    explainCheckmate(winner) {
        this.updateTeachingPanel(`
            <h4>🏆 Checkmate!</h4>
            <p><strong>${winner === 'white' ? 'Congratulations! You' : 'The AI'} won!</strong></p>
            <p>Checkmate means the King is in check and has no legal moves to escape.</p>
            <p>Great game! Click "New Game" to play again.</p>
            <h5>What you learned:</h5>
            <ul>
                <li>How pieces move and capture</li>
                <li>The importance of King safety</li>
                <li>Basic tactics and strategy</li>
            </ul>
        `);
    }

    explainStalemate() {
        this.updateTeachingPanel(`
            <h4>Stalemate - Draw!</h4>
            <p>The game is a draw because the player to move has no legal moves but is NOT in check.</p>
            <p>This is different from checkmate where the King IS in check.</p>
            <p><strong>Remember:</strong> Stalemate is a draw, not a win!</p>
        `);
    }

    showMessage(text, type = 'info') {
        const messageEl = document.getElementById('game-message');
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.className = `game-message ${type}`;
        }
    }

    updateTeachingPanel(html) {
        const panel = document.getElementById('teaching-content');
        if (panel) {
            panel.innerHTML = html;
        }
    }

    getGamePhase() {
        const moveCount = window.game ? window.game.moveHistory.length : 0;
        if (moveCount < 10) return 'opening';
        if (moveCount < 30) return 'middlegame';
        return 'endgame';
    }

    getRandomTip() {
        const phase = this.getGamePhase();
        const tips = this.strategies[phase];
        return tips[Math.floor(Math.random() * tips.length)];
    }

    providePeriodictips() {
        // Provide tips every 5 moves
        if (window.game && window.game.moveHistory.length % 5 === 0 && window.game.moveHistory.length > 0) {
            const tip = this.getRandomTip();
            this.updateTeachingPanel(`
                <h4>💡 Strategy Tip</h4>
                <p><strong>${this.getGamePhase().charAt(0).toUpperCase() + this.getGamePhase().slice(1)} phase:</strong></p>
                <p>${tip}</p>
            `);
        }
    }
}

// Initialize teacher when the page loads
window.addEventListener('DOMContentLoaded', () => {
    window.teacher = new ChessTeacher();
    window.teacher.showWelcome();
});
