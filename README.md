# VibeZora
Deployed link:
https://vercel.com/gabriels-projects-3c257adc/vibe-zora-frontend-dkwa
A crypto meme generator and Zora coin minting platform that lets you create AI-generated memes from your favorite cryptocurrencies and mint them as Zora coins.

## Features

- **AI Meme Generation**: Select crypto coins and generate creative memes using OpenAI's DALL-E and GPT-4V
- **Zora Coin Minting**: Mint your generated memes as Zora coins directly on-chain
- **Wallet Integration**: Connect your Web3 wallet via WalletConnect
- **Responsive UI**: Beautiful, modern UI built with Tailwind CSS and shadcn/ui

## Technologies

- **Frontend**: Next.js 14 with App Router
- **UI**: Tailwind CSS, shadcn/ui components
- **AI**: OpenAI (DALL-E 3, GPT-4 Vision)
- **Blockchain**: Zora Protocol, WalletConnect
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A WalletConnect Project ID
- An OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/VibeZoraFrontend.git
   cd VibeZoraFrontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the project root with the following variables:
   ```
   # WalletConnect
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
   
   # OpenAI API
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   
   # Zora API
   NEXT_PUBLIC_ZORA_API_URL=https://api-sdk.zora.engineering
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Generating Memes

1. Browse the available cryptocurrencies on the home page
2. Select one or more coins to include in your meme
3. Click "Create Meme" to generate an AI meme based on your selection
4. Optionally, provide a custom prompt to guide the meme generation

### Minting Zora Coins

1. After generating a meme, you'll see the option to mint it as a Zora coin
2. Connect your wallet if you haven't already
3. Configure your coin parameters (name and symbol will be pre-filled)
4. Click "Create Coin" to mint your meme as an on-chain Zora coin
5. Confirm the transaction in your wallet

## Development

### Project Structure

- `/app`: Next.js app router files
- `/components`: React components
- `/context`: React context providers
- `/lib`: Utility functions and API clients
  - `/image-generation-service.ts`: OpenAI integration for meme generation
  - `/zora-coins-api.ts`: Zora protocol integration
  - `/upload-service.ts`: Image upload and handling

### Testing Mode

For development without consuming OpenAI API credits, the image generation service includes a testing mode that returns a placeholder image after a 10-second delay.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for the Encode Club Hackathon
- Powered by Zora Protocol and OpenAI
- UI components from shadcn/ui 