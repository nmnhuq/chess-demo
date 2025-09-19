// Chess Game Engine
class ChessGame {
    constructor() {
        this.board = [];
        this.currentTurn = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.inCheck = false;
        this.checkmate = false;
        this.stalemate = false;
        this.lastMove = null;
        this.promotionPending = null;
        
        this.initializeBoard();
        this.renderBoard();
        this.attachEventListeners();
    }

    initializeBoard() {
        // Initialize empty board
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Place pieces in starting positions
        const pieceOrder = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        
        // Black pieces
        for (let i = 0; i < 8; i++) {
            this.board[0][i] = { type: pieceOrder[i], color: 'black' };
            this.board[1][i] = { type: 'p', color: 'black' };
        }
        
        // White pieces
        for (let i = 0; i < 8; i++) {
            this.board[7][i] = { type: pieceOrder[i], color: 'white' };
            this.board[6][i] = { type: 'p', color: 'white' };
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('chess-board');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.className += (row + col) % 2 === 0 ? ' light' : ' dark';
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Add piece if present
                const piece = this.board[row][col];
                if (piece) {
                    const pieceSymbol = this.getPieceSymbol(piece);
                    square.innerHTML = `<span class="piece">${pieceSymbol}</span>`;
                }
                
                // Highlight selected square
                if (this.selectedSquare && 
                    this.selectedSquare.row === row && 
                    this.selectedSquare.col === col) {
                    square.classList.add('selected');
                }
                
                // Highlight valid moves
                if (this.validMoves.some(move => move.row === row && move.col === col)) {
                    const targetPiece = this.board[row][col];
                    if (targetPiece && targetPiece.color !== this.currentTurn) {
                        square.classList.add('valid-capture');
                    } else {
                        square.classList.add('valid-move');
                    }
                }
                
                // Highlight last move
                if (this.lastMove) {
                    if ((this.lastMove.from.row === row && this.lastMove.from.col === col) ||
                        (this.lastMove.to.row === row && this.lastMove.to.col === col)) {
                        square.classList.add('last-move');
                    }
                }
                
                // Highlight king in check
                if (this.inCheck && piece && piece.type === 'k' && piece.color === this.currentTurn) {
                    square.classList.add('in-check');
                }
                
                boardElement.appendChild(square);
            }
        }
        
