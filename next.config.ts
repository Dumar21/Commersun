import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let productImagePattern: { protocol: "https"; hostname: string; pathname: string } | undefined;

if (supabaseUrl) {
  const parsedUrl = new URL(supabaseUrl);
  if (parsedUrl.protocol === "https:") {
    productImagePattern = {
      protocol: "https",
      hostname: parsedUrl.hostname,
      pathname: "/storage/v1/object/public/productos/**",
    };
  }
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: productImagePattern ? [productImagePattern] : [],
  },
};

export default nextConfig;
