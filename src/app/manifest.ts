import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "مناسبات — سوق إعلانات المناسبات",
    short_name: "مناسبات",
    description: "كل ما يخص مناسبتك… في مكان واحد. أنشئ إعلانك أو اكتشف ما يناسبك.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#6D28D9",
    lang: "ar",
    dir: "rtl",
    orientation: "portrait-primary",
    icons: [
      { src: "/pwa-icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icons/512-maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
