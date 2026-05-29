import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { getHomeRouteForRol } from "../../../lib/authRoutes";
import { useAuthStore } from "../../../store/authStore";
import type { LoginResponse } from "../../../types/auth";

interface LoginFormData {
  correo: string;
  contrasena: string;
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      const response = await apiClient.post<LoginResponse>("/auth/login", {
        correo: data.correo.trim(),
        contrasena: data.contrasena,
      });
      login(response);
      navigate(getHomeRouteForRol(response.rol), { replace: true });
    } catch (error) {
      const apiError = error as ApiError;
      setServerError(apiError.message || "No fue posible iniciar sesión");
    }
  };

  const inputBase =
    "rounded-md border px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] duration-150 font-sans bg-sky-50 border-sky-200 focus:border-sky-600 focus:ring-[3px] focus:ring-sky-500/35";

  return (
    <div className="w-full max-w-md box-border rounded-2xl border border-sky-200 bg-white p-8 px-10 shadow-[0_4px_6px_-1px_rgba(14,165,233,0.12),0_10px_25px_-5px_rgba(2,132,199,0.15)] sm:p-8 sm:px-10">
      <span className="text-base font-bold tracking-wider text-sky-600">SuperMercado</span>

      <h1 className="mt-2 mb-1 text-center font-sans text-2xl font-semibold text-sky-950">
        Iniciar Sesión
      </h1>
      <p className="mb-6 text-center font-sans text-sm text-slate-500">
        Ingresa tu correo y contraseña para continuar.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-sky-950" htmlFor="login-email">
            Correo electrónico
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="ejemplo@gmail.com"
            {...register("correo", {
              required: "El correo es requerido",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Correo no válido",
              },
            })}
            className={`${inputBase} w-full ${errors.correo ? "border-red-600 focus:border-red-600 focus:ring-red-500/35" : ""}`}
          />
          {errors.correo && (
            <span className="text-xs text-red-600">{errors.correo.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-sky-950" htmlFor="login-password">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("contrasena", {
                required: "La contraseña es requerida",
                minLength: { value: 1, message: "Ingresa tu contraseña" },
              })}
              className={`${inputBase} box-border w-full pr-10 ${errors.contrasena ? "border-red-600 focus:border-red-600 focus:ring-red-500/35" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center border-0 bg-transparent p-0 text-slate-500 hover:text-sky-950"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
          {errors.contrasena && (
            <span className="text-xs text-red-600">{errors.contrasena.message}</span>
          )}
        </div>

        {serverError && <span className="text-xs text-red-600">{serverError}</span>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 w-full cursor-pointer rounded-lg border-0 bg-gradient-to-b from-sky-500 to-sky-600 px-4 py-3 text-base font-semibold text-white shadow-[0_2px_8px_rgba(2,132,199,0.35)] transition-[filter,box-shadow,opacity] duration-150 hover:enabled:brightness-105 hover:enabled:shadow-[0_4px_14px_rgba(2,132,199,0.45)] disabled:cursor-not-allowed disabled:opacity-65"
        >
          {isSubmitting ? "Ingresando..." : "Continuar"}
        </button>
      </form>
    </div>
  );
}
