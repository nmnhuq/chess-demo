// Chess AI Module
class ChessAI {
    constructor() {
        this.difficulty = 'beginner';
        this.pieceValues = {
            'p': 1,
            'n': 3,
            'b': 3,
            'r': 5,
            'q': 9,
            'k': 100
        };
        
        // Position value tables for better piece placement
        this.positionTables = {
            'p': [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [50, 50, 50, 50, 50, 50, 50, 50],
                [10, 10, 20, 30, 30, 20, 10, 10],
                [5,  5, 10, 25, 25, 10,  5,  5],
                [0,  0,  0, 20, 20,  0,  0,  0],
                [5, -5,-10,  0,  0,-10, -5,  5],
                [5, 10, 10,-20,-20, 10, 10,  5],
                [0,  0,  0,  0,  0,  0,  0,  0]
            ],
            'n': [
                [-50,-40,-30,-30,-30,-30,-40,-50],
                [-40,-20,  0,  0,  0,  0,-20,-40],
                [-30,  0, 10, 15, 15, 10,  0,-30],
                [-30,  5, 15, 20, 20, 15,  5,-30],
                [-30,  0, 15, 20, 20, 15,  0,-30],
                [-30,  5, 10, 15, 15, 10,  5,-30],
                [-40,-20,  0,  5,  5,  0,-20,-40],
                [-50,-40,-30,-30,-30,-30,-40,-50]
            ],
            'b': [
                [-20,-10,-10,-10,-10,-10,-10,-20],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-10,  0,  5, 10, 10,  5,  0,-10],
                [-10,  5,  5, 10, 10,  5,  5,-10],
                [-10,  0, 10, 10, 10, 10,  0,-10],
                [-10, 10, 10, 10, 10, 10, 10,-10],
                [-10,  5,  0,  0,  0,  0,  5,-10],
                [-20,-10,-10,-10,-10,-10,-10,-20]
            ],
            'r': [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [5, 10, 10, 10, 10, 10, 10,  5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [0,  0,  0,  5,  5,  0,  0,  0]
            ],
            'q': [
                [-20,-10,-10, -5, -5,-10,-10,-20],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-10,  0,  5,  5,  5,  5,  0,-10],
                [-5,  0,  5,  5,  5,  5,  0, -5],
                [0,  0,  5,  5,  5,  5,  0, -5],
                [-10,  5,  5,  5,  5,  5,  0,-10],
                [-10,  0,  5,  0,  0,  0,  0,-10],
                [-20,-10,-10, -5, -5,-10,-10,-20]
            ],
            'k': [
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-20,-30,-30,-40,-40,-30,-30,-20],
                [-10,-20,-20,-20,-20,-20,-20,-10],
                [20, 20,  0,  0,  0,  0, 20, 20],
                [20, 30, 10,  0,  0, 10, 30, 20]
            ]
        };
        
        this.setupDifficultyListener();
    }

    setupDifficultyListener() {
        const difficultySelect = document.getElementById('difficulty');
        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                this.difficulty = e.target.value;
                if (window.teacher) {
                    window.teacher.showMessage(`AI difficulty set to ${this.difficulty}`, 'info');
                }
            });
        }
    }

    makeMove() {
        if (!window.game || window.game.currentTurn !== 'black') return;
        
        const move = this.getBestMove();
        if (move) {
            // Add a small delay to make it feel more natural
            setTimeout(() => {
                window.game.makeMove(move.from, move.to);
                
                // Provide teaching feedback
                if (window.teacher) {
                    window.teacher.analyzeAIMove(move);
                }
            }, 300);
        }
    }

    getBestMove() {
        const possibleMoves = this.getAllPossibleMoves('black');
        
        if (possibleMoves.length === 0) return null;
        
        let bestMove = null;
        
        switch (this.difficulty) {
            case 'beginner':
                bestMove = this.getBeginnerMove(possibleMoves);
                break;
            case 'easy':
                bestMove = this.getEasyMove(possibleMoves);
                break;
            case 'medium':
                bestMove = this.getMediumMove(possibleMoves);
                break;
            default:
                bestMove = possibleMoves[0];
        }
        
        return bestMove;
    }

    getBeginnerMove(moves) {
        // Beginner: Mix of random and simple captures
        const captureMoves = moves.filter(move => {
            const targetPiece = window.game.board[move.to.row][move.to.col];
            return targetPiece && targetPiece.color === 'white';
        });
        
        // 50% chance to make a capture if available
        if (captureMoves.length > 0 && Math.random() < 0.5) {
            return captureMoves[Math.floor(Math.random() * captureMoves.length)];
        }
        
        // Otherwise random move
        return moves[Math.floor(Math.random() * moves.length)];
    }

    getEasyMove(moves) {
        // Easy: Simple evaluation based on material
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves) {
            const score = this.evaluateMove(move, 1);
            
            // Add some randomness
            const randomizedScore = score + (Math.random() * 2 - 1);
            
            if (randomizedScore > bestScore) {
                bestScore = randomizedScore;
                bestMove = move;
            }
        }
        
        return bestMove;
    }

    getMediumMove(moves) {
        // Medium: Minimax with depth 2
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves) {
            const score = this.minimax(move, 2, false, -Infinity, Infinity);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }

    minimax(move, depth, isMaximizing, alpha, beta) {
        // Make the move temporarily
        const board = window.game.board;
        const from = move.from;
        const to = move.to;
        const piece = board[from.row][from.col];
        const captured = board[to.row][to.col];
        
        board[to.row][to.col] = piece;
        board[from.row][from.col] = null;
        
        let score;
        
        if (depth === 0) {
            score = this.evaluateBoard();
        } else {
            const color = isMaximizing ? 'black' : 'white';
            const possibleMoves = this.getAllPossibleMoves(color);
            
            if (possibleMoves.length === 0) {
                score = isMaximizing ? -10000 : 10000;
            } else {
                if (isMaximizing) {
                    score = -Infinity;
                    for (const nextMove of possibleMoves) {
                        score = Math.max(score, this.minimax(nextMove, depth - 1, false, alpha, beta));
                        alpha = Math.max(alpha, score);
                        if (beta <= alpha) break;
                    }
                } else {
                    score = Infinity;
                    for (const nextMove of possibleMoves) {
                        score = Math.min(score, this.minimax(nextMove, depth - 1, true, alpha, beta));
                        beta = Math.min(beta, score);
                        if (beta <= alpha) break;
                    }
                }
            }
        }
        
        // Undo the move
        board[from.row][from.col] = piece;
        board[to.row][to.col] = captured;
        
        return score;
    }

    evaluateMove(move, depth = 0) {
        const board = window.game.board;
        const piece = board[move.from.row][move.from.col];
        const targetPiece = board[move.to.row][move.to.col];
        
        let score = 0;
        
        // Capture value
        if (targetPiece) {
            score += this.pieceValues[targetPiece.type] * 10;
        }
        
        // Position value
        const posTable = this.positionTables[piece.type];
        if (posTable) {
            const fromPos = posTable[7 - move.from.row][move.from.col];
            const toPos = posTable[7 - move.to.row][move.to.col];
            score += (toPos - fromPos) / 100;
        }
        
        // Center control bonus
        const centerDistance = Math.abs(3.5 - move.to.row) + Math.abs(3.5 - move.to.col);
        score += (7 - centerDistance) / 10;
        
        return score;
    }

    evaluateBoard() {
        let score = 0;
        const board = window.game.board;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const value = this.pieceValues[piece.type];
                    const posValue = this.getPositionValue(piece, row, col);
                    
                    if (piece.color === 'black') {
                        score += value + posValue;
                    } else {
                        score -= value + posValue;
                    }
                }
            }
        }
        
        return score;
    }

    getPositionValue(piece, row, col) {
        const table = this.positionTables[piece.type];
        if (!table) return 0;
        
        if (piece.color === 'white') {
            return table[row][col] / 100;
        } else {
            return table[7 - row][col] / 100;
        }
    }

    getAllPossibleMoves(color) {
        const moves = [];
        const board = window.game.board;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color === color) {
                    const validMoves = window.game.getValidMoves(row, col);
                    for (const move of validMoves) {
                        moves.push({
                            from: { row, col },
                            to: move,
                            piece: piece.type
                        });
                    }
                }
            }
        }
        
        return moves;
    }

    provideHint() {
        if (window.game.currentTurn !== 'white') {
            window.game.showMessage('Hints are only available on your turn!', 'error');
            return;
        }
        
        const possibleMoves = this.getAllPossibleMoves('white');
        if (possibleMoves.length === 0) return;
        
        // Get top 3 moves
        const evaluatedMoves = possibleMoves.map(move => ({
            move,
            score: this.evaluateMove(move)
        })).sort((a, b) => b.score - a.score);
        
        const topMoves = evaluatedMoves.slice(0, 3);
        
        // Highlight the best moves
        const board = window.game.board;
        topMoves.forEach((item, index) => {
            const square = document.querySelector(
                `[data-row="${item.move.from.row}"][data-col="${item.move.from.col}"]`
            );
            if (square) {
                square.classList.add('hint-highlight');
                setTimeout(() => {
                    square.classList.remove('hint-highlight');
                }, 3000);
            }
        });
        
        // Show teaching message
        if (window.teacher) {
            const bestMove = topMoves[0].move;
            const piece = board[bestMove.from.row][bestMove.from.col];
            window.teacher.explainHint(piece, bestMove);
        }
    }
}

// Initialize AI when the page loads
window.addEventListener('DOMContentLoaded', () => {
    window.ai = new ChessAI();
});
