import { Outlet } from "react-router-dom";
import { NuevaVentaDraftProvider } from "../../context/NuevaVentaDraftContext";
import { Navbar } from "./Navbar/Navbar";

export default function Layout() {
  return (
    <NuevaVentaDraftProvider>
      <div data-app-shell className="flex min-h-svh min-h-dvh flex-col bg-white">
        <Navbar />
        <main className="relative z-[1] flex-1 w-full box-border bg-white px-8 pb-10 pt-7">
          <Outlet />
        </main>
      </div>
    </NuevaVentaDraftProvider>
  );
}
