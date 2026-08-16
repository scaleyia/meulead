import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compila os pacotes do monorepo (TS puro) no build de produção (Vercel).
  transpilePackages: ["@meulead/db", "@meulead/shared"],
};

export default nextConfig;
