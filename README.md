# Learn Chess - Interactive Chess Game with AI Teacher

## Welcome to Chess! ♔

This is an educational chess game designed specifically for beginners to learn the rules and strategies of chess while playing against an adaptive AI opponent.

## Features

### 🎓 Educational Tools
- **Interactive Tutorial** - Learn the basics step by step
- **Move Highlighting** - See all legal moves when you select a piece
- **AI Teacher** - Get explanations for moves and strategies
- **Hint System** - Get suggestions when you're stuck
- **Move History** - Review the game with standard chess notation

### 🤖 Adaptive AI Opponent
- **Beginner Mode** - Makes occasional mistakes, perfect for learning
- **Easy Mode** - Plays solid moves but won't overwhelm you
- **Medium Mode** - More challenging, uses basic tactics

### 🎮 Game Features
- **Full Chess Rules** - Including castling, en passant, and pawn promotion
- **Check/Checkmate Detection** - Clear indicators when the king is in danger
- **Captured Pieces Display** - See what pieces have been taken
- **New Game/Undo** - Start fresh or take back moves

## How to Play

### Getting Started
1. Open `index.html` in your web browser
2. Choose whether to view the tutorial (recommended for first-time players)
3. White pieces (you) always move first
4. Click on any of your pieces to see where it can move

### Basic Rules

#### How Pieces Move
- **Pawn (♙)** - Moves forward one square, captures diagonally
- **Knight (♘)** - Moves in an L-shape, can jump over pieces
- **Bishop (♗)** - Moves diagonally any distance
- **Rook (♖)** - Moves horizontally or vertically any distance
- **Queen (♕)** - Combines rook and bishop movement
- **King (♔)** - Moves one square in any direction

#### Objective
The goal is to checkmate your opponent's king - putting it under attack with no way to escape.

### Special Moves

#### Castling
Move your king two squares toward a rook, and the rook jumps over the king. You can only castle if:
- Neither piece has moved
- No pieces are between them
- The king is not in check
- The king doesn't move through check

#### En Passant
A special pawn capture that can occur when an enemy pawn moves two squares forward from its starting position, landing beside your pawn.

#### Pawn Promotion
When a pawn reaches the opposite end of the board, it can become any piece (usually a queen).

## Tips for Beginners

### Opening Principles
1. **Control the center** - Place pawns on e4, d4, e5, or d5
2. **Develop pieces** - Bring out knights and bishops
3. **Castle early** - Get your king to safety
4. **Don't move the same piece twice** - Develop all pieces first
5. **Don't bring your queen out too early** - It can be attacked

### Basic Tactics to Learn
- **Fork** - Attack two pieces at once
- **Pin** - Attack a piece that can't move without exposing a more valuable piece
- **Skewer** - Force a valuable piece to move and capture the piece behind it

### Piece Values (for trades)
- Pawn = 1 point
- Knight = 3 points
- Bishop = 3 points
- Rook = 5 points
- Queen = 9 points
- King = Priceless (losing it means losing the game)

## Learning Path

1. **Start with Beginner AI** - Learn piece movement and basic captures
2. **Use the Hint System** - Understand good moves and why they work
3. **Try Easy Mode** - Practice basic tactics and strategies
4. **Challenge Medium Mode** - Test your skills with a stronger opponent
5. **Study Your Games** - Review the move history to see what worked

## Keyboard Shortcuts
- Currently, the game is played entirely with mouse clicks
- Future versions may include keyboard shortcuts

## Technical Details

The game is built with:
- Pure HTML5, CSS3, and JavaScript
- No external dependencies required
