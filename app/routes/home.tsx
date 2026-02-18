import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FullStack AI app" },
    { name: "description", content: "Fullstack AI App with React Router!" },
  ];
}

export default function Home() {
  return (
      <div className="Home">
        <Navbar />
        <h1 className="text-5xl text-indigo-700 font-medium">Home</h1>
      </div>
  )
}
