# Solana Checkers - Decentralized Board Game

A fully decentralized checkers game that runs directly in the browser and uses Solana blockchain for player stakes and game outcomes. No backend required!

![Game Preview](preview.png)

## What Makes This Special?

- 100% browser-based - no servers needed
- Players stake SOL tokens to play
- Winner gets 90% of the total stake
- All game logic runs on Solana blockchain
- Beautiful 3D graphics using Three.js

## How It Works

1. Player 1 creates a game and stakes SOL
2. Game appears in the public game list
3. Player 2 joins and matches the stake
4. Players make moves on the board
5. Smart contract validates moves and handles payouts
6. Winner gets both stakes minus 10% platform fee

## Tech Stack

- React (Frontend framework)
- TypeScript (Type safety)
- Three.js (3D game rendering)
- @solana/web3.js (Blockchain interactions)
- @solana/wallet-adapter-react (Wallet integration)

## Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/solana-checkers
cd solana-checkers

# Install dependencies
npm install

# Start development server
npm start
```

## Smart Contract Setup

```bash
# Install Solana tools
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Build the program
cd program
cargo build-bpf

# Deploy to devnet
solana program deploy target/deploy/checkers.so
```

## Configuration

Create a `.env` file:

```env
REACT_APP_SOLANA_NETWORK=devnet  # or mainnet-beta
REACT_APP_PROGRAM_ID=your_program_id_here
```

## Game Rules

### Basic Rules
- Standard checkers rules apply
- Kings can move backwards
- Multiple jumps are required when available

### Blockchain Rules
- Minimum stake: 0.1 SOL
- Maximum stake: 10 SOL
- Platform fee: 10%
- Game timeout: 10 minutes per player

## Smart Contract Methods

### For Players
```typescript
// Create a new game
await program.methods.createGame(stake).accounts({...}).rpc()

// Join an existing game
await program.methods.joinGame(gameId).accounts({...}).rpc()

// Make a move
await program.methods.makeMove(from, to).accounts({...}).rpc()
```

### For Viewers
```typescript
// Get all active games
const games = await program.account.game.all()

// Watch a specific game
program.account.game.subscribe(gameId, (account) => {
    console.log('Game updated:', account)
})
```

## Directory Structure

```
solana-checkers/
├── src/
│   ├── components/         # React components
│   ├── contracts/         # Solana program interactions
│   ├── game/             # Game logic
│   ├── models/           # TypeScript interfaces
│   └── utils/            # Helper functions
├── program/              # Solana smart contract
│   ├── src/             # Contract source code
│   └── tests/           # Contract tests
└── public/              # Static assets
```

## Local Development

1. Start the development server:
```bash
npm start
```

2. Connect to Solana devnet:
```bash
solana config set --url devnet
```

3. Create a test wallet:
```bash
solana-keygen new -o id.json
```

4. Get devnet SOL:
```bash
solana airdrop 2 $(solana-keygen pubkey id.json)
```

## Testing

```bash
# Run frontend tests
npm test

# Run contract tests
cd program
cargo test
```

## Common Issues

### Wallet Connection
**Problem**: "Cannot connect wallet"  
**Solution**: Make sure Phantom or another Solana wallet is installed and unlocked

### Transaction Error
**Problem**: "Transaction failed"  
**Solution**: Check your SOL balance and network status

### Move Not Working
**Problem**: "Move invalid"  
**Solution**: Ensure it's your turn and the move follows checkers rules

## Deployment

1. Update program ID in `.env`
2. Build for production:
```bash
npm run build
```
3. Deploy to your hosting service:
```bash
# Example for GitHub Pages
npm run deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Security

- All moves are validated on-chain
- Timeouts prevent abandoned games
- Stake handling uses secure Solana programs
- Front-running protection built in

## Support

- Create an issue for bugs
- Check [discussions](https://github.com/yourusername/solana-checkers/discussions) for questions
- Read [docs.solana.com](https://docs.solana.com) for Solana help

## License

MIT - See [LICENSE.md](LICENSE.md)

---

**Note**: This is a decentralized application. All game logic and stake handling happens on the Solana blockchain. No central server is needed!