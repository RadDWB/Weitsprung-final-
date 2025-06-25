
export const metadata = {
  title: "Weitsprung Bewertung",
  description: "RadDWB Web-App zur Genauigkeitsmessung im Weitsprung",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
