import LoginForm from "../../components/auth/LoginForm/LoginForm";
import bgImage from "../../assets/fondoSuper.jpg";

export default function LoginPage() {
  return (
    <div data-full-bleed-root className="relative flex min-h-svh w-full flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 z-0 scale-[1.05] bg-cover bg-center blur-md brightness-[0.92] saturate-110"
        style={{ backgroundImage: `url('${bgImage}')` }}
        aria-hidden
      />
      {/* overlay gradiente*/}
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-sky-100/80 via-sky-300/55 to-sky-500/35"
        aria-hidden
      />
      <div className="relative z-[2] flex min-h-svh w-full flex-1 items-center justify-center p-6 box-border">
        <LoginForm />
      </div>
    </div>
  );
}