        this.updateGameStatus();
        this.updateCapturedPieces();
    }

    getPieceSymbol(piece) {
        const symbols = {
            'k': { white: '♔', black: '♚' },
            'q': { white: '♕', black: '♛' },
            'r': { white: '♖', black: '♜' },
            'b': { white: '♗', black: '♝' },
            'n': { white: '♘', black: '♞' },
            'p': { white: '♙', black: '♟' }
        };
        return symbols[piece.type][piece.color];
    }

    attachEventListeners() {
        const boardElement = document.getElementById('chess-board');
        boardElement.addEventListener('click', (e) => this.handleSquareClick(e));
        
        document.getElementById('new-game').addEventListener('click', () => this.resetGame());
        document.getElementById('undo-move').addEventListener('click', () => this.undoMove());
        document.getElementById('get-hint').addEventListener('click', () => this.getHint());
        
        // Tutorial modal
        document.getElementById('skip-tutorial').addEventListener('click', () => {
            document.getElementById('tutorial-modal').style.display = 'none';
        });
        
        document.getElementById('start-tutorial').addEventListener('click', () => {
            document.getElementById('tutorial-modal').style.display = 'none';
            this.startTutorial();
        });
        
        // Promotion modal
        document.querySelectorAll('.promotion-choice').forEach(button => {
            button.addEventListener('click', (e) => {
                const pieceType = e.target.dataset.piece;
                this.completePromotion(pieceType);
            });
        });
    }

    handleSquareClick(e) {
        const square = e.target.closest('.square');
        if (!square) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = this.board[row][col];
        
        // If we're waiting for promotion, ignore clicks
        if (this.promotionPending) return;
        
        // If no piece is selected
        if (!this.selectedSquare) {
            if (piece && piece.color === this.currentTurn) {
                this.selectPiece(row, col);
            }
        } else {
            // If clicking on the same square, deselect
            if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
                this.deselectPiece();
            }
            // If clicking on another piece of the same color, select it
            else if (piece && piece.color === this.currentTurn) {
                this.selectPiece(row, col);
            }
            // If clicking on a valid move, make the move
            else if (this.validMoves.some(move => move.row === row && move.col === col)) {
                this.makeMove(this.selectedSquare, { row, col });
            }
            // Otherwise, deselect
            else {
                this.deselectPiece();
            }
        }
    }

    selectPiece(row, col) {
        this.selectedSquare = { row, col };
        this.validMoves = this.getValidMoves(row, col);
        this.renderBoard();
        
        // Show piece info in teaching panel
        const piece = this.board[row][col];
        if (window.teacher) {
            window.teacher.explainPiece(piece.type);
        }
    }

    deselectPiece() {
        this.selectedSquare = null;
        this.validMoves = [];
        this.renderBoard();
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        let moves = [];
        
        switch (piece.type) {
            case 'p':
                moves = this.getPawnMoves(row, col, piece.color);
                break;
            case 'n':
                moves = this.getKnightMoves(row, col, piece.color);
                break;
            case 'b':
                moves = this.getBishopMoves(row, col, piece.color);
                break;
            case 'r':
                moves = this.getRookMoves(row, col, piece.color);
                break;
            case 'q':
                moves = this.getQueenMoves(row, col, piece.color);
                break;
            case 'k':
                moves = this.getKingMoves(row, col, piece.color);
                break;
        }
        
        // Filter out moves that would leave king in check
        return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col, piece.color));
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        
        // Move forward one square
        if (this.isValidSquare(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Move forward two squares from starting position
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }
        
        // Capture diagonally
        [-1, 1].forEach(offset => {
            const newCol = col + offset;
            if (this.isValidSquare(row + direction, newCol)) {
                const target = this.board[row + direction][newCol];
                if (target && target.color !== color) {
                    moves.push({ row: row + direction, col: newCol });
                }
                
                // En passant
                if (this.enPassantTarget && 
                    this.enPassantTarget.row === row + direction && 
                    this.enPassantTarget.col === newCol) {
                    moves.push({ row: row + direction, col: newCol });
                }
            }
        });
        
        return moves;
    }

    getKnightMoves(row, col, color) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        knightMoves.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        return moves;
    }

    getBishopMoves(row, col, color) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        directions.forEach(([dr, dc]) => {
            let newRow = row + dr;
            let newCol = col + dc;
            
            while (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += dr;
                newCol += dc;
            }
        });
        
        return moves;
    }

    getRookMoves(row, col, color) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        directions.forEach(([dr, dc]) => {
            let newRow = row + dr;
            let newCol = col + dc;
            
            while (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += dr;
                newCol += dc;
            }
        });
        
        return moves;
    }

    getQueenMoves(row, col, color) {
        // Queen moves like both rook and bishop
        return [...this.getRookMoves(row, col, color), ...this.getBishopMoves(row, col, color)];
    }

    getKingMoves(row, col, color) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        kingMoves.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        // Castling
        if (!this.inCheck && this.castlingRights[color]) {
            // Kingside castling
            if (this.castlingRights[color].kingside) {
                if (!this.board[row][col + 1] && !this.board[row][col + 2]) {
                    const rook = this.board[row][7];
                    if (rook && rook.type === 'r' && rook.color === color) {
                        if (!this.wouldBeInCheck(row, col, row, col + 1, color) &&
                            !this.wouldBeInCheck(row, col, row, col + 2, color)) {
                            moves.push({ row, col: col + 2, castling: 'kingside' });
                        }
                    }
                }
            }
            
            // Queenside castling
            if (this.castlingRights[color].queenside) {
                if (!this.board[row][col - 1] && !this.board[row][col - 2] && !this.board[row][col - 3]) {
                    const rook = this.board[row][0];
                    if (rook && rook.type === 'r' && rook.color === color) {
                        if (!this.wouldBeInCheck(row, col, row, col - 1, color) &&
                            !this.wouldBeInCheck(row, col, row, col - 2, color)) {
                            moves.push({ row, col: col - 2, castling: 'queenside' });
                        }
                    }
                }
            }
        }
        
        return moves;
    }

    isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Make a temporary move
        const tempBoard = this.board.map(row => [...row]);
        const piece = tempBoard[fromRow][fromCol];
        tempBoard[toRow][toCol] = piece;
        tempBoard[fromRow][fromCol] = null;
        
        // Find king position
        let kingPos = null;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = tempBoard[r][c];
                if (p && p.type === 'k' && p.color === color) {
                    kingPos = { row: r, col: c };
                    break;
                }
            }
            if (kingPos) break;
        }
        
        if (!kingPos) return false;
        
        // Check if king is under attack
        return this.isSquareUnderAttack(kingPos.row, kingPos.col, color, tempBoard);
    }

    isSquareUnderAttack(row, col, color, board = this.board) {
        const enemyColor = color === 'white' ? 'black' : 'white';
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.color === enemyColor) {
                    const moves = this.getPieceMoves(r, c, piece, board);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    getPieceMoves(row, col, piece, board = this.board) {
        // Similar to getValidMoves but without check validation
        let moves = [];
        
        switch (piece.type) {
            case 'p':
                moves = this.getPawnAttacks(row, col, piece.color, board);
                break;
            case 'n':
                moves = this.getKnightMoves(row, col, piece.color);
                break;
            case 'b':
                moves = this.getBishopMoves(row, col, piece.color);
                break;
            case 'r':
                moves = this.getRookMoves(row, col, piece.color);
                break;
            case 'q':
                moves = this.getQueenMoves(row, col, piece.color);
                break;
            case 'k':
                moves = this.getKingBasicMoves(row, col, piece.color);
                break;
        }
        
        return moves;
    }

    getPawnAttacks(row, col, color, board = this.board) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        
        // Pawn attacks diagonally
        [-1, 1].forEach(offset => {
            const newCol = col + offset;
            if (this.isValidSquare(row + direction, newCol)) {
                moves.push({ row: row + direction, col: newCol });
            }
        });
        
        return moves;
    }

    getKingBasicMoves(row, col, color) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        kingMoves.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isValidSquare(newRow, newCol)) {
                moves.push({ row: newRow, col: newCol });
            }
        });
        
        return moves;
    }

    makeMove(from, to) {
        const piece = this.board[from.row][from.col];
        const targetPiece = this.board[to.row][to.col];
        const validMove = this.validMoves.find(m => m.row === to.row && m.col === to.col);
        
        // Handle captures
        if (targetPiece) {
            this.capturedPieces[targetPiece.color].push(targetPiece);
        }
        
        // Handle en passant capture
        if (piece.type === 'p' && this.enPassantTarget && 
            to.row === this.enPassantTarget.row && to.col === this.enPassantTarget.col) {
            const capturedPawnRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
            const capturedPawn = this.board[capturedPawnRow][to.col];
            this.capturedPieces[capturedPawn.color].push(capturedPawn);
            this.board[capturedPawnRow][to.col] = null;
        }
        
        // Update en passant target
        this.enPassantTarget = null;
        if (piece.type === 'p' && Math.abs(from.row - to.row) === 2) {
            this.enPassantTarget = {
                row: (from.row + to.row) / 2,
                col: from.col
            };
        }
        
        // Handle castling
        if (validMove && validMove.castling) {
            if (validMove.castling === 'kingside') {
                this.board[from.row][5] = this.board[from.row][7];
                this.board[from.row][7] = null;
            } else if (validMove.castling === 'queenside') {
                this.board[from.row][3] = this.board[from.row][0];
                this.board[from.row][0] = null;
            }
        }
        
        // Update castling rights
        if (piece.type === 'k') {
            this.castlingRights[piece.color].kingside = false;
            this.castlingRights[piece.color].queenside = false;
        } else if (piece.type === 'r') {
            if (from.col === 0) {
                this.castlingRights[piece.color].queenside = false;
            } else if (from.col === 7) {
                this.castlingRights[piece.color].kingside = false;
            }
        }
        
        // Make the move
        this.board[to.row][to.col] = piece;
        this.board[from.row][from.col] = null;
        
        // Check for pawn promotion
        if (piece.type === 'p') {
            const promotionRow = piece.color === 'white' ? 0 : 7;
            if (to.row === promotionRow) {
                this.promotionPending = { row: to.row, col: to.col, color: piece.color };
                this.showPromotionModal();
                return; // Don't switch turns yet
            }
        }
        
        // Record move
        this.lastMove = { from, to, piece: piece.type };
        this.moveHistory.push({
            from,
            to,
            piece: piece.type,
            captured: targetPiece,
            notation: this.getMoveNotation(piece, from, to, targetPiece)
        });
        
        this.finalizeTurn();
    }

    finalizeTurn() {
        // Switch turns
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        this.deselectPiece();
        
        // Check for check, checkmate, or stalemate
        this.checkGameState();
        
        // Update move history display
        this.updateMoveHistory();
        
        // If it's AI's turn, make AI move
        if (this.currentTurn === 'black' && !this.checkmate && !this.stalemate) {
            setTimeout(() => {
                if (window.ai) {
                    window.ai.makeMove();
                }
            }, 500);
        }
    }

    showPromotionModal() {
        document.getElementById('promotion-modal').style.display = 'flex';
    }

    completePromotion(pieceType) {
        if (!this.promotionPending) return;
        
        const { row, col, color } = this.promotionPending;
        this.board[row][col] = { type: pieceType, color };
        
        document.getElementById('promotion-modal').style.display = 'none';
        this.promotionPending = null;
        
        this.finalizeTurn();
    }

    checkGameState() {
        const color = this.currentTurn;
        this.inCheck = this.isKingInCheck(color);
        
        const hasValidMoves = this.hasAnyValidMoves(color);
        
        if (!hasValidMoves) {
            if (this.inCheck) {
                this.checkmate = true;
                this.showGameEnd('checkmate', color === 'white' ? 'black' : 'white');
            } else {
                this.stalemate = true;
                this.showGameEnd('stalemate');
            }
        }
    }

    isKingInCheck(color) {
        // Find king position
        let kingPos = null;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.type === 'k' && piece.color === color) {
                    kingPos = { row: r, col: c };
                    break;
                }
            }
            if (kingPos) break;
        }
        
        if (!kingPos) return false;
        
        return this.isSquareUnderAttack(kingPos.row, kingPos.col, color);
    }

    hasAnyValidMoves(color) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === color) {
                    const moves = this.getValidMoves(r, c);
                    if (moves.length > 0) return true;
                }
            }
        }
        return false;
    }

    getMoveNotation(piece, from, to, captured) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        
        let notation = '';
        
        if (piece.type !== 'p') {
            notation += piece.type.toUpperCase();
        }
        
        if (captured) {
            if (piece.type === 'p') {
                notation += files[from.col];
            }
            notation += 'x';
        }
        
        notation += files[to.col] + ranks[to.row];
        
        if (this.inCheck) {
            notation += this.checkmate ? '#' : '+';
        }
        
        return notation;
    }

    updateGameStatus() {
        const turnIndicator = document.getElementById('turn-indicator');
        const turnText = turnIndicator.querySelector('.turn-text');
        
        turnText.textContent = `${this.currentTurn.charAt(0).toUpperCase() + this.currentTurn.slice(1)} to move`;
        
        if (this.currentTurn === 'black') {
            turnIndicator.classList.add('black-turn');
        } else {
            turnIndicator.classList.remove('black-turn');
        }
        
        const messageEl = document.getElementById('game-message');
        if (this.inCheck) {
            messageEl.textContent = 'Check!';
            messageEl.className = 'game-message error';
        } else if (this.checkmate) {
            messageEl.textContent = `Checkmate! ${this.currentTurn === 'white' ? 'Black' : 'White'} wins!`;
            messageEl.className = 'game-message success';
        } else if (this.stalemate) {
            messageEl.textContent = 'Stalemate! The game is a draw.';
            messageEl.className = 'game-message info';
        } else {
            messageEl.textContent = '';
            messageEl.className = 'game-message';
        }
    }

    updateCapturedPieces() {
        const whiteCaptures = document.getElementById('captured-white');
        const blackCaptures = document.getElementById('captured-black');
        
        whiteCaptures.innerHTML = this.capturedPieces.white
            .map(p => this.getPieceSymbol(p))
            .join(' ');
        
        blackCaptures.innerHTML = this.capturedPieces.black
            .map(p => this.getPieceSymbol(p))
            .join(' ');
    }

    updateMoveHistory() {
        const moveList = document.getElementById('move-list');
        const moves = this.moveHistory;
        
        let html = '';
        for (let i = 0; i < moves.length; i += 2) {
            const moveNum = Math.floor(i / 2) + 1;
            html += `<div class="move-pair">`;
            html += `<span class="move-number">${moveNum}.</span>`;
            html += `<span class="move">${moves[i].notation}</span>`;
            if (moves[i + 1]) {
                html += `<span class="move">${moves[i + 1].notation}</span>`;
            }
            html += `</div>`;
        }
        
        moveList.innerHTML = html;
        moveList.scrollTop = moveList.scrollHeight;
    }

    showGameEnd(result, winner = null) {
        const messageEl = document.getElementById('game-message');
        
        if (result === 'checkmate') {
            messageEl.textContent = `Checkmate! ${winner === 'white' ? 'White' : 'Black'} wins!`;
            messageEl.className = 'game-message success';
            
            if (window.teacher) {
                window.teacher.explainCheckmate(winner);
            }
        } else if (result === 'stalemate') {
            messageEl.textContent = 'Stalemate! The game is a draw.';
            messageEl.className = 'game-message info';
            
            if (window.teacher) {
                window.teacher.explainStalemate();
            }
        }
    }

    resetGame() {
        this.currentTurn = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.inCheck = false;
        this.checkmate = false;
        this.stalemate = false;
        this.lastMove = null;
        this.promotionPending = null;
        
        this.initializeBoard();
        this.renderBoard();
        this.updateMoveHistory();
        
        if (window.teacher) {
            window.teacher.showWelcome();
        }
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        // For simplicity, just reset the game
        // A full undo implementation would require storing board states
        this.showMessage('Undo not fully implemented. Use New Game to restart.', 'info');
    }

    getHint() {
        if (window.ai) {
            window.ai.provideHint();
        }
    }

    startTutorial() {
        if (window.teacher) {
            window.teacher.startTutorial();
        }
    }

    showMessage(text, type = 'info') {
        const messageEl = document.getElementById('game-message');
        messageEl.textContent = text;
        messageEl.className = `game-message ${type}`;
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    window.game = new ChessGame();
    
    // Show tutorial modal after a short delay
    setTimeout(() => {
        document.getElementById('tutorial-modal').classList.add('show');
    }, 500);
});
