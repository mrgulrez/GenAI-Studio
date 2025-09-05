# GenAI Studio

GenAI Studio is a modern, AI-powered platform for creative professionals and developers. It enables users to generate images, music, and code using natural language prompts, powered by state-of-the-art AI models and a robust tech stack.

## Features

- **Text-to-Image Generation**: Create high-quality images from text using models like FLUX.1-dev, Stable Diffusion v1.5/2.1, and SDXL.
- **Text-to-Music Generation**: Compose music tracks from descriptions with Meta’s MusicGen models.
- **Text-to-Code Generation**: Generate code snippets from natural language using Meta’s Llama models.
- **Persistent Conversations**: Save, search, pin, and manage chat history locally.
- **Voice & Text Interaction**: Use speech recognition and text-to-speech for hands-free chat.
- **Quick Prompts & Tools**: Access suggestions, export/import conversations, and more.

## Tech Stack

- **Next.js** (React, SSR)
- **Tailwind CSS** (UI)
- **Prisma** (Database)
- **Clerk** (Authentication)
- **Stripe** (Payments)
- **Meta Llama, Flux, Stable Diffusion, MusicGen** (AI models)

## Getting Started

1. **Clone the repository**
	```sh
	git clone https://github.com/your-username/genai-studio.git
	cd genai-studio
	```
2. **Install dependencies**
	```sh
	npm install
	```
3. **Configure environment variables**
	- Copy `.env.example` to `.env.local` and fill in required keys (API, database, Stripe, Clerk, etc).
4. **Run the development server**
	```sh
	npm run dev
	```
5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## Usage

- Sign up or log in to access all features.
- Use the dashboard to interact with AI models for image, music, and code generation.
- Save, export, or import your conversations for future reference.
- Explore quick tools and tips in the sidebar for enhanced productivity.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

Please follow the code style and add tests where appropriate.

## License

This project is licensed under the MIT License.

## Credits

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Clerk](https://clerk.dev/)
- [Stripe](https://stripe.com/)
- [Meta AI](https://ai.meta.com/)

---

For questions or support, please open an issue or contact the maintainer.
