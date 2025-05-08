# 🚀 Elevator Simulator

Elevator Simulator is a modular and scalable simulation system built with **React**, **TypeScript**, and **Vite**.  
It demonstrates Object-Oriented Programming principles and applies the **Factory Design Pattern** to manage elevator behavior and configuration.

> ⚙️ Designed to support multiple elevators and buildings with customizable setups.

---

## 📸 Preview

![Elevator Simulator Demo](./assets/demo.gif) <!-- תוכל לשים כאן קישור ל-GIF שמדגים את המערכת -->

[🔗 Live Demo on Netlify](https://your-netlify-link.netlify.app)

---

## 🧠 Features

- 🚪 Multiple elevators with individual logic and request queues
- ⏱️ ETA calculation and smart request assignment
- 🏢 Multi-building support (planned)
- 🧱 Factory design pattern for flexible elevator creation
- 🎨 Built with React + TypeScript + Vite for blazing fast performance

---

## 🏗️ Tech Stack

| Tech              | Purpose                                |
|-------------------|----------------------------------------|
| React             | UI framework                           |
| TypeScript        | Type-safe development                  |
| Vite              | Fast build tool                        |
| OOP & Design Patterns | Scalable architecture               |
| CSS Modules / Tailwind (if used) | Styling                 |

---

## 🚀 Getting Started

```bash
# 1. Clone the project
git clone https://github.com/shammaihamilton/elevator-simulator.git
cd elevator-simulator

# 2. Install dependencies
npm install

# 3. Run locally
npm run dev
```

---

## 📦 Build for Production

```bash
npm run build
```

The final static site will be output to the `dist/` directory. Ready to deploy on **Netlify**, **Vercel**, or any static hosting service.

---

## 🧪 Tests (optional)

If you use `vitest` or `jest`, include:

```bash
npm run test
```

---

## 🧱 Folder Structure

```
src/
├── components/          # Reusable React components
├── elevators/           # Elevator classes and logic
├── managers/            # ElevatorManager and factory logic
├── types/               # Shared TypeScript types and enums
├── App.tsx              # Root component
├── main.tsx             # Entry point
```

---

## 🧠 Design Patterns

The system implements:
- **Factory Pattern**: for dynamic creation of elevator instances.
- **OOP Principles**: encapsulation, inheritance, and separation of concerns.

---

## 📌 Roadmap

- [x] Handle multiple elevators
- [x] Direction-aware request routing
- [ ] Support for multiple buildings
- [ ] Floor request visualization
- [ ] Mobile UI support

---

## 🤝 Contributing

Pull requests are welcome!  
Feel free to open issues or suggest features.

---

## 📄 License

[MIT License](./LICENSE)

---

## 👤 Author

Built with ❤️ by [@shammaihamilton](https://github.com/shammaihamilton)