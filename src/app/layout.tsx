import "../styles/globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import type { Metadata } from "next";

const icon = `<svg t="1755964996860" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16735" width="16" height="16"><path d="M748.544 486.4L556.032 821.248c-13.312 23.552 3.072 53.248 30.72 53.248H972.8c27.648 0 44.032-29.696 30.72-53.248L809.984 486.4c-13.312-23.552-48.128-23.552-61.44 0z" fill="#1296db" p-id="16736"></path><path d="M367.616 222.208L16.384 831.488c-13.312 23.552 3.072 53.248 30.72 53.248h703.488c27.648 0 44.032-29.696 30.72-53.248L429.056 222.208c-13.312-23.552-47.104-23.552-61.44 0z" fill="#1296db" p-id="16737"></path><path d="M722.944 163.84m-104.448 0a104.448 104.448 0 1 0 208.896 0 104.448 104.448 0 1 0-208.896 0Z" fill="#1296db" p-id="16738"></path></svg>`
const iconUrl = "data:image/svg+xml;base64," + btoa(icon);
export const metadata: Metadata = {
  title: "EsImg",
  description: "Easy Image Hosting Service",
  keywords: "image hosting, file upload",
  icons: iconUrl,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}